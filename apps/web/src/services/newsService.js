import { requestJSON, ApiError } from './apiClient';
import { DEMO_MODE, LIVE_API_BASE } from './config';
import { cleanText, safeUrl, isoDate, arr } from '../utils/safe';
import { readStorage, writeStorage } from '../utils/storage';
import { readCache } from './liveCache';
import { newsCategories } from '../data/newsCategories';

const VALID = newsCategories.map((c) => c.id);

function normalize(it) {
  const title = cleanText(it?.title, 220);
  const url = safeUrl(it?.url);
  if (!title || !url) return null;
  return {
    id: cleanText(it.id, 40) || url,
    title,
    description: cleanText(it.description, 320),
    url,
    source: cleanText(it.source, 60) || 'Unknown source',
    publishedAt: isoDate(it.publishedAt),
    image: safeUrl(it.image),
    category: cleanText(it.category, 20),
    region: cleanText(it.region, 20),
  };
}

/** Latest articles for a category. Never invents items: errors propagate to the UI. */
export async function getNews(category = 'latest') {
  const cat = VALID.includes(category) ? category : 'latest';
  if (DEMO_MODE) {
    const { demoNews } = await import('./demo/fixtures');
    return { data: demoNews(cat), meta: { source: 'Demo data', demo: true, realtime: false } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/news?category=${encodeURIComponent(cat)}`, { timeoutMs: 15000 });
  if (!Array.isArray(body?.items)) throw new ApiError('Unexpected news response.', 200, 'invalid');
  const items = body.items.map(normalize).filter(Boolean);
  const okSources = arr(body.sources).filter((s) => s.ok).map((s) => cleanText(s.source, 60));
  return {
    data: items,
    meta: { source: okSources.join(', ') || 'News feeds', dataAsOf: isoDate(body.fetchedAt), realtime: false, failedSources: arr(body.sources).filter((s) => !s.ok).map((s) => cleanText(s.source, 60)) },
  };
}

/** Articles published within `minutes` (used for the "Breaking" strip). */
export const recentOnly = (items, minutes = 60) => items.filter((i) => i.publishedAt && Date.now() - new Date(i.publishedAt).getTime() < minutes * 60_000);

const STOP = new Set('the a an and or of to in on for with at by from as is are was were be been after over into about new says said amid will its it this that his her their more than up out not how why what who has have had can may could would nepal nepali world news us uk year years day week first two three says'.split(' '));
/** Words appearing across the most distinct headlines — a transparent "Trending" signal. */
export function trendingTopics(items, limit = 10) {
  const counts = new Map();
  items.forEach((it) => {
    const words = new Set(it.title.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)));
    words.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  });
  return [...counts.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count }));
}

/* "Most read" is based only on stories opened on this device (no tracking). */
const READ_KEY = 'news:reads';
export function recordRead(item) {
  const reads = readStorage(READ_KEY, {});
  const prev = reads[item.url] || { n: 0 };
  reads[item.url] = { n: prev.n + 1, title: item.title, source: item.source, url: item.url, at: Date.now() };
  const entries = Object.entries(reads).sort((a, b) => b[1].at - a[1].at).slice(0, 100);
  writeStorage(READ_KEY, Object.fromEntries(entries));
}
export function getMostRead(limit = 5) {
  return Object.values(readStorage(READ_KEY, {})).sort((a, b) => b.n - a.n || b.at - a.at).slice(0, limit);
}

/** Headlines cached by the live system — used by global search (no extra network calls). */
export function cachedHeadlines() {
  const seen = new Set();
  return newsCategories.flatMap((c) => arr(readCache(`news:${c.id}`)?.data)).filter((i) => i?.url && !seen.has(i.url) && seen.add(i.url));
}
