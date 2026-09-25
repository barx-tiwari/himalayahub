import { createHmac, randomUUID } from 'node:crypto';
import { safeEqual } from './tokens.js';

/**
 * Minimal HS256 JWT for native/mobile access tokens (no dependency). Browsers never
 * receive these: they use the httpOnly session cookie, which cannot be read by scripts.
 * Access tokens are short-lived (default 15 min) and carry only the user id + role.
 */
const b64 = (v: Buffer | string) => Buffer.from(v).toString('base64url');
const HEADER = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

export interface AccessClaims { sub: string; role: string; iat: number; exp: number; jti: string; iss: 'himalayahub'; aud: 'himalayahub-app' }

export function signAccess(secret: string, sub: string, role: string, ttlSec: number, now = Math.floor(Date.now() / 1000)): string {
  const claims: AccessClaims = { sub, role, iat: now, exp: now + ttlSec, jti: randomUUID(), iss: 'himalayahub', aud: 'himalayahub-app' };
  const body = `${HEADER}.${b64(JSON.stringify(claims))}`;
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

/** Returns the claims, or null for anything malformed, forged, expired or for another audience. */
export function verifyAccess(secret: string, token: string, now = Math.floor(Date.now() / 1000)): AccessClaims | null {
  if (typeof token !== 'string' || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== HEADER) return null; // pins alg=HS256 (no "none", no RS/HS confusion)
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  if (!safeEqual(expected, parts[2]!)) return null;
  try {
    const c = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8')) as AccessClaims;
    if (c.iss !== 'himalayahub' || c.aud !== 'himalayahub-app' || typeof c.sub !== 'string' || typeof c.exp !== 'number') return null;
    if (c.exp <= now || c.iat > now + 60) return null;
    return c;
  } catch { return null; }
}
