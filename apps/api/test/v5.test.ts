/**
 * v5 unit tests: community logic, native JWTs, Sign in with Apple token verification,
 * CSRF rules for native clients, stays helpers and the destination guide schema.
 * No database needed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign as cryptoSign } from 'node:crypto';

process.env.DATABASE_URL ||= 'file:./test.db';
process.env.SESSION_SECRET ||= 'test-secret-test-secret-test-secret-123456';
process.env.APPLE_CLIENT_ID = 'com.example.web';

const logic = await import('../src/modules/community/community.logic.ts');
const { signAccess, verifyAccess } = await import('../src/auth/jwt.ts');
const { verifyAppleIdToken } = await import('../src/modules/auth/apple.verify.ts');
const { csrfProtection } = await import('../src/middleware/csrf.ts');
const { distanceKm, googleMapsLink } = await import('../src/modules/stays/stays.logic.ts');
const { guideSchema } = await import('../src/modules/destinations/destinations.schemas.ts');
const { createPostBody, voteBody } = await import('../src/modules/community/community.schemas.ts');
const { productRole } = await import('@himalayahub/shared');

test('aliases: stable per community, different across communities, not reversible to the id', () => {
  const a1 = logic.aliasFor('s'.repeat(32), 'user_1', 'travel');
  assert.equal(a1, logic.aliasFor('s'.repeat(32), 'user_1', 'travel'));
  assert.notEqual(a1, logic.aliasFor('s'.repeat(32), 'user_1', 'trekking'));
  assert.notEqual(a1, logic.aliasFor('t'.repeat(32), 'user_1', 'travel'), 'depends on the secret');
  assert.match(a1, /^[A-Z][a-z]+-[A-Za-z]+-\d{4}$/);
  assert.ok(!a1.toLowerCase().includes('user'));
});

test('hot rank: newer beats older at equal score; 10x votes ≈ 12.5 h', () => {
  const t = new Date('2026-06-01T00:00:00Z');
  assert.ok(logic.hotRank(10, 0, new Date(t.getTime() + 3_600_000)) > logic.hotRank(10, 0, t));
  const later = new Date(t.getTime() + 45_000_000); // 12.5 h
  assert.ok(Math.abs(logic.hotRank(100, 0, t) - logic.hotRank(10, 0, later)) < 1e-6);
  assert.ok(logic.hotRank(0, 5, t) < logic.hotRank(0, 0, t), 'net-negative sinks');
});

test('votes: switching and clearing adjust counters correctly', () => {
  assert.deepEqual(logic.applyVote({ upvotes: 3, downvotes: 1 }, 0, 1), { upvotes: 4, downvotes: 1, score: 3 });
  assert.deepEqual(logic.applyVote({ upvotes: 4, downvotes: 1 }, 1, -1), { upvotes: 3, downvotes: 2, score: 1 });
  assert.deepEqual(logic.applyVote({ upvotes: 3, downvotes: 2 }, -1, 0), { upvotes: 3, downvotes: 1, score: 2 });
  assert.deepEqual(logic.applyVote({ upvotes: 0, downvotes: 0 }, 1, 0), { upvotes: 0, downvotes: 0, score: 0 }, 'never negative');
});

test('spam score: ordinary posts pass; promo, floods, duplicates and doxxing are held', () => {
  const base = { accountAgeHours: 500, emailVerified: true, recentPostsLastHour: 0, duplicateOfRecent: false };
  const normal = logic.spamScore({ ...base, title: 'Best month for Mai Pokhari?', body: 'Planning a trip from Birtamod, is October too cold at night?' });
  assert.equal(normal.hold, false); assert.equal(normal.score, 0);
  assert.equal(logic.spamScore({ ...base, title: 'CHEAP HOTELS', body: 'Cheap hotels in Pokhara, whatsapp me now!!! click here https://a.x https://b.x https://c.x' }).hold, true);
  assert.equal(logic.spamScore({ ...base, body: 'same text again and again', duplicateOfRecent: true, recentPostsLastHour: 6 }).hold, true);
  const dox = logic.spamScore({ ...base, body: 'The guide who cheated us is on 9841234567, call him' });
  assert.equal(dox.personalInfo, true); assert.ok(dox.reasons.includes('contains a phone number or email'));
  assert.equal(logic.spamScore({ ...base, accountAgeHours: 0.5, emailVerified: false, body: 'hi https://promo.example' }).hold, false, 'new accounts are scored, not auto-held, for one link');
});

test('comment tree: nests replies, orphans become roots', () => {
  const tree = logic.buildTree([{ id: 'a', parentId: null }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'b' }, { id: 'd', parentId: 'gone' }]);
  assert.equal(tree.length, 2);
  assert.equal((tree[0]!.replies[0] as { replies: unknown[] }).replies.length, 1);
});

test('community schemas: link must be http(s); vote only -1/0/1', () => {
  assert.equal(createPostBody.safeParse({ title: 'Trip report', body: 'x', linkUrl: 'javascript:alert(1)' }).success, false);
  assert.equal(createPostBody.safeParse({ title: 'Trip report', body: 'x', linkUrl: '' }).success, true);
  assert.equal(voteBody.safeParse({ value: 2 }).success, false);
});

test('native JWT: round-trip; forged, expired, alg-swapped and wrong-audience tokens rejected', () => {
  const secret = 'k'.repeat(40); const now = 1_800_000_000;
  const t = signAccess(secret, 'u1', 'USER', 900, now);
  assert.equal(verifyAccess(secret, t, now + 10)?.sub, 'u1');
  assert.equal(verifyAccess('x'.repeat(40), t, now + 10), null, 'wrong secret');
  assert.equal(verifyAccess(secret, t, now + 901), null, 'expired');
  const [, p, s] = t.split('.');
  const none = `${Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')}.${p}.`;
  assert.equal(verifyAccess(secret, none, now), null, 'alg=none');
  const tampered = JSON.parse(Buffer.from(p!, 'base64url').toString()); tampered.role = 'SUPER_ADMIN';
  assert.equal(verifyAccess(secret, `${t.split('.')[0]}.${Buffer.from(JSON.stringify(tampered)).toString('base64url')}.${s}`, now), null, 'payload tamper');
});

test('Sign in with Apple: id_token signature, audience, nonce and expiry are all enforced', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'K1', alg: 'RS256', use: 'sig' } as never;
  const now = 1_800_000_000;
  const make = (claims: object, key = privateKey, kid = 'K1') => {
    const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid })).toString('base64url');
    const b = Buffer.from(JSON.stringify(claims)).toString('base64url');
    return `${h}.${b}.${cryptoSign('RSA-SHA256', Buffer.from(`${h}.${b}`), key).toString('base64url')}`;
  };
  const good = { iss: 'https://appleid.apple.com', aud: 'com.example.web', sub: 'apple-sub', exp: now + 600, iat: now, nonce: 'n-123', email: 'a@privaterelay.appleid.com', email_verified: 'true' };
  const keys = async () => [jwk];
  const exp = { clientId: 'com.example.web', nonce: 'n-123' };
  assert.equal((await verifyAppleIdToken(make(good), exp, keys, now))?.sub, 'apple-sub');
  assert.equal(await verifyAppleIdToken(make({ ...good, aud: 'other.app' }), exp, keys, now), null);
  assert.equal(await verifyAppleIdToken(make({ ...good, nonce: 'replayed' }), exp, keys, now), null);
  assert.equal(await verifyAppleIdToken(make({ ...good, exp: now - 1 }), exp, keys, now), null);
  assert.equal(await verifyAppleIdToken(make({ ...good, iss: 'https://evil.example' }), exp, keys, now), null);
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  assert.equal(await verifyAppleIdToken(make(good, other), exp, keys, now), null, 'signed by someone else');
  assert.equal(await verifyAppleIdToken(make(good, privateKey, 'unknown'), exp, keys, now), null, 'unknown kid');
});

test('CSRF: native Bearer requests pass; browsers still need Origin + token; Apple callback exempt only from Apple', () => {
  const mw = csrfProtection({ allowedOrigins: ['https://himalayahub.com'], sessionCookie: 'hh_session', csrfCookie: 'hh_csrf' });
  const run = (req: Record<string, unknown>) => { let status = 200; let passed = false;
    const r = { method: 'POST', headers: {}, cookies: {}, originalUrl: '/api/community/reports', get(this: { headers: Record<string, string> }, n: string) { return this.headers[n.toLowerCase()]; }, ...req };
    mw(r as never, { status(s: number) { status = s; return { json: () => undefined }; } } as never, () => { passed = true; });
    return passed ? 200 : status; };
  assert.equal(run({ headers: { authorization: 'Bearer abc' } }), 200, 'native app');
  assert.equal(run({ headers: {} }), 403, 'no origin, no bearer');
  assert.equal(run({ headers: { authorization: 'Bearer abc' }, cookies: { hh_session: 'x' } }), 403, 'bearer does not bypass a browser session');
  assert.equal(run({ headers: {}, originalUrl: '/api/auth/token/refresh' }), 200, 'token endpoints for apps');
  assert.equal(run({ headers: { origin: 'https://appleid.apple.com' }, originalUrl: '/api/auth/apple/callback' }), 200);
  assert.equal(run({ headers: { origin: 'https://appleid.apple.com' }, originalUrl: '/api/community/reports' }), 403);
});

test('stays helpers: distance and Google Maps links', () => {
  const d = distanceKm({ lat: 27.7172, lon: 85.324 }, { lat: 28.2096, lon: 83.9856 }); // Kathmandu → Pokhara, straight line
  assert.ok(d > 140 && d < 150, String(d));
  assert.match(googleMapsLink(27.1, 87.9, 'ChIJabc'), /query_place_id=ChIJabc/);
});

test('guide schema: accepts a full guide, rejects bad video ids and unknown keys', () => {
  const ok = guideSchema.safeParse({ story: [{ heading: 'A', text: 'B' }], itineraries: [{ days: 5, audience: 'both', title: 'x', plan: [{ day: 1, title: 'Drive' }] }], videos: [{ title: 'v', youtubeId: 'dQw4w9WgXcQ' }], costs: { domestic: { perDayNpr: [2000, 4000] } } });
  assert.equal(ok.success, true);
  assert.equal(guideSchema.safeParse({ videos: [{ title: 'v', youtubeId: 'https://evil' }] }).success, false);
  assert.equal(guideSchema.safeParse({ itineraries: [{ days: 4, audience: 'both', title: 'x', plan: [] }] }).success, false, 'only 3/5/7/14');
  assert.equal(guideSchema.safeParse({ html: '<script>' }).success, false);
});

test('product roles map from database roles', () => {
  assert.equal(productRole(null), 'VISITOR');
  assert.equal(productRole({ role: 'USER', emailVerified: false }), 'USER');
  assert.equal(productRole({ role: 'STUDENT', emailVerified: true }), 'VERIFIED_USER');
  assert.equal(productRole({ role: 'MODERATOR' }), 'MODERATOR');
  assert.equal(productRole({ role: 'SUPER_ADMIN' }), 'ADMIN');
});

test('OTP: always 6 digits, uniformly spread, schema only accepts 6 digits', async () => {
  const { newOtp, otpHash } = await import('../src/auth/otp.ts');
  assert.notEqual(otpHash('u1', '123456'), otpHash('u2', '123456'), 'same code, different users → different hashes');
  const { otpSchema } = await import('../src/modules/auth/auth.schemas.ts');
  {
    const codes = Array.from({ length: 2000 }, newOtp);
    assert.ok(codes.every((c) => /^\d{6}$/.test(c)));
    assert.ok(new Set(codes).size > 1990, 'no obvious repetition');
  }
  assert.equal(otpSchema.safeParse({ code: '012345' }).success, true);
  assert.equal(otpSchema.safeParse({ code: '12345' }).success, false);
  assert.equal(otpSchema.safeParse({ code: '12a456' }).success, false);
});

test('env: empty optional values (KEY=) are treated as unset, so the API still starts', async () => {
  const { execFileSync } = await import('node:child_process');
  const code = `process.env.DATABASE_URL='file:./dev.db';process.env.SESSION_SECRET='x'.repeat(40);Object.assign(process.env,{JWT_SECRET:'',COMMUNITY_ALIAS_SECRET:'',MAIL_PROVIDER:'',MAIL_API_KEY:'',APPLE_CLIENT_ID:'',GOOGLE_MAPS_API_KEY:'',MAIL_SEND_IN_DEV:''});const {env}=await import(${JSON.stringify(new URL('../src/config/env.ts', import.meta.url).pathname)});console.log(env.JWT_SECRET===undefined&&env.MAIL_PROVIDER===undefined&&env.MAIL_SEND_IN_DEV===false?'OK':'BAD');`;
  const out = execFileSync(process.execPath, [...process.execArgv, '--input-type=module', '-e', code], { encoding: 'utf8' });
  assert.equal(out.trim(), 'OK');
});
