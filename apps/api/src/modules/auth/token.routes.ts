import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { ApiError, ok } from '../../lib/http.js';
import { cache } from '../../lib/cache.js';
import { jwtSecret } from '../../lib/secrets.js';
import { validate } from '../../middleware/validate.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { hashToken, newToken } from '../../auth/tokens.js';
import { signAccess } from '../../auth/jwt.js';
import { recordLog } from '../../services/systemLog.js';
import * as auth from './auth.service.js';

/**
 * Token auth for native apps (iOS/Android), where cookies are awkward:
 *   POST /api/auth/token           { email, password, deviceName? } → { accessToken, refreshToken, expiresIn }
 *   POST /api/auth/token/refresh   { refreshToken }                  → a NEW pair; the old refresh token dies
 *   POST /api/auth/token/revoke    { refreshToken }                  → signs that device out
 * Refresh tokens rotate on every use. Presenting an already-rotated token means it was
 * copied, so the whole family (that device's chain) is revoked — OAuth 2.0 Security BCP §4.14.
 * Send the access token as `Authorization: Bearer <token>`.
 */
export const tokenRoutes = Router();
const strict = rateLimit({ cache, name: 'token', windowMs: 15 * 60_000, max: 30, key: (r) => r.ip || 'unknown' });
const loginBody = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(200), deviceName: z.string().trim().max(80).optional() });
const refreshBody = z.object({ refreshToken: z.string().min(20).max(200) });

async function issue(userId: string, role: string, familyId: string, deviceName?: string | null) {
  const refreshToken = newToken();
  await prisma.refreshToken.create({ data: { userId, familyId, tokenHash: hashToken(refreshToken), deviceName: deviceName ?? null, expiresAt: new Date(Date.now() + env.REFRESH_TTL_DAYS * 86_400_000) } });
  const ttl = env.JWT_ACCESS_TTL_MIN * 60;
  return { accessToken: signAccess(jwtSecret(), userId, role, ttl), tokenType: 'Bearer', expiresIn: ttl, refreshToken };
}

tokenRoutes.post('/', strict, validate({ body: loginBody }), async (req, res) => {
  const user = await auth.login(req, req.body); // same lockout + constant-time checks as the web login
  return ok(res, { user: auth.publicUser(user), ...(await issue(user.id, user.role, randomUUID(), req.body.deviceName)) }, 'Signed in');
});

tokenRoutes.post('/refresh', strict, validate({ body: refreshBody }), async (req, res) => {
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(req.body.refreshToken) }, include: { user: true } });
  if (!row) throw ApiError.unauthorized('Please sign in again.');
  if (row.rotatedAt || row.revokedAt) {
    // Reuse detected: revoke the entire family.
    await prisma.refreshToken.updateMany({ where: { familyId: row.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    await recordLog('WARN', 'auth', 'Refresh token reuse detected; family revoked', { familyId: row.familyId });
    throw ApiError.unauthorized('Please sign in again.');
  }
  if (row.expiresAt < new Date() || !row.user.isActive || row.user.deletedAt) throw ApiError.unauthorized('Please sign in again.');
  // Mark rotated first (conditional update), so two parallel refreshes can't both succeed.
  const claimed = await prisma.refreshToken.updateMany({ where: { id: row.id, rotatedAt: null, revokedAt: null }, data: { rotatedAt: new Date() } });
  if (claimed.count !== 1) throw ApiError.unauthorized('Please sign in again.');
  return ok(res, await issue(row.userId, row.user.role, row.familyId, row.deviceName));
});

tokenRoutes.post('/revoke', validate({ body: refreshBody }), async (req, res) => {
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(req.body.refreshToken) } });
  if (row) await prisma.refreshToken.updateMany({ where: { familyId: row.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
  return ok(res, null, 'Signed out'); // same answer whether or not the token existed
});
