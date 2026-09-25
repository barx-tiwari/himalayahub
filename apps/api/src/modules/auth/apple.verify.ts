import { createPublicKey, verify as cryptoVerify, type JsonWebKey } from 'node:crypto';
import { safeEqual } from '../../auth/tokens.js';

/** Apple id_token verification (no database, no env) so it can be unit-tested anywhere. */
const APPLE = 'https://appleid.apple.com';

let jwks: { at: number; keys: (JsonWebKey & { kid: string })[] } | null = null;
async function appleKeys(force = false) {
  if (!force && jwks && Date.now() - jwks.at < 3_600_000) return jwks.keys;
  const r = await fetch(`${APPLE}/auth/keys`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error('apple keys');
  jwks = { at: Date.now(), keys: ((await r.json()) as { keys: (JsonWebKey & { kid: string })[] }).keys };
  return jwks.keys;
}

export interface AppleClaims { iss: string; aud: string; exp: number; iat: number; sub: string; nonce?: string; email?: string; email_verified?: boolean | string; is_private_email?: boolean | string }

/** Verifies an Apple id_token. `getKeys` is injectable for tests. */
export async function verifyAppleIdToken(token: string, expected: { clientId: string; nonce: string }, getKeys = appleKeys, now = Math.floor(Date.now() / 1000)): Promise<AppleClaims | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header: { alg?: string; kid?: string };
  let claims: AppleClaims;
  try {
    header = JSON.parse(Buffer.from(parts[0]!, 'base64url').toString());
    claims = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
  } catch { return null; }
  if (header.alg !== 'RS256' || !header.kid) return null;
  let jwk = (await getKeys()).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await getKeys(true)).find((k) => k.kid === header.kid); // Apple rotates keys
  if (!jwk) return null;
  const okSig = cryptoVerify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2]!, 'base64url'));
  if (!okSig) return null;
  if (claims.iss !== APPLE || claims.aud !== expected.clientId || claims.exp <= now || !claims.sub) return null;
  if (!claims.nonce || !safeEqual(claims.nonce, expected.nonce)) return null;
  return claims;
}

