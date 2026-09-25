/**
 * Builds seed records from the web app's existing data files, so the database starts
 * with exactly the content the site already shows. PURE: no database access here,
 * which lets `npm run seed:check` verify everything without PostgreSQL.
 */
// Web data (plain ESM JS, shared with the frontend — not duplicated).
import { destinations, EXPERIENCES } from '../../../web/src/data/nepalPlaces.js';
import { hiddenGems } from '../../../web/src/data/hiddenGems.js';
import { programs } from '../../../web/src/data/programs/index.js';
import { subjects } from '../../../web/src/data/subjects/index.js';
import { notes, noteCategories } from '../../../web/src/data/notes/index.js';
import { courses } from '../../../web/src/data/courses.js';
import { quizQuestions, quizCategories } from '../../../web/src/data/quizQuestions.js';
import { paragraphs, codeSnippets } from '../../../web/src/data/typingTexts.js';
import { typingLessons } from '../../../web/src/data/typingLessons.js';
import { nationalContacts } from '../../../web/src/data/emergencyContacts.js';
import { footballLeagues } from '../../../web/src/data/sportsConfig.js';
import { bsFixedEvents } from '../../../web/src/data/festivals.js';
import { bsToAd } from '../../../web/src/utils/nepaliDate.js';
import { slugify } from '../../../../packages/shared/src/contact.ts';

type Any = Record<string, any>;
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const para = (s?: string) => (s ? s.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('') : '');
const list = (items?: unknown[]) => (items?.length ? `<ul>${items.map((i) => `<li>${esc(typeof i === 'string' ? i : JSON.stringify(i))}</li>`).join('')}</ul>` : '');

/** "3h 20m" / "12 min" → minutes */
export function parseMinutes(s?: string | null): number | null {
  if (!s) return null;
  const h = /(\d+)\s*h/.exec(s); const m = /(\d+)\s*m/.exec(s);
  const total = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return total || null;
}
const DIFF: Record<string, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'> = { beginner: 'BEGINNER', intermediate: 'INTERMEDIATE', advanced: 'ADVANCED' };

// ───────────────────────── Site & RBAC ─────────────────────────
export const siteSettings = {
  id: 1, siteName: 'HimalayaHub', tagline: 'Learn • Explore • Discover',
  secondaryTagline: 'Your gateway to knowledge, Nepal, travel, technology and the world.',
  description: 'A modern digital platform connecting learning, technology, Nepal, travel and everyday information.',
  whatsappNumber: '+977 9863903703', whatsappMessage: 'Hello HimalayaHub, I need some help.',
  defaultMetaTitle: 'HimalayaHub — Learn • Explore • Discover Nepal',
  defaultMetaDescription: 'HimalayaHub is a modern platform for learning, Nepal travel discovery, live news, sports, weather, markets and useful student tools.',
  defaultOgImage: '/og-image.png',
};

