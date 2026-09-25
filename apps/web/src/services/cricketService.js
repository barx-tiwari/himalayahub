import { requestJSON, ApiError } from './apiClient';
import { DEMO_MODE, LIVE_API_BASE } from './config';
import { arr, isoDate } from '../utils/safe';
import { NATIONAL_TEAMS, T20_LEAGUE_PATTERNS } from '../data/sportsConfig';

export const isCricketLive = (m) => m.started && !m.ended;

export async function getCricketMatches() {
  if (DEMO_MODE) {
    const { demoCricket } = await import('./demo/fixtures');
    return { data: demoCricket(), meta: { source: 'Demo data', demo: true } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/cricket?resource=current`);
  if (!Array.isArray(body?.matches)) throw new ApiError('Unexpected cricket response.', 200, 'invalid');
  return { data: body.matches, meta: { source: body.source, sourceUrl: body.sourceUrl, dataAsOf: isoDate(body.fetchedAt), realtime: body.matches.some(isCricketLive) } };
}

export async function getNpl() {
  if (DEMO_MODE) {
    const { demoNpl } = await import('./demo/fixtures');
    return { data: demoNpl(), meta: { source: 'Demo data', demo: true } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/cricket?resource=npl`);
  return {
    data: { series: body.series || null, live: arr(body.live), upcoming: arr(body.upcoming), completed: arr(body.completed) },
    meta: { source: body.source, sourceUrl: body.sourceUrl, dataAsOf: isoDate(body.fetchedAt), realtime: arr(body.live).length > 0 },
  };
}

export function classify(m) {
  const tags = new Set([m.matchType]);
  const name = m.name || '';
  if (T20_LEAGUE_PATTERNS.some((re) => re.test(name))) tags.add('leagues');
  else if (m.teams.length === 2 && m.teams.every((t) => NATIONAL_TEAMS.includes(t))) tags.add('international');
  else tags.add('domestic');
  return tags;
}

/** Overs like 11.2 mean 11 overs + 2 balls. */
export const oversToBalls = (o) => (Number.isFinite(o) ? Math.floor(o) * 6 + Math.round((o % 1) * 10) : null);
export const runRate = (r, o) => { const b = oversToBalls(o); return b ? (r / b) * 6 : null; };

/**
 * For a limited-overs chase, computes target and required rate from the
 * provider's own innings data. Returns null when it can't be derived safely.
 */
export function chaseInfo(m) {
  const maxOvers = m.matchType === 't20' ? 20 : m.matchType === 'odi' ? 50 : null;
  if (!maxOvers || m.score.length !== 2 || m.ended) return null;
  const [first, second] = m.score;
  if (first.r == null || second.r == null || second.o == null) return null;
  const target = first.r + 1;
  const need = target - second.r;
  const ballsLeft = maxOvers * 6 - oversToBalls(second.o);
  if (need <= 0 || ballsLeft <= 0) return { target, need: Math.max(0, need), ballsLeft: Math.max(0, ballsLeft), rrr: null };
  return { target, need, ballsLeft, rrr: (need / ballsLeft) * 6, battingTeam: second.inning.replace(/\s+Inning.*$/i, '') };
}
