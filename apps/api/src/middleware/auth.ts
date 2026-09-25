import type { NextFunction, Request, Response } from 'express';
import type { Permission } from '@himalayahub/shared';
import { readSession, type SessionUser } from '../auth/session.js';
import { verifyAccess } from '../auth/jwt.js';
import { jwtSecret } from '../lib/secrets.js';
import { prisma } from '../lib/prisma.js';
import { hasPermission } from '../services/permissions.js';
import { ApiError } from '../lib/http.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: SessionUser; sessionId?: string; requestId?: string; authMethod?: 'bearer' } }
}

/** Attaches req.user when a valid session cookie is present. Never rejects. */
export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  const s = await readSession(req);
  if (s) { req.user = s.user; req.sessionId = s.sessionId; return next(); }
  // Native apps: short-lived Bearer access token (see modules/auth/token.routes.ts).
  const h = req.get('authorization');
  if (h?.startsWith('Bearer ')) {
    const claims = verifyAccess(jwtSecret(), h.slice(7).trim());
    if (claims) {
      // Re-read the user so deactivation and role changes apply immediately, not after token expiry.
      const u = await prisma.user.findUnique({ where: { id: claims.sub }, select: { id: true, name: true, email: true, role: true, emailVerifiedAt: true, avatar: true, isActive: true, deletedAt: true } });
      if (u && u.isActive && !u.deletedAt) { const { isActive: _a, deletedAt: _d, ...user } = u; req.user = user; req.authMethod = 'bearer'; }
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw ApiError.unauthorized();
  next();
}

/** 401 when signed out, 403 when signed in without the permission. Checked on the server, always. */
export function requirePermission(...perms: Permission[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    for (const p of perms) if (!(await hasPermission(req.user.role, p))) throw ApiError.forbidden();
    next();
  };
}