// ───────────────────────── Destinations ─────────────────────────
const CATEGORY_DEFS = [
  ['mountains', 'Mountains', '🏔'], ['lakes', 'Lakes', '🌊'], ['adventure', 'Adventure', '🥾'], ['culture', 'Culture', '🏛'],
  ['heritage', 'Heritage', '🛕'], ['wildlife', 'Wildlife', '🐘'], ['religious', 'Religious', '☸️'], ['nature', 'Nature', '🌳'],
  ['photography', 'Photography', '📸'], ['peaceful', 'Peaceful', '🧘'], ['sunrise', 'Sunrise', '🌅'],
] as const;
export const destinationCategories = CATEGORY_DEFS.map(([slug, name, emoji], i) => ({ slug, name, emoji, sortOrder: i }));
/** Factual extra categories not expressed as tags in v3 data. */
const EXTRA_CATS: Record<string, string[]> = {
  chitwan: ['wildlife'], lumbini: ['religious', 'heritage'], janakpur: ['religious', 'heritage'], gosaikunda: ['religious'],
  'kathmandu-valley': ['heritage', 'religious'], bandipur: ['heritage'], mustang: ['heritage'],
};
const tagCats = new Set(destinationCategories.map((c) => c.slug));
export const destinationRecords = (destinations as Any[]).map((d, i) => ({
  slug: d.id, name: d.name, tagline: d.tagline, shortDescription: d.tagline, knownFor: d.knownFor,
  description: `${d.name} is known for ${d.knownFor}.`,
  province: d.province, zone: d.zone, latitude: d.lat, longitude: d.lon,
  bestTimeToVisit: d.bestTime, typicalDuration: d.duration, gettingThere: d.travel,
  activities: d.activities ?? [], nearbyAttractions: d.nearbyAttractions ?? [], travelTips: d.tips ?? [], safetyInformation: d.safety ?? [],
  isMountainArea: Boolean(d.mountain), isViewDependent: Boolean(d.viewDependent), isFeatured: Boolean(d.featured), sortOrder: i,
  status: 'PUBLISHED' as const,
  metaTitle: `${d.name}, Nepal — travel guide & weather | HimalayaHub`.slice(0, 70),
  metaDescription: `${d.tagline} Best time to visit, things to do, travel tips and live weather for ${d.name}.`.slice(0, 170),
  categorySlugs: [...new Set([...(d.tags ?? []).filter((t: string) => tagCats.has(t)), ...(EXTRA_CATS[d.id] ?? [])])],
  nearbySlugs: d.nearby ?? [],
  images: (d.photos ?? []).map((p: Any, k: number) => ({ commonsFile: p.file ?? null, imageUrl: p.src ?? null, altText: p.alt, caption: p.alt, credit: p.credit ?? null, sortOrder: k })),
}));
export const EXPERIENCE_IDS = (EXPERIENCES as Any[]).map((e) => e.id);

// ───────────────────────── Academics ─────────────────────────
export const universities = [
  { slug: 'tribhuvan-university', name: 'Tribhuvan University', shortName: 'TU', website: 'https://tu.edu.np/' },
];
/** v3 programmes → Program + Semester + SemesterSubject. University is left for admins to confirm per programme. */
export const programRecords = (programs as Any[]).map((p, i) => ({
  code: p.id, slug: p.id, name: p.name, fullName: p.full, blurb: p.blurb, sortOrder: i, durationYears: Math.ceil(p.semesters.length / 2),
  semesters: (p.semesters as unknown[][]).map((subs, s) => ({
    number: s + 1, name: `Semester ${s + 1}`,
    subjects: subs.map((x, k) => (typeof x === 'string' ? { slug: x, displayTitle: null, sortOrder: k } : { slug: (x as Any).id, displayTitle: (x as Any).title ?? null, sortOrder: k })),
  })),
}));
export const subjectRecords = (subjects as Any[]).map((s) => {
  const { id, title, short, icon, overview, ...rest } = s;
  return { slug: id, code: short ?? null, title, icon: icon ?? null, description: overview ?? null, content: rest };
});
export const noteCategoryRecords = (noteCategories as Any[]).map((c, i) => ({ slug: c.id, name: c.name, icon: c.icon ?? null, sortOrder: i }));
export const noteRecords = (notes as Any[]).map((n) => ({
  slug: n.id, title: n.title, summary: n.summary, categorySlug: n.category, tags: n.tags ?? [],
  content: `${para(n.explanation)}${n.keyPoints?.length ? `<h2>Key points</h2>${list(n.keyPoints)}` : ''}${n.examples?.length ? `<h2>Examples</h2>${list(n.examples)}` : ''}${n.revision ? `<h2>Quick revision</h2>${para(typeof n.revision === 'string' ? n.revision : '')}${Array.isArray(n.revision) ? list(n.revision) : ''}` : ''}`,
  structured: n, status: 'PUBLISHED' as const,
  metaTitle: `${n.title} — IT notes | HimalayaHub`.slice(0, 70), metaDescription: String(n.summary ?? '').slice(0, 170),
}));

