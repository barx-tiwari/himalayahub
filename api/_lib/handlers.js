/**
 * Proxy handlers. Each returns { status, body, headers }.
 * Every response body includes `source`, `sourceUrl` and `fetchedAt` so the
 * UI can always show where data came from and how fresh it is.
 * Nothing here ever invents values: if a provider fails, we return an error.
 */
import { CATEGORIES, CATEGORY_IDS } from './feeds.js';
import { parseFeed } from './rss.js';
import {
  ok, fail, notConfigured, fromError, upstream, cached, UpstreamError,
  isDate, pick, clean, safeUrl, num, iso, arr,
} from './http.js';

const now = () => new Date().toISOString();

/* ============================== NEWS ============================== */
async function fetchFeed(feed) {
  return cached(`feed:${feed.url}`, 5 * 60_000, async () => {
    const xml = await upstream(feed.url, { as: 'text', timeoutMs: 8000 });
    return parseFeed(xml, { source: feed.source, region: feed.region });
  });
}

function hashId(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `n${(h >>> 0).toString(36)}`;
}

export async function news(query) {
  const category = pick(query.category, CATEGORY_IDS, 'latest');
  const cfg = CATEGORIES[category];
  const jobs = [];
  (cfg.feeds || []).forEach((f) => jobs.push({ feed: f, match: null }));
  (cfg.filtered || []).forEach((g) => g.feeds.forEach((f) => jobs.push({ feed: f, match: g.match })));

  const results = await Promise.allSettled(jobs.map((j) => fetchFeed(j.feed)));
  const sources = [];
  const seen = new Set();
  const items = [];
  results.forEach((r, i) => {
    const { feed, match } = jobs[i];
    sources.push({ source: feed.source, ok: r.status === 'fulfilled' });
    if (r.status !== 'fulfilled') return;
    r.value.forEach((it) => {
      if (match && !match.test(`${it.title} ${it.description}`)) return;
      const key = it.url.split('?')[0] || it.title.toLowerCase();
      if (seen.has(key) || seen.has(it.title.toLowerCase())) return;
      seen.add(key); seen.add(it.title.toLowerCase());
      items.push({ ...it, id: hashId(it.url), category: category === 'latest' ? it.region.toLowerCase() : category });
    });
  });

  if (!sources.some((s) => s.ok)) return fail(502, 'upstream', 'None of the news sources could be reached.');
  items.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  const uniqueSources = [...new Map(sources.map((s) => [s.source, s])).values()];
  return ok({ category, items: items.slice(0, 60), sources: uniqueSources, fetchedAt: now(), source: 'RSS feeds', sourceUrl: null }, 300);
}

/* ============================ FOOTBALL ============================ */
const FD = 'https://api.football-data.org/v4';
const LEAGUES = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL', 'EL'];
const FREE_SET = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL'];

function normTeam(t = {}) {
  return { name: clean(t.name || t.shortName || 'TBD', 80), short: clean(t.shortName || t.tla || t.name || '', 40), crest: safeUrl(t.crest) };
}
function normMatch(m) {
  return {
    id: m.id,
    utcDate: iso(m.utcDate),
    status: clean(m.status, 20),
    matchday: num(m.matchday),
    stage: clean(m.stage, 40),
    competition: { code: clean(m.competition?.code, 8), name: clean(m.competition?.name, 60), emblem: safeUrl(m.competition?.emblem) },
    home: normTeam(m.homeTeam),
    away: normTeam(m.awayTeam),
    score: { home: num(m.score?.fullTime?.home), away: num(m.score?.fullTime?.away), halfHome: num(m.score?.halfTime?.home), halfAway: num(m.score?.halfTime?.away) },
  };
}

