/**
 * Shared helpers for the serverless proxy. Framework-agnostic: handlers are
 * plain async functions (query, env) => { status, body, headers } so the same
 * code runs on Vercel (api/*.js), in the Vite dev server and in tests.
 */
export class UpstreamError extends Error {
  constructor(message, status = 502, kind = 'upstream') {
    super(message);
    this.status = status;
    this.kind = kind;
  }
}

export function ok(body, maxAgeSeconds = 60) {
  return {
    status: 200,
    body,
    headers: { 'Cache-Control': `public, max-age=0, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 5}` },
  };
}

export function fail(status, error, message) {
  return { status, body: { error, message }, headers: { 'Cache-Control': 'no-store' } };
}

export const notConfigured = (envName, provider) =>
  fail(503, 'not_configured', `Set ${envName} in the server environment to enable ${provider}. See README → API setup.`);

/** Map an UpstreamError (or anything thrown) to a safe client response. Never leaks keys/stack traces. */
export function fromError(err) {
  if (err instanceof UpstreamError) {
    if (err.kind === 'auth') return fail(403, 'auth', 'The data provider rejected the API key or this plan cannot access that data.');
    if (err.kind === 'rate_limited') return fail(429, 'rate_limited', 'The data provider rate limit was reached. Try again shortly.');
    if (err.kind === 'invalid') return fail(502, 'upstream', 'The data provider returned an unexpected response.');
    return fail(502, 'upstream', 'The data provider is unavailable right now.');
  }
  return fail(500, 'server', 'Unexpected server error.');
}

const UA = 'HimalayaHub/3.0 (+https://github.com/; educational dashboard)';

/** fetch with timeout + status mapping. `as` = 'json' | 'text'. */
export async function upstream(url, { headers = {}, timeoutMs = 9000, as = 'json' } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': UA, Accept: as === 'json' ? 'application/json' : '*/*', ...headers }, signal: controller.signal });
  } catch (e) {
    throw new UpstreamError(e.name === 'AbortError' ? 'Upstream timeout' : 'Upstream network error', 504);
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 401 || res.status === 403) throw new UpstreamError('Upstream auth', res.status, 'auth');
  if (res.status === 429) throw new UpstreamError('Upstream rate limit', 429, 'rate_limited');
  if (!res.ok) throw new UpstreamError(`Upstream status ${res.status}`, 502);
  if (as === 'text') return res.text();
  try {
    return await res.json();
  } catch {
    throw new UpstreamError('Upstream returned invalid JSON', 502, 'invalid');
  }
}

/** Tiny per-instance memory cache (helps warm serverless instances and dev). */
const store = new Map();
export async function cached(key, ttlMs, fn) {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const value = await fn();
  store.set(key, { value, at: Date.now() });
  if (store.size > 300) store.delete(store.keys().next().value);
  return value;
}

/* ---------- validation + sanitising ---------- */
export const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
export function clean(value, max = 400) {
  if (value == null) return '';
  let s = String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ');
  s = s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    const k = e.toLowerCase();
    if (ENT[k]) return ENT[k];
    if (k.startsWith('#x')) return String.fromCodePoint(parseInt(k.slice(2), 16) || 32);
    if (k.startsWith('#')) return String.fromCodePoint(parseInt(k.slice(1), 10) || 32);
    return m;
  });
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}
export function safeUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value.trim().replace(/&amp;/g, '&'));
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}
export const num = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim()) { const n = Number(v.replace(/,/g, '')); return Number.isFinite(n) ? n : null; }
  return null;
};
export const iso = (v) => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d.toISOString(); };
export const arr = (v) => (Array.isArray(v) ? v : []);

/* ---------- very small per-instance rate limiter ---------- */
const hits = new Map();
export function rateLimited(ip, limit = 90, windowMs = 60_000) {
  if (!ip) return false;
  const now = Date.now();
  const h = hits.get(ip) || { n: 0, start: now };
  if (now - h.start > windowMs) { h.n = 0; h.start = now; }
  h.n += 1;
  hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.n > limit;
}

/**
 * Node (req, res) adapter used by Vercel functions and the Vite dev server.
 * GET only, optional CORS allowlist (ALLOWED_ORIGINS=comma,separated).
 */
export function toNode(handler, envOverride) {
  return async (req, res) => {
    const env = envOverride || process.env;
    const send = (r) => {
      res.statusCode = r.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      Object.entries(r.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
      const origin = req.headers?.origin;
      const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (origin && allowed.includes(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
      res.end(JSON.stringify(r.body));
    };
    try {
      if (req.method === 'OPTIONS') return send({ status: 204, body: {} });
      if (req.method !== 'GET') return send(fail(405, 'method', 'Only GET is supported.'));
      const ip = (req.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress;
      if (rateLimited(ip)) return send(fail(429, 'rate_limited', 'Too many requests. Slow down a little.'));
      const url = new URL(req.url, 'http://localhost');
      const query = Object.fromEntries(url.searchParams);
      return send(await handler(query, env));
    } catch (err) {
      return send(fromError(err));
    }
  };
}
