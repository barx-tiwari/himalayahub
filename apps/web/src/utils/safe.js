/**
 * Helpers for treating external data as untrusted.
 * Everything from APIs/RSS is rendered as plain text by React (no
 * dangerouslySetInnerHTML anywhere), and links/images must be http(s).
 */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Strip tags/entities, collapse whitespace, cap length. Returns '' for non-strings. */
export function cleanText(value, max = 400) {
  if (value == null) return '';
  let s = String(value);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ');
  s = s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    const k = e.toLowerCase();
    if (ENTITIES[k]) return ENTITIES[k];
    if (k.startsWith('#x')) return String.fromCodePoint(parseInt(k.slice(2), 16) || 32);
    if (k.startsWith('#')) return String.fromCodePoint(parseInt(k.slice(1), 10) || 32);
    return m;
  });
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

/** Only allow absolute http(s) URLs; anything else (javascript:, data:, relative) becomes null. */
export function safeUrl(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}

/** Finite number or null (accepts numeric strings like "1,234.5"). */
export function num(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Valid ISO-ish date → ISO string, else null. */
export function isoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const arr = (v) => (Array.isArray(v) ? v : []);