// ───────────────────────── Courses & quizzes ─────────────────────────
export const courseRecords = (courses as Any[]).map((c) => ({
  slug: c.id, title: c.title, description: c.description, color: c.color, icon: c.icon, instructorName: c.instructor,
  difficulty: DIFF[String(c.difficulty).toLowerCase()] ?? 'BEGINNER', durationMinutes: parseMinutes(c.duration), status: 'PUBLISHED' as const,
  isFree: true, quizSlug: c.quizCategory ? `quiz-${c.quizCategory}` : null,
  metaTitle: `${c.title} — free course | HimalayaHub`.slice(0, 70), metaDescription: String(c.description ?? '').slice(0, 170),
  lessons: (c.lessons as Any[]).map((l, k) => ({
    slug: l.id, title: l.title, content: l.content, practice: l.practice ?? [], videoUrl: l.videoUrl ?? null,
    durationMinutes: parseMinutes(l.duration), relatedNoteSlug: l.relatedNoteId ?? null, sortOrder: k, isPublished: true,
  })),
}));
export const quizRecords = (quizCategories as Any[]).filter((c) => c.id !== 'all').map((c) => ({
  slug: `quiz-${c.id}`, title: `${c.name ?? c.label} quiz`, category: c.id, status: 'PUBLISHED' as const,
  questions: (quizQuestions as Any[]).filter((q) => q.category === c.id).map((q, k) => ({
    type: q.options.length === 2 && q.options.every((o: string) => /^(true|false)$/i.test(o)) ? 'TRUE_FALSE' as const : 'MCQ' as const,
    prompt: q.question, explanation: q.explanation ?? null, sortOrder: k,
    options: (q.options as string[]).map((text, j) => ({ text, isCorrect: j === q.answer, sortOrder: j })),
  })),
})).filter((q) => q.questions.length);

// ───────────────────────── Typing ─────────────────────────
export const typingRecords = [
  ...Object.entries(paragraphs as Record<string, string[]>).flatMap(([level, texts]) => texts.map((text, i) => ({
    slug: `para-${level}-${i + 1}`, title: `${level[0]!.toUpperCase()}${level.slice(1)} paragraph ${i + 1}`, text, difficulty: DIFF[level] ?? 'BEGINNER', category: 'test', durationSec: 60,
  }))),
  ...Object.entries(codeSnippets as Record<string, string[]>).flatMap(([level, texts]) => texts.map((text, i) => ({
    slug: `code-${level}-${i + 1}`, title: `Code ${level} ${i + 1}`, text, difficulty: DIFF[level] ?? 'BEGINNER', category: 'code', durationSec: 60,
  }))),
  ...(typingLessons as Any[]).map((l, i) => ({ slug: `lesson-${l.id}`, title: l.title, text: l.text, difficulty: (i < 4 ? 'BEGINNER' : i < 8 ? 'INTERMEDIATE' : 'ADVANCED') as 'BEGINNER', category: 'lesson', lessonNumber: i + 1, durationSec: null })),
];

// ───────────────────────── Emergency ─────────────────────────
export const emergencyRecords = (nationalContacts as Any[]).map((c, i) => ({
  key: c.id, serviceName: c.service, category: c.category, phone: c.number ?? null, availability: c.availability, note: c.note,
  officialWebsite: c.link?.url ?? null, source: c.source, sourceUrl: c.sourceUrl ?? null, lastVerified: new Date(`${c.verifiedOn}T00:00:00Z`),
  isPrimary: Boolean(c.primary), isVerified: true, isActive: true, sortOrder: i,
}));

// ───────────────────────── Sports (configuration only — no scores) ─────────────────────────
export const sports = [{ slug: 'football', name: 'Football' }, { slug: 'cricket', name: 'Cricket' }];
export const leagueRecords = [
  ...(footballLeagues as Any[]).map((l, i) => ({ slug: slugify(l.name), name: l.name, sport: 'football', country: l.country, provider: 'football-data', externalId: l.code, refreshSeconds: 300, displayOrder: i, isActive: true })),
  { slug: 'nepal-premier-league', name: 'Nepal Premier League', sport: 'cricket', country: 'Nepal', provider: 'cricketdata', externalId: null, refreshSeconds: 600, displayOrder: 0, isActive: true },
];
export const competitionRecords = [{ leagueSlug: 'nepal-premier-league', name: 'Nepal Premier League', season: null as string | null }];

