import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, passwordProblem, needsRehash } from '../src/auth/password.ts';
import { newToken, hashToken, safeEqual, keyedHash } from '../src/auth/tokens.ts';
import { redact, anonymizeIp } from '../src/lib/redact.ts';
import { MemoryCache, cached } from '../src/lib/cache.ts';
import { rateLimit } from '../src/middleware/rateLimit.ts';
import { csrfProtection } from '../src/middleware/csrf.ts';

test('passwords: hashed with salt, verified, wrong password rejected', async () => {
  const h1 = await hashPassword('correct horse battery');
  const h2 = await hashPassword('correct horse battery');
  assert.notEqual(h1, h2, 'salted');
  assert.match(h1, /^scrypt\$131072\$8\$1\$/);
  assert.ok(!h1.includes('correct horse'));
  assert.equal(await verifyPassword('correct horse battery', h1), true);
  assert.equal(await verifyPassword('correct horse batterx', h1), false);
  assert.equal(await verifyPassword('anything', null), false);
  assert.equal(await verifyPassword('anything', 'garbage$hash'), false);
  assert.equal(needsRehash(h1), false);
  assert.equal(needsRehash('scrypt$16384$8$1$a$b'), true);
});
test('password policy', () => {
  assert.equal(passwordProblem('short'), 'Use at least 10 characters.');
  assert.equal(passwordProblem('aaaaaaaaaaaa'), 'Avoid repeating a single character.');
  assert.equal(passwordProblem('MyPassword2024'), 'Avoid common words and patterns.');
  assert.equal(passwordProblem('ramesh-rocks-99', ['Ramesh Thapa', 'ramesh@example.com']), 'Don’t include your name or email.');
  assert.equal(passwordProblem('blue-yak-drinks-tea'), null);
});
test('tokens: 256-bit, only hashes stored, constant-time compare', () => {
  const t = newToken();
  assert.equal(Buffer.from(t, 'base64url').length, 32);
  assert.notEqual(newToken(), t);
  assert.equal(hashToken(t).length, 64);
  assert.equal(hashToken(t), hashToken(t));
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
  assert.notEqual(keyedHash('s1', '1.2.3.4'), keyedHash('s2', '1.2.3.4'));
});
test('logs never contain secrets or full emails', () => {
  const out = redact({ email: 'ramesh@example.com', password: 'hunter2', nested: { apiKey: 'k', authorization: 'Bearer abc.def', note: 'contact sita@mail.np' }, list: [{ refreshToken: 'x' }] }) as any;
  assert.equal(out.password, '[redacted]');
  assert.equal(out.nested.apiKey, '[redacted]');
  assert.equal(out.nested.authorization, '[redacted]');
  assert.equal(out.list[0].refreshToken, '[redacted]');
  assert.equal(out.email, 'r***@example.com');
  assert.equal(out.nested.note, 'contact s***@mail.np');
  assert.equal(anonymizeIp('203.0.113.77'), '203.0.113.0');
  assert.equal(anonymizeIp('::ffff:10.1.2.3'), '10.1.2.0');
  assert.equal(anonymizeIp('2001:db8:85a3:8d3:1319:8a2e:370:7348'), '2001:db8:85a3::');
});
test('cache: ttl, eviction, incr window, in-flight de-duplication', async () => {
  let now = 1000; const c = new MemoryCache(2, () => now);
  await c.set('a', 1, 100); now += 50; assert.equal(await c.get('a'), 1); now += 60; assert.equal(await c.get('a'), undefined);
  await c.set('x', 1, 1e6); await c.set('y', 2, 1e6); await c.set('z', 3, 1e6);
  assert.equal(await c.get('x'), undefined, 'oldest evicted'); assert.equal(await c.get('z'), 3);
  const c2 = new MemoryCache(10, () => now);
  assert.equal(await c2.incr('k', 100), 1); assert.equal(await c2.incr('k', 100), 2); now += 101; assert.equal(await c2.incr('k', 100), 1);
  let calls = 0; const c3 = new MemoryCache();
  const load = async () => { calls++; await new Promise((r) => setTimeout(r, 20)); return 'v'; };
  const [a, b] = await Promise.all([cached(c3, 'n', 1000, load), cached(c3, 'n', 1000, load)]);
  assert.equal(a, 'v'); assert.equal(b, 'v'); assert.equal(calls, 1); await cached(c3, 'n', 1000, load); assert.equal(calls, 1);
});
function mockRes() {
  const r: any = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k: string, v: string) => { r.headers[k] = v; }; r.status = (s: number) => { r.statusCode = s; return r; }; r.json = (b: unknown) => { r.body = b; return r; };
  return r;
}
test('rate limiter blocks after max and reports Retry-After', async () => {
  const mw = rateLimit({ cache: new MemoryCache(), name: 't', windowMs: 60_000, max: 3, key: () => 'ip' });
  let passed = 0; let last: any;
  for (let i = 0; i < 5; i++) { last = mockRes(); await mw({} as any, last, () => { passed++; }); }
  assert.equal(passed, 3); assert.equal(last.statusCode, 429); assert.equal(last.body.success, false); assert.ok(Number(last.headers['Retry-After']) > 0);
});
test('CSRF: blocks foreign origins and missing double-submit token', () => {
  const mw = csrfProtection({ allowedOrigins: ['https://himalayahub.example'], sessionCookie: 'hh_session', csrfCookie: 'hh_csrf' });
  const run = (req: any) => { const res = mockRes(); let nexted = false; mw({ get: (h: string) => req.headers[h.toLowerCase()], cookies: {}, ...req }, res, () => { nexted = true; }); return { nexted, res }; };
  assert.equal(run({ method: 'GET', headers: {} }).nexted, true, 'safe methods pass');
  assert.equal(run({ method: 'POST', headers: { origin: 'https://evil.example' } }).res.statusCode, 403);
  assert.equal(run({ method: 'POST', headers: {} }).res.statusCode, 403, 'no origin/referer');
  assert.equal(run({ method: 'POST', headers: { origin: 'https://himalayahub.example' } }).nexted, true, 'login without session');
  assert.equal(run({ method: 'POST', headers: { origin: 'https://himalayahub.example' }, cookies: { hh_session: 's', hh_csrf: 'tok' } }).res.body.code, 'CSRF');
  assert.equal(run({ method: 'POST', headers: { origin: 'https://himalayahub.example', 'x-csrf-token': 'tok' }, cookies: { hh_session: 's', hh_csrf: 'tok' } }).nexted, true);
  assert.equal(run({ method: 'DELETE', headers: { referer: 'https://himalayahub.example/admin/news', 'x-csrf-token': 'bad' }, cookies: { hh_session: 's', hh_csrf: 'tok' } }).res.statusCode, 403);
});
