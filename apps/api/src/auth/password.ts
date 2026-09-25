import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';

/**
 * scrypt (memory-hard, built into Node — no native addon to break deploys).
 * Parameters follow OWASP guidance (N=2^17, r=8, p=1). The hash string is
 * self-describing so parameters can be raised later without breaking old hashes.
 */
const N = 2 ** 17; const R = 8; const P = 1; const KEYLEN = 64; const MAXMEM = 256 * 1024 * 1024;
const scrypt = (pw: string, salt: Buffer, len: number, o: { N: number; r: number; p: number }) =>
  new Promise<Buffer>((resolve, reject) => _scrypt(pw, salt, len, { ...o, maxmem: MAXMEM }, (e, k) => (e ? reject(e) : resolve(k))));

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const [alg, n, r, p, saltB64, keyB64] = stored.split('$');
  if (alg !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const key = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const needsRehash = (stored: string) => !stored.startsWith(`scrypt$${N}$${R}$${P}$`);

/** Returns a user-facing problem, or null if the password is acceptable. */
export function passwordProblem(pw: string, context: string[] = []): string | null {
  if (pw.length < 10) return 'Use at least 10 characters.';
  if (pw.length > 128) return 'Use at most 128 characters.';
  if (/^(.)\1+$/.test(pw)) return 'Avoid repeating a single character.';
  const lower = pw.toLowerCase();
  if (['password', 'himalayahub', 'qwerty', '1234567890', 'nepal123'].some((w) => lower.includes(w))) return 'Avoid common words and patterns.';
  if (context.flatMap((c) => String(c || '').toLowerCase().split(/[@\s._-]+/)).filter((c) => c.length >= 4).some((c) => lower.includes(c))) return 'Don’t include your name or email.';
  return null;
}

/** Hash of a random value: verifying against it keeps login timing equal for unknown emails. */
let dummy: Promise<string> | null = null;
export const dummyHash = () => (dummy ??= hashPassword(randomBytes(16).toString('hex')));