export async function football(query, env) {
  const key = env.FOOTBALL_DATA_API_KEY;
  if (!key) return notConfigured('FOOTBALL_DATA_API_KEY', 'football data (football-data.org)');
  const headers = { 'X-Auth-Token': key };
  const resource = pick(query.resource, ['matches', 'standings'], 'matches');
  const base = { source: 'football-data.org', sourceUrl: 'https://www.football-data.org/', fetchedAt: now() };

  try {
    if (resource === 'standings') {
      const code = pick(query.competition, LEAGUES, null);
      if (!code) return fail(400, 'bad_request', 'Unknown competition.');
      const data = await cached(`fd:st:${code}`, 30 * 60_000, () => upstream(`${FD}/competitions/${code}/standings`, { headers }));
      const total = arr(data.standings).find((s) => s.type === 'TOTAL') || arr(data.standings)[0];
      const table = arr(total?.table).map((r) => ({
        position: num(r.position), team: normTeam(r.team), played: num(r.playedGames), won: num(r.won), draw: num(r.draw),
        lost: num(r.lost), goalDiff: num(r.goalDifference), points: num(r.points),
      }));
      return ok({ ...base, competition: { code, name: clean(data.competition?.name, 60) }, season: iso(data.season?.startDate), table }, 1800);
    }

    const from = isDate(query.dateFrom) ? query.dateFrom : new Date().toISOString().slice(0, 10);
    const to = isDate(query.dateTo) ? query.dateTo : from;
    const spanDays = (Date.parse(to) - Date.parse(from)) / 86_400_000;
    if (spanDays < 0 || spanDays > 10) return fail(400, 'bad_request', 'Date range must be 0–10 days.');
    const code = query.competition === 'ALL' || !query.competition ? 'ALL' : pick(query.competition, LEAGUES, null);
    if (!code) return fail(400, 'bad_request', 'Unknown competition.');
    const url = code === 'ALL'
      ? `${FD}/matches?competitions=${FREE_SET.join(',')}&dateFrom=${from}&dateTo=${to}`
      : `${FD}/competitions/${code}/matches?dateFrom=${from}&dateTo=${to}`;
    const data = await cached(`fd:m:${code}:${from}:${to}`, 60_000, () => upstream(url, { headers }));
    const matches = arr(data.matches).map(normMatch).filter((m) => m.utcDate);
    const anyLive = matches.some((m) => ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status));
    return ok({ ...base, dateFrom: from, dateTo: to, competition: code, matches, anyLive }, anyLive ? 45 : 120);
  } catch (e) {
    return fromError(e);
  }
}

/* ============================= CRICKET ============================= */
const CA = 'https://api.cricapi.com/v1';

/** CricketData returns dateTimeGMT without a zone marker ("2025-10-01T08:00:00"): treat as UTC. */
function gmt(v) {
  if (!v || typeof v !== 'string') return null;
  return iso(/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : `${v}Z`);
}
function normCricket(m = {}) {
  return {
    id: clean(m.id, 60),
    name: clean(m.name, 160),
    matchType: clean(m.matchType, 12).toLowerCase(),
    status: clean(m.status, 160),
    venue: clean(m.venue, 120),
    startsAt: gmt(m.dateTimeGMT) || iso(m.date),
    teams: arr(m.teams).map((t) => clean(t, 60)).slice(0, 2),
    teamInfo: arr(m.teamInfo).map((t) => ({ name: clean(t.name, 60), short: clean(t.shortname, 12), img: safeUrl(t.img) })),
    score: arr(m.score).map((s) => ({ inning: clean(s.inning, 80), r: num(s.r), w: num(s.w), o: num(s.o) })),
    seriesId: clean(m.series_id, 60),
    started: m.matchStarted === true,
    ended: m.matchEnded === true,
    tossWinner: m.tossWinner ? clean(m.tossWinner, 60) : null,
    tossChoice: m.tossChoice ? clean(m.tossChoice, 20) : null,
  };
}

async function ca(path, key, ttl) {
  return cached(`ca:${path}`, ttl, async () => {
    const sep = path.includes('?') ? '&' : '?';
    const data = await upstream(`${CA}/${path}${sep}apikey=${encodeURIComponent(key)}`);
    if (data?.status !== 'success') {
      const reason = String(data?.reason || data?.status || '');
      if (/key|blocked|invalid/i.test(reason)) throw new UpstreamError('auth', 403, 'auth');
      if (/limit|hits/i.test(reason)) throw new UpstreamError('limit', 429, 'rate_limited');
      throw new UpstreamError('cricket upstream', 502, 'invalid');
    }
    return data;
  });
}