// ───────────────────────── News taxonomy & sources ─────────────────────────
export const newsCategoryRecords = ['Nepal', 'World', 'Business', 'Technology', 'Education', 'Science', 'Health', 'Entertainment', 'Sports', 'Football', 'Cricket', 'Weather']
  .map((name, i) => ({ name, slug: slugify(name), sortOrder: i }));

// ───────────────────────── Holidays (fixed BS dates, next two BS years) ─────────────────────────
export function holidayRecords(bsYears: number[]) {
  return bsYears.flatMap((y) => (bsFixedEvents as Any[]).flatMap((e) => {
    try {
      const ad = bsToAd(y, e.month, e.day) as { year: number; month: number; day: number };
      return [{ name: e.name, date: new Date(Date.UTC(ad.year, ad.month - 1, ad.day)), bsDate: `${y}-${String(e.month).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`, calendarType: 'BS' as const, isPublicHoliday: Boolean(e.holiday), source: 'Fixed BS observance (HimalayaHub calendar data)' }];
    } catch { return []; }
  }));
}

// ───────────────────────── Development-only demo content ─────────────────────────
/** Clearly labelled demo articles. Seeded only when SEED_DEMO=true and never in production. */
export const demoNews = [1, 2, 3].map((n) => ({
  slug: `demo-article-${n}`, title: `[DEMO] Sample article ${n} for layout testing`, isDemo: true, status: 'PUBLISHED' as const,
  summary: 'DEMO DATA — placeholder text to preview the news layout. Not a real news story.',
  content: '<p><strong>DEMO DATA.</strong> This is placeholder content created by the development seed. It is not real news.</p>',
  categorySlug: n === 1 ? 'nepal' : n === 2 ? 'technology' : 'world', authorName: 'HimalayaHub Demo', sourceName: 'Demo seed',
}));

