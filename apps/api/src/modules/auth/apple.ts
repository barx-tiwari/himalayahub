import type { Request, Response } from 'express';
import { createPrivateKey, sign as cryptoSign } from 'node:crypto';
import { verifyAppleIdToken } from './apple.verify.js';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/http.js';
import { newToken, safeEqual } from '../../auth/tokens.js';
import { startSession } from '../../auth/session.js';

/**
 * Sign in with Apple (web), OpenID Connect authorization-code flow.
 * - Apple requires response_mode=form_post when asking for name/email, so the callback
 *   is a cross-site POST. The state/nonce cookie is therefore SameSite=None; Secure, and
 *   the flow needs HTTPS (Apple does not allow http or localhost return URLs anyway).
 * - The client secret is a short-lived ES256 JWT signed with your .p8 key.
 * - The id_token is verified against Apple's published keys (RS256), plus iss/aud/exp/nonce.
 */
const APPLE = 'https://appleid.apple.com';
const COOKIE = 'hh_apple';
const redirectUri = () => `${env.API_URL}/api/auth/apple/callback`;
export const appleEnabled = () => Boolean(env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY);

const b64 = (v: Buffer | string) => Buffer.from(v).toString('base64url');

/** ES256 client_secret, valid 5 minutes (Apple allows up to 6 months; short is safer). */
export function appleClientSecret(now = Math.floor(Date.now() / 1000)) {
  const header = b64(JSON.stringify({ alg: 'ES256', kid: env.APPLE_KEY_ID }));
  const payload = b64(JSON.stringify({ iss: env.APPLE_TEAM_ID, iat: now, exp: now + 300, aud: APPLE, sub: env.APPLE_CLIENT_ID }));
  const key = createPrivateKey(env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n'));
  const sig = cryptoSign('sha256', Buffer.from(`${header}.${payload}`), { key, dsaEncoding: 'ieee-p1363' });
  return `${header}.${payload}.${b64(sig)}`;
}

const cookieOpts = { httpOnly: true, secure: true, sameSite: 'none' as const, maxAge: 10 * 60 * 1000, path: '/api/auth/apple' };

export function appleStart(_req: Request, res: Response) {
  if (!appleEnabled()) throw new ApiError(501, 'Sign in with Apple is not configured.', 'NOT_CONFIGURED');
  const state = newToken(); const nonce = newToken();
  res.cookie(COOKIE, `${state}.${nonce}`, cookieOpts);
  const q = new URLSearchParams({ client_id: env.APPLE_CLIENT_ID!, redirect_uri: redirectUri(), response_type: 'code', response_mode: 'form_post', scope: 'name email', state, nonce });
  res.redirect(`${APPLE}/auth/authorize?${q}`);
}

export async function appleCallback(req: Request, res: Response) {
  const fail = () => res.redirect(303, `${env.APP_URL}/login?error=apple`);
  const body = (req.body || {}) as { code?: string; state?: string; user?: string; error?: string };
  const [expectedState, nonce] = String(req.cookies?.[COOKIE] || '').split('.');
  res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined });
  if (!appleEnabled() || body.error || !body.code || !body.state || !expectedState || !nonce || !safeEqual(body.state, expectedState)) return fail();
  try {
    const tokenRes = await fetch(`${APPLE}/auth/token`, {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: env.APPLE_CLIENT_ID!, client_secret: appleClientSecret(), code: body.code, grant_type: 'authorization_code', redirect_uri: redirectUri() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!tokenRes.ok) return fail();
    const { id_token: idToken } = (await tokenRes.json()) as { id_token?: string };
    const claims = idToken ? await verifyAppleIdToken(idToken, { clientId: env.APPLE_CLIENT_ID!, nonce }) : null;
    if (!claims) return fail();
    const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
    // Apple sends the name only on the very first sign-in, outside the signed token.
    let name: string | undefined;
    try { const u = body.user ? JSON.parse(body.user) : null; name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(' ').slice(0, 80) || undefined; } catch { /* ignore */ }

    const linked = await prisma.oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider: 'apple', providerAccountId: claims.sub } }, include: { user: true } });
    let user = linked?.user ?? null;
    if (!user && claims.email && emailVerified) user = await prisma.user.findUnique({ where: { email: claims.email.toLowerCase() } });
    if (!user) {
      if (!claims.email || !emailVerified) return fail();
      const email = claims.email.toLowerCase();
      user = await prisma.user.create({ data: { email, name: name || 'Traveller', emailVerifiedAt: new Date(), role: 'USER', profile: { create: {} } } });
    }
    if (!user.isActive || user.deletedAt) return fail();
    if (!linked) await prisma.oAuthAccount.create({ data: { userId: user.id, provider: 'apple', providerAccountId: claims.sub } });
    await startSession(req, res, user.id);
    return res.redirect(303, `${env.APP_URL}/dashboard`);
  } catch {
    return fail();
  }
}

