import { requestJSON, ApiError } from './apiClient';
import { DEMO_MODE, LIVE_API_BASE } from './config';
import { arr, isoDate } from '../utils/safe';

const LIVE = ['IN_PLAY', 'PAUSED', 'LIVE'];
export const isMatchLive = (m) => LIVE.includes(m.status);

export function matchStatus(m) {
  switch (m.status) {
    case 'IN_PLAY': case 'LIVE': return { label: 'Live', tone: 'live' };
    case 'PAUSED': return { label: 'Half-time', tone: 'live' };
    case 'FINISHED': case 'AWARDED': return { label: 'Full-time', tone: 'done' };
    case 'POSTPONED': return { label: 'Postponed', tone: 'off' };
    case 'SUSPENDED': return { label: 'Suspended', tone: 'off' };
    case 'CANCELLED': return { label: 'Cancelled', tone: 'off' };
    default: return { label: 'Scheduled', tone: '' };
  }
}

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Date windows in the viewer's local calendar, widened by a day for UTC edge cases then filtered client-side. */
export function dateRange(preset, customDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const add = (n) => new Date(today.getTime() + n * 86_400_000);
  if (preset === 'tomorrow') return { from: add(1), to: add(1) };
  if (preset === 'week') return { from: today, to: add(6) };
  if (preset === 'date' && customDate) { const d = new Date(`${customDate}T00:00:00`); return { from: d, to: d }; }
  if (preset === 'recent') return { from: add(-3), to: today };
  return { from: today, to: today };
}

export async function getFootballMatches({ competition = 'ALL', from, to }) {
  if (DEMO_MODE) {
    const { demoMatches } = await import('./demo/fixtures');
    return { data: demoMatches(), meta: { source: 'Demo data', demo: true } };
  }
  // Ask the API for one extra day each side (UTC vs local date), then filter by local day.
  const qFrom = ymd(new Date(from.getTime() - 86_400_000));
  const qTo = ymd(new Date(to.getTime() + 86_400_000));
  const body = await requestJSON(`${LIVE_API_BASE}/football?resource=matches&competition=${encodeURIComponent(competition)}&dateFrom=${qFrom}&dateTo=${qTo}`);
  if (!Array.isArray(body?.matches)) throw new ApiError('Unexpected football response.', 200, 'invalid');
  const end = new Date(to.getTime() + 86_400_000);
  const matches = body.matches.filter((m) => { const d = new Date(m.utcDate); return d >= from && d < end; });
  return { data: matches, meta: { source: body.source, sourceUrl: body.sourceUrl, dataAsOf: isoDate(body.fetchedAt), realtime: matches.some(isMatchLive) } };
}

export async function getStandings(code) {
  if (DEMO_MODE) {
    const { demoStandings } = await import('./demo/fixtures');
    return { data: demoStandings(), meta: { source: 'Demo data', demo: true } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/football?resource=standings&competition=${encodeURIComponent(code)}`);
  return { data: arr(body?.table), meta: { source: body.source, sourceUrl: body.sourceUrl, dataAsOf: isoDate(body.fetchedAt), realtime: false } };
}

export async function getF1() {
  if (DEMO_MODE) {
    const { demoF1 } = await import('./demo/fixtures');
    return { data: demoF1(), meta: { source: 'Demo data', demo: true } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/f1`);
  return { data: { next: body.next || null, last: body.last || null, standings: arr(body.standings) }, meta: { source: body.source, sourceUrl: body.sourceUrl, dataAsOf: isoDate(body.fetchedAt), realtime: false } };
}