/** Publishers currently used by the live news proxy (Phase 11 makes this table its source of truth). */
export const newsSourceRecords = [
  { name: 'The Kathmandu Post', url: 'https://kathmandupost.com/', rssUrl: 'https://kathmandupost.com/rss', region: 'nepal' },
  { name: 'Onlinekhabar English', url: 'https://english.onlinekhabar.com/', rssUrl: 'https://english.onlinekhabar.com/feed', region: 'nepal' },
  { name: 'BBC News', url: 'https://www.bbc.com/news', rssUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml', region: 'world' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'world' },
  { name: 'The Verge', url: 'https://www.theverge.com/', rssUrl: 'https://www.theverge.com/rss/index.xml', region: 'world' },
  { name: 'BBC Sport', url: 'https://www.bbc.com/sport', rssUrl: 'https://feeds.bbci.co.uk/sport/rss.xml', region: 'world' },
  { name: 'ESPNcricinfo', url: 'https://www.espncricinfo.com/', rssUrl: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', region: 'world' },
];

/** Default provider configuration (non-secret). Keys stay in env vars; only their NAMES are stored. */
export const apiSettingRecords = [
  { service: 'NEWS', provider: 'rss', refreshSeconds: 600, secretEnvVar: null },
  { service: 'WEATHER', provider: 'open-meteo', baseUrl: 'https://api.open-meteo.com/v1/forecast', refreshSeconds: 900, secretEnvVar: null },
  { service: 'SPORTS_FOOTBALL', provider: 'football-data', baseUrl: 'https://api.football-data.org/v4', refreshSeconds: 300, secretEnvVar: 'FOOTBALL_DATA_API_KEY', options: { competitions: ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL', 'EL'], liveRefreshSeconds: 60 } },
  { service: 'SPORTS_CRICKET', provider: 'cricketdata', baseUrl: 'https://api.cricapi.com/v1', refreshSeconds: 600, secretEnvVar: 'CRICKETDATA_API_KEY', options: { liveRefreshSeconds: 120 } },
  { service: 'CRYPTO', provider: 'coingecko', baseUrl: 'https://api.coingecko.com/api/v3', refreshSeconds: 120, secretEnvVar: null },
  { service: 'NEPSE', provider: 'custom', refreshSeconds: 1800, secretEnvVar: 'NEPSE_API_KEY', options: { marketHoursRefreshSeconds: 60 } },
  { service: 'CURRENCY', provider: 'open-er-api', baseUrl: 'https://open.er-api.com/v6/latest', refreshSeconds: 3600, secretEnvVar: null },
] as const;

// ───────────────────────── v5: Hidden Gems of Eastern Nepal ─────────────────────────
/** Seeded as PUBLISHED with guide.verifiedAt empty; the site labels them "not yet verified". */
export const hiddenGemRecords = (hiddenGems as Any[]).map((g) => ({
  slug: g.slug, name: g.name, tagline: g.tagline, shortDescription: g.tagline, knownFor: g.tagline,
  description: (g.story ?? []).map((x: Any) => x.text).join('\n\n') || null,
  province: g.province, district: g.district, zone: (g.elevationM ?? 0) >= 3000 ? 'himalaya' : 'hill',
  latitude: g.lat, longitude: g.lon, region: 'eastern', elevationM: g.elevationM ?? null, difficulty: g.difficulty ?? null,
  distanceFromKtmKm: g.distanceFromKtmKm ?? null, isHiddenGem: true, hiddenGemRank: g.rank,
  bestTimeToVisit: g.bestTime ?? null, gettingThere: g.travel?.howToReach ?? null,
  activities: g.activities ?? [], travelTips: [], safetyInformation: g.safety ?? [], nearbyAttractions: [],
  isMountainArea: (g.elevationM ?? 0) >= 3000, status: 'PUBLISHED' as const, sortOrder: 100 + g.rank,
  metaTitle: `${g.name} — hidden gem of Eastern Nepal | HimalayaHub`.slice(0, 70),
  metaDescription: g.tagline.slice(0, 170),
  categorySlugs: (g.tags ?? []) as string[],
  images: (g.photos ?? []).map((p: Any, k: number) => ({ commonsFile: p.file, imageUrl: null, altText: p.alt, caption: p.alt, credit: null, sortOrder: k })),
  guide: {
    story: g.story, culture: g.culture, travel: g.travel, adventure: { ...(g.adventure ?? {}), wildlife: g.wildlife, camping: g.camping ?? g.adventure?.camping },
    tourism: g.tourism, permits: g.permits, costs: g.costs, localGuides: g.localGuides,
  },
}));

export const communityRecords = [
  { slug: 'travel', name: 'Travel', icon: '🧭', description: 'Trip planning, routes, transport and stays across Nepal.' },
  { slug: 'trekking', name: 'Trekking', icon: '🥾', description: 'Trail conditions, permits, gear and trip reports.' },
  { slug: 'sports', name: 'Sports', icon: '🏏', description: 'Cricket, football and everything in between.' },
  { slug: 'food', name: 'Food', icon: '🥟', description: 'Momo spots, local dishes, recipes and street food.' },
  { slug: 'nepal-news', name: 'Nepal News', icon: '📰', description: 'Discuss the news — link to the original source.' },
  { slug: 'foreign-travelers', name: 'Foreign Travelers', icon: '🌏', description: 'Visas, SIM cards, money, culture — ask anything about visiting Nepal.' },
].map((c, i) => ({ ...c, sortOrder: i, rules: [
  'Be kind. No harassment, hate or personal attacks.',
  'Never post someone’s phone number, address or photo without consent.',
  'No advertising or paid promotion.',
  'Stay on topic and link to sources for news.',
] }));