export async function cricket(query, env) {
  const key = env.CRICKETDATA_API_KEY;
  if (!key) return notConfigured('CRICKETDATA_API_KEY', 'cricket data (CricketData.org)');
  const resource = pick(query.resource, ['current', 'matches', 'npl'], 'current');
  const base = { source: 'CricketData.org', sourceUrl: 'https://cricketdata.org/', fetchedAt: now() };
  try {
    if (resource === 'current') {
      const data = await ca('currentMatches?offset=0', key, 2 * 60_000);
      const matches = arr(data.data).map(normCricket);
      const anyLive = matches.some((m) => m.started && !m.ended);
      return ok({ ...base, matches, anyLive }, anyLive ? 90 : 600);
    }
    if (resource === 'matches') {
      const data = await ca('matches?offset=0', key, 30 * 60_000);
      return ok({ ...base, matches: arr(data.data).map(normCricket) }, 1800);
    }
    // NPL: find the most recent "Nepal Premier League" series, then its matches.
    const search = await ca('series?offset=0&search=Nepal%20Premier%20League', key, 12 * 60 * 60_000);
    const series = arr(search.data)
      .filter((s) => /nepal premier league/i.test(s.name || ''))
      .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')))[0];
    if (!series) return ok({ ...base, series: null, live: [], upcoming: [], completed: [] }, 3600);
    const info = await ca(`series_info?id=${encodeURIComponent(series.id)}`, key, 10 * 60_000);
    const list = arr(info.data?.matchList).map(normCricket);
    // Live scores come from currentMatches (series_info lists fixtures without scores).
    let liveDetail = [];
    try {
      const current = await ca('currentMatches?offset=0', key, 2 * 60_000);
      liveDetail = arr(current.data).map(normCricket).filter((m) => m.seriesId === series.id && m.started && !m.ended);
      liveDetail = await Promise.all(liveDetail.map(async (m) => {
        try {
          const mi = await ca(`match_info?id=${encodeURIComponent(m.id)}`, key, 2 * 60_000);
          const d = normCricket(mi.data);
          return { ...m, tossWinner: d.tossWinner, tossChoice: d.tossChoice, score: d.score.length ? d.score : m.score };
        } catch { return m; }
      }));
    } catch { /* live details optional */ }
    const liveIds = new Set(liveDetail.map((m) => m.id));
    return ok({
      ...base,
      series: { id: clean(series.id, 60), name: clean(series.name, 120), startDate: clean(series.startDate, 20), endDate: clean(series.endDate, 20) },
      live: liveDetail,
      upcoming: list.filter((m) => !m.started && !liveIds.has(m.id)).sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || '')),
      completed: list.filter((m) => m.ended).sort((a, b) => (b.startsAt || '').localeCompare(a.startsAt || '')),
      anyLive: liveDetail.length > 0,
    }, liveDetail.length ? 90 : 900);
  } catch (e) {
    return fromError(e);
  }
}

/* =============================== F1 =============================== */
const JOL = 'https://api.jolpi.ca/ergast/f1';
export async function f1() {
  try {
    const [next, last, standings] = await Promise.allSettled([
      cached('f1:next', 60 * 60_000, () => upstream(`${JOL}/current/next.json`)),
      cached('f1:last', 60 * 60_000, () => upstream(`${JOL}/current/last/results.json`)),
      cached('f1:std', 60 * 60_000, () => upstream(`${JOL}/current/driverStandings.json`)),
    ]);
    if ([next, last, standings].every((r) => r.status === 'rejected')) throw next.reason;
    const race = (r) => {
      if (!r) return null;
      return {
        name: clean(r.raceName, 80), round: num(r.round), season: clean(r.season, 6),
        startsAt: r.date ? iso(`${r.date}T${r.time || '00:00:00Z'}`) : null, timeKnown: Boolean(r.time),
        circuit: clean(r.Circuit?.circuitName, 80), locality: clean(r.Circuit?.Location?.locality, 60), country: clean(r.Circuit?.Location?.country, 60),
      };
    };
    const nextRace = next.status === 'fulfilled' ? race(next.value?.MRData?.RaceTable?.Races?.[0]) : null;
    const lastRaw = last.status === 'fulfilled' ? last.value?.MRData?.RaceTable?.Races?.[0] : null;
    const lastRace = lastRaw ? {
      ...race(lastRaw),
      results: arr(lastRaw.Results).slice(0, 10).map((x) => ({
        position: num(x.position), driver: clean(`${x.Driver?.givenName || ''} ${x.Driver?.familyName || ''}`, 60),
        team: clean(x.Constructor?.name, 60), points: num(x.points), status: clean(x.Time?.time || x.status, 30),
      })),
    } : null;
    const table = standings.status === 'fulfilled' ? arr(standings.value?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings).slice(0, 10).map((x) => ({
      position: num(x.position), driver: clean(`${x.Driver?.givenName || ''} ${x.Driver?.familyName || ''}`, 60),
      team: clean(x.Constructors?.[0]?.name, 60), points: num(x.points), wins: num(x.wins),
    })) : [];
    return ok({ source: 'Jolpica F1 API (Ergast-compatible)', sourceUrl: 'https://github.com/jolpica/jolpica-f1', fetchedAt: now(), next: nextRace, last: lastRace, standings: table }, 3600);
  } catch (e) {
    return fromError(e);
  }
}

/* =============================== GOLD =============================== */
const TOLA_G = 11.6638;
const OZ_G = 31.1035;

