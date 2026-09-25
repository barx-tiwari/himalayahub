/** Removes secrets and personal data before anything is logged. Pure; no dependencies. */
const SECRET_KEYS = /pass(word)?|secret|token|authorization|cookie|api[-_]?key|session|csrf|otp|credit|card/i;
const EMAIL = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth]';
  if (typeof value === 'string') return value.replace(EMAIL, '$1***@$2').replace(/Bearer\s+[\w.-]+/gi, 'Bearer [redacted]');
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redact(v, depth + 1));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = SECRET_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1);
    return out;
  }
  return value;
}

/** Keeps the first 3 octets of IPv4 / first 3 groups of IPv6 — enough for abuse triage, not identification. */
export function anonymizeIp(ip?: string | null): string | null {
  if (!ip) return null;
  const v4 = ip.replace(/^::ffff:/, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v4)) return v4.split('.').slice(0, 3).join('.') + '.0';
  return ip.split(':').slice(0, 3).join(':') + '::';
}
