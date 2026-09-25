import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** 256-bit random token for cookies/links. Only its hash is stored in the database. */
export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Keyed hash for values we must not store raw (IP addresses for rate limiting). */
export const keyedHash = (secret: string, value: string) => createHmac('sha256', secret).update(value).digest('hex').slice(0, 32);

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a); const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
