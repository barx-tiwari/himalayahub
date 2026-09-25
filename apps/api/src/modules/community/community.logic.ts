/**
 * Pure community logic — no database, no Express — so it is fully unit-tested.
 *  - aliasFor:   anonymous, per-community pseudonyms
 *  - hotRank:    Reddit-style "hot" ordering
 *  - spamScore:  cheap heuristics that hold suspicious content for review (not a verdict)
 */
import { createHmac } from 'node:crypto';

const ADJECTIVES = [
  'Amber', 'Brave', 'Calm', 'Misty', 'Swift', 'Quiet', 'Golden', 'Silver', 'Wild', 'Gentle', 'Bold', 'Bright',
  'Snowy', 'Sunny', 'Windy', 'Rocky', 'Frosty', 'Lucky', 'Clever', 'Cosy', 'Dusky', 'Eager', 'Lofty', 'Merry',
  'Nimble', 'Rapid', 'Steady', 'Wandering', 'Hidden', 'Rustic', 'Velvet', 'Crimson', 'Azure', 'Jade', 'Humble', 'Keen',
] as const;
const NOUNS = [
  'Yak', 'Danfe', 'Rhododendron', 'Himal', 'Panda', 'Tahr', 'Leopard', 'Eagle', 'Rhino', 'Tiger', 'Pheasant', 'Crane',
  'Sherpa', 'Porter', 'Trekker', 'Nomad', 'Pilgrim', 'Traveller', 'Glacier', 'Ridge', 'River', 'Lake', 'Pass', 'Valley',
  'Stupa', 'Prayerflag', 'Momo', 'Chiya', 'Kukri', 'Madal', 'Sarangi', 'Bhanjyang', 'Pokhari', 'Deurali', 'Lekh', 'Tar',
] as const;

/**
 * Deterministic pseudonym for one user inside one community, e.g. "Misty-Danfe-4821".
 * Stable within the community (conversations stay readable); different in every other
 * community, so posts can't be linked across communities. Without the secret the alias
 * cannot be reversed to a user id.
 */
export function aliasFor(secret: string, userId: string, communityId: string): string {
  const h = createHmac('sha256', secret).update(`alias:v1:${userId}:${communityId}`).digest();
  const adj = ADJECTIVES[h.readUInt16BE(0) % ADJECTIVES.length];
  const noun = NOUNS[h.readUInt16BE(2) % NOUNS.length];
  const num = (h.readUInt32BE(4) % 9000) + 1000;
  return `${adj}-${noun}-${num}`;
}

const EPOCH = Date.UTC(2026, 0, 1) / 1000;
/**
 * "Hot" rank: log10 of net votes plus a time term, so a post needs ~10x the votes
 * to outrank one posted 12.5 hours later. Stored on the row so listings are a single
 * indexed ORDER BY; recomputed on each vote.
 */
export function hotRank(upvotes: number, downvotes: number, createdAt: Date): number {
  const s = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(s), 1));
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0;
  const seconds = createdAt.getTime() / 1000 - EPOCH;
  return Math.round((sign * order + seconds / 45_000) * 1e7) / 1e7;
}

/** Applies a vote change to counters. `prev` / `next` are -1, 0 or +1. */
export function applyVote(counts: { upvotes: number; downvotes: number }, prev: number, next: number) {
  let { upvotes, downvotes } = counts;
  if (prev === 1) upvotes -= 1; else if (prev === -1) downvotes -= 1;
  if (next === 1) upvotes += 1; else if (next === -1) downvotes += 1;
  upvotes = Math.max(0, upvotes); downvotes = Math.max(0, downvotes);
  return { upvotes, downvotes, score: upvotes - downvotes };
}

const PHONE = /(?:\+?977[\s-]?)?\b9[678]\d[\s-]?\d{3}[\s-]?\d{4}\b/; // Nepali mobile numbers
const EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/;
const URL_G = /https?:\/\/[^\s)]+/gi;
const SPAM_WORDS = /\b(whats\s?app\s+me|dm\s+for\s+price|cheap\s+(?:hotel|ticket|visa)s?|guaranteed\s+(?:visa|profit|returns?)|earn\s+\$?\d+\s*(?:per|a)\s*day|crypto\s+signal|casino|betting\s+tips?|loan\s+approved|click\s+here|free\s+followers)\b/i;

export interface SpamInput { title?: string; body: string; linkUrl?: string | null; accountAgeHours: number; emailVerified: boolean; recentPostsLastHour: number; duplicateOfRecent: boolean }
export interface SpamResult { score: number; reasons: string[]; hold: boolean; personalInfo: boolean }

/**
 * Heuristic spam/abuse score in [0, 1]. At >= 0.6 the item is held as PENDING for a
 * moderator instead of being published. Also flags contact details, because on an
 * anonymous board they are usually either spam or someone doxxing a third person.
 */
export function spamScore(i: SpamInput): SpamResult {
  const text = `${i.title ?? ''}\n${i.body}`;
  const reasons: string[] = []; let score = 0;
  const links = (text.match(URL_G) || []).length + (i.linkUrl ? 1 : 0);
  if (links >= 3) { score += 0.35; reasons.push('many links'); } else if (links >= 1 && i.accountAgeHours < 24) { score += 0.25; reasons.push('link from new account'); }
  if (SPAM_WORDS.test(text)) { score += 0.45; reasons.push('promotional phrases'); }
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (letters.length > 30 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) { score += 0.2; reasons.push('mostly capitals'); }
  if (/(.)\1{9,}/.test(text)) { score += 0.15; reasons.push('repeated characters'); }
  if (i.duplicateOfRecent) { score += 0.5; reasons.push('duplicate of a recent post'); }
  if (i.recentPostsLastHour >= 5) { score += 0.3; reasons.push('posting very fast'); }
  if (!i.emailVerified) { score += 0.1; reasons.push('email not verified'); }
  if (i.accountAgeHours < 1) { score += 0.1; reasons.push('brand-new account'); }
  const personalInfo = PHONE.test(text) || EMAIL.test(text);
  if (personalInfo) { score += 0.3; reasons.push('contains a phone number or email'); }
  score = Math.min(1, Math.round(score * 100) / 100);
  return { score, reasons, hold: score >= 0.6, personalInfo };
}

/** Normalises text for duplicate detection (case, whitespace, punctuation). */
export const fingerprint = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().slice(0, 500);

/** Builds a nested comment tree from a flat, createdAt-ordered list. */
export function buildTree<T extends { id: string; parentId: string | null }>(rows: T[]): (T & { replies: unknown[] })[] {
  const byId = new Map<string, T & { replies: (T & { replies: unknown[] })[] }>();
  rows.forEach((r) => byId.set(r.id, { ...r, replies: [] }));
  const roots: (T & { replies: unknown[] })[] = [];
  byId.forEach((node) => {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.replies.push(node); else roots.push(node);
  });
  return roots;
}

export const MAX_COMMENT_DEPTH = 6;