/** Read FENEGOSIDA's published rates from its public page. Fails closed. */
export function parseFenegosida(html) {
  const text = clean(html, 200_000);
  const grab = (re) => { const m = text.match(re); return m ? num(m[1]) : null; };
  const r = {
    fineGoldTola: grab(/FINE\s*GOLD\s*\(9999\)\s*per\s*1\s*tola\s*(?:रु|Nrs\.?|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i),
    tejabiGoldTola: grab(/TEJABI\s*GOLD\s*per\s*1\s*tola\s*(?:रु|Nrs\.?|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i),
    silverTola: grab(/SILVER\s*per\s*1\s*tola\s*(?:रु|Nrs\.?|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i),
    fineGold10g: grab(/FINE\s*GOLD\s*\(9999\)\s*per\s*10\s*grm?\s*(?:Nrs\.?|रु|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i),
    silver10g: grab(/SILVER\s*per\s*10\s*grm?\s*(?:Nrs\.?|रु|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i),
  };
  // Sanity ranges: reject anything implausible rather than show a wrong number.
  const inRange = (v, lo, hi) => (v != null && v >= lo && v <= hi ? v : null);
  r.fineGoldTola = inRange(r.fineGoldTola, 50_000, 3_000_000);
  r.tejabiGoldTola = inRange(r.tejabiGoldTola, 50_000, 3_000_000); // FENEGOSIDA shows 0 when not published
  r.silverTola = inRange(r.silverTola, 300, 100_000);
  r.fineGold10g = inRange(r.fineGold10g, 40_000, 2_600_000);
  r.silver10g = inRange(r.silver10g, 250, 90_000);
  return r.fineGoldTola || r.silverTola ? r : null;
}

async function nepalGold(env) {
  if (env.NEPAL_GOLD_JSON_URL) {
    // Your own maintained source returning { fineGoldTola, tejabiGoldTola, silverTola, fineGold10g, silver10g, change?, percentChange?, publishedAt?, source? }
    const d = await upstream(env.NEPAL_GOLD_JSON_URL);
    return { ...d, source: clean(d.source || 'Configured source', 80), sourceUrl: safeUrl(d.sourceUrl) };
  }
  const html = await cached('fenegosida', 20 * 60_000, () => upstream('https://www.fenegosida.org/', { as: 'text', timeoutMs: 9000 }));
  const parsed = parseFenegosida(html);
  if (!parsed) throw new UpstreamError('Could not read FENEGOSIDA rates', 502, 'invalid');
  return {
    ...parsed,
    fineGoldGram: parsed.fineGold10g ? parsed.fineGold10g / 10 : parsed.fineGoldTola / TOLA_G,
    gramFrom: parsed.fineGold10g ? 'per-10-gram rate' : 'per-tola rate',
    silverGram: parsed.silver10g ? parsed.silver10g / 10 : parsed.silverTola ? parsed.silverTola / TOLA_G : null,
    change: null, percentChange: null, // FENEGOSIDA does not publish a change figure
    publishedAt: null,
    source: 'FENEGOSIDA (Federation of Nepal Gold and Silver Dealers\' Association)',
    sourceUrl: 'https://www.fenegosida.org/',
  };
}

async function internationalMetals(env) {
  if (!env.GOLDAPI_KEY) throw new UpstreamError('not configured', 503, 'not_configured');
  const headers = { 'x-access-token': env.GOLDAPI_KEY };
  const get = (m) => cached(`goldapi:${m}`, 10 * 60_000, () => upstream(`https://www.goldapi.io/api/${m}/USD`, { headers }));
  const [xau, xag] = await Promise.allSettled([get('XAU'), get('XAG')]);
  const norm = (r, name) => (r.status === 'fulfilled' && num(r.value?.price) ? {
    name, price: num(r.value.price), change: num(r.value.ch), percentChange: num(r.value.chp),
    prevClose: num(r.value.prev_close_price), high: num(r.value.high_price), low: num(r.value.low_price),
    perGram24k: num(r.value.price_gram_24k), asOf: r.value.timestamp ? new Date(r.value.timestamp * 1000).toISOString() : null,
  } : null);
  const gold = norm(xau, 'Gold (XAU)');
  const silver = norm(xag, 'Silver (XAG)');
  if (!gold && !silver) throw (xau.reason || new UpstreamError('metals', 502));
  return { gold, silver, currency: 'USD', unit: 'troy ounce', source: 'GoldAPI.io', sourceUrl: 'https://www.goldapi.io/' };
}

async function nrbUsd() {
  const today = new Date();
  const from = new Date(today.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);
  const data = await cached(`nrb:${to}`, 60 * 60_000, () => upstream(`https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=10&from=${from}&to=${to}`));
  const days = arr(data?.data?.payload).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  for (const d of days) {
    const usd = arr(d.rates).find((r) => r.currency?.iso3 === 'USD');
    if (usd && num(usd.sell)) return { buy: num(usd.buy) / (num(usd.currency.unit) || 1), sell: num(usd.sell) / (num(usd.currency.unit) || 1), date: clean(d.date, 12), source: 'Nepal Rastra Bank', sourceUrl: 'https://www.nrb.org.np/forex/' };
  }
  throw new UpstreamError('NRB USD rate missing', 502, 'invalid');
}

export async function gold(query, env) {
  const [np, intl, fx] = await Promise.allSettled([nepalGold(env), internationalMetals(env), nrbUsd()]);
  const part = (r) => (r.status === 'fulfilled' ? r.value : { error: r.reason?.kind === 'not_configured' ? 'not_configured' : 'unavailable' });
  const body = { fetchedAt: now(), nepal: part(np), international: part(intl), fx: part(fx) };
  if (body.international.gold && body.fx.sell) {
    // Reference only: spot converted at the NRB selling rate. Excludes duty, VAT and dealer margins.
    body.reference = {
      goldNprPerTola: (body.international.gold.price / OZ_G) * TOLA_G * body.fx.sell,
      silverNprPerTola: body.international.silver ? (body.international.silver.price / OZ_G) * TOLA_G * body.fx.sell : null,
    };
  }
  if (np.status === 'rejected' && intl.status === 'rejected') {
    return fail(502, 'upstream', 'Precious-metal prices are unavailable right now.');
  }
  return ok(body, 900);
}

/* =============================== NEPSE =============================== */
/**
 * There is no official public NEPSE API. Set NEPSE_API_URL to a data source
 * you are licensed to use that returns the schema below (or adapt
 * `adaptNepse` to your provider's format).
 *
 * {
 *   asOf: ISO, marketStatus: 'OPEN'|'CLOSED'|..., source?, sourceUrl?,
 *   index: { value, change, percentChange },
 *   turnover, volume, transactions,
 *   gainers: [{ symbol, name?, ltp, change, percentChange }], losers: [...],
 *   mostTraded: [{ symbol, name?, ltp, turnover }],
 *   sectors: [{ name, value, change, percentChange }],
 *   history: [{ date: 'YYYY-MM-DD', value }]
 * }
 */
export function adaptNepse(raw) {
  const stock = (s) => ({ symbol: clean(s?.symbol, 16), name: clean(s?.name, 80), ltp: num(s?.ltp), change: num(s?.change), percentChange: num(s?.percentChange), turnover: num(s?.turnover) });
  const idx = raw?.index || {};
  const out = {
    asOf: iso(raw?.asOf),
    marketStatus: clean(raw?.marketStatus, 20).toUpperCase() || null,
    index: { value: num(idx.value), change: num(idx.change), percentChange: num(idx.percentChange) },
    turnover: num(raw?.turnover), volume: num(raw?.volume), transactions: num(raw?.transactions),
    gainers: arr(raw?.gainers).slice(0, 10).map(stock).filter((s) => s.symbol),
    losers: arr(raw?.losers).slice(0, 10).map(stock).filter((s) => s.symbol),
    mostTraded: arr(raw?.mostTraded).slice(0, 10).map(stock).filter((s) => s.symbol),
    sectors: arr(raw?.sectors).slice(0, 20).map((s) => ({ name: clean(s?.name, 60), value: num(s?.value), change: num(s?.change), percentChange: num(s?.percentChange) })).filter((s) => s.name),
    history: arr(raw?.history).slice(-400).map((h) => ({ date: clean(h?.date, 12), value: num(h?.value) })).filter((h) => h.date && h.value != null),
    source: clean(raw?.source, 80) || null,
    sourceUrl: safeUrl(raw?.sourceUrl),
  };
  if (out.index.value == null) throw new UpstreamError('NEPSE data missing index', 502, 'invalid');
  return out;
}

export async function nepse(query, env) {
  if (!env.NEPSE_API_URL) return notConfigured('NEPSE_API_URL', 'NEPSE market data');
  try {
    const headers = env.NEPSE_API_KEY ? { Authorization: `Bearer ${env.NEPSE_API_KEY}` } : {};
    const raw = await cached('nepse', 55_000, () => upstream(env.NEPSE_API_URL, { headers }));
    const data = adaptNepse(raw);
    return ok({ ...data, source: data.source || 'Configured NEPSE data provider', fetchedAt: now() }, 60);
  } catch (e) {
    return fromError(e);
  }
}

export const routes = { news, football, cricket, f1, gold, nepse };
