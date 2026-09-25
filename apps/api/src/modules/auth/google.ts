import type { Request, Response } from 'express';
import { env, isProd } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/http.js';
import { newToken, safeEqual } from '../../auth/tokens.js';
import { startSession } from '../../auth/session.js';

/**
 * Google sign-in (OAuth 2.0 authorization-code flow with a state cookie).
 * Enabled only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 * Profile comes from Google's userinfo endpoint over TLS using the access token
 * obtained server-to-server, so no client-supplied identity is trusted.
 */
const STATE_COOKIE = 'hh_oauth_state';
const redirectUri = () => `${env.API_URL}/api/auth/google/callback`;
export const googleEnabled = () => Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export function googleStart(_req: Request, res: Response) {
  if (!googleEnabled()) throw new ApiError(501, 'Google sign-in is not configured.', 'NOT_CONFIGURED');
  const state = newToken();
  res.cookie(STATE_COOKIE, state, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/api/auth/google' });
  const q = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID!, redirect_uri: redirectUri(), response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
}

export async function googleCallback(req: Request, res: Response) {
  const fail = () => res.redirect(`${env.APP_URL}/login?error=google`);
  const { code, state } = req.query as Record<string, string | undefined>;
  const expected = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: '/api/auth/google' });
  if (!googleEnabled() || !code || !state || !expected || !safeEqual(state, expected)) return fail();
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri(), grant_type: 'authorization_code' }),
      signal: AbortSignal.timeout(8000),
    });
    if (!tokenRes.ok) return fail();
    const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
    const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(8000) });
    if (!infoRes.ok) return fail();
    const info = (await infoRes.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
    if (!info.sub || !info.email || !info.email_verified) return fail();
    const email = info.email.toLowerCase();

    const linked = await prisma.oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider: 'google', providerAccountId: info.sub } }, include: { user: true } });
    let user = linked?.user ?? (await prisma.user.findUnique({ where: { email } }));
    if (!user) {
      user = await prisma.user.create({ data: { email, name: info.name || email.split('@')[0]!, avatar: info.picture, emailVerifiedAt: new Date(), role: 'STUDENT', profile: { create: {} } } });
    }
    if (!user.isActive || user.deletedAt) return fail();
    if (!linked) await prisma.oAuthAccount.create({ data: { userId: user.id, provider: 'google', providerAccountId: info.sub } });
    if (!user.emailVerifiedAt) await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    await startSession(req, res, user.id);
    return res.redirect(`${env.APP_URL}/dashboard`);
  } catch {
    return fail();
  }
}
