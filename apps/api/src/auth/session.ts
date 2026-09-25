import type { Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env, isProd } from '../config/env.js';
import { hashToken, keyedHash, newToken } from './tokens.js';

export const SESSION_COOKIE = isProd ? '__Host-hh_session' : 'hh_session';
export const CSRF_COOKIE = isProd ? '__Host-hh_csrf' : 'hh_csrf';
const TTL_MS = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const TOUCH_EVERY_MS = 15 * 60 * 1000;

export interface SessionUser { id: string; name: string; email: string; role: Role; emailVerifiedAt: Date | null; avatar: string | null }

const baseCookie = { secure: isProd, sameSite: 'lax' as const, path: '/', ...(isProd || !env.COOKIE_DOMAIN ? {} : { domain: env.COOKIE_DOMAIN }) };

/** Creates a DB session and sets the httpOnly session cookie + readable CSRF cookie. */
export async function startSession(req: Request, res: Response, userId: string) {
  const token = newToken();
  await prisma.session.create({
    data: {
      userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TTL_MS),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 200), ipHash: req.ip ? keyedHash(env.SESSION_SECRET, req.ip) : null,
    },
  });
  const csrf = newToken();
  res.cookie(SESSION_COOKIE, token, { ...baseCookie, httpOnly: true, maxAge: TTL_MS });
  res.cookie(CSRF_COOKIE, csrf, { ...baseCookie, httpOnly: false, maxAge: TTL_MS });
  await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  return csrf;
}

/** Returns the current CSRF token, issuing one if the cookie is missing (e.g. cleared by the browser). */
export function ensureCsrfCookie(req: Request, res: Response): string {
  const existing = req.cookies?.[CSRF_COOKIE];
  if (typeof existing === 'string' && existing.length >= 20 && existing.length <= 100) return existing;
  const csrf = newToken();
  res.cookie(CSRF_COOKIE, csrf, { ...baseCookie, httpOnly: false, maxAge: TTL_MS });
  return csrf;
}

/** Resolves the current user from the session cookie (sliding expiry). Returns null if absent/invalid. */
export async function readSession(req: Request): Promise<{ sessionId: string; user: SessionUser } | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== 'string' || token.length > 100) return null;
  const s = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true, emailVerifiedAt: true, avatar: true, isActive: true, deletedAt: true } } },
  });
  if (!s || s.revokedAt || s.expiresAt < new Date() || !s.user.isActive || s.user.deletedAt) return null;
  if (Date.now() - s.lastUsedAt.getTime() > TOUCH_EVERY_MS) {
    await prisma.session.update({ where: { id: s.id }, data: { lastUsedAt: new Date(), expiresAt: new Date(Date.now() + TTL_MS) } });
  }
  const { isActive: _a, deletedAt: _d, ...user } = s.user;
  return { sessionId: s.id, user };
}

export async function endSession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) await prisma.session.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  res.clearCookie(SESSION_COOKIE, { ...baseCookie });
  res.clearCookie(CSRF_COOKIE, { ...baseCookie });
}

/** Signs a user out everywhere (password reset/change, role change, deactivation). */
/** Also revokes native-app refresh tokens, so a password change signs out phones too. */
export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  const now = new Date();
  const [sessions] = await prisma.$transaction([
    prisma.session.updateMany({ where: { userId, revokedAt: null, ...(exceptSessionId ? { NOT: { id: exceptSessionId } } : {}) }, data: { revokedAt: now } }),
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } }),
  ]);
  return sessions;
}
