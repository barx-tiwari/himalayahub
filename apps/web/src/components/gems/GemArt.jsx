/**
 * Illustrated hero used until an editor adds a verified photo. Deterministic per gem so each
 * place gets its own ridge line and palette; no external requests.
 */
const PALETTES = [['#0f3d4c', '#1d6f7a', '#f2b33d'], ['#2b1d4f', '#5b3f8c', '#f28c6b'], ['#123524', '#2f6b4f', '#e9d47a'], ['#1c2c4c', '#3f6aa5', '#f5c26b'], ['#3a1c2c', '#8c3f5b', '#f7d08a']];
function ridge(seed, base, amp, n = 9) {
  let x = seed; const r = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  const pts = Array.from({ length: n + 1 }, (_, i) => [i * (400 / n), base - r() * amp]);
  return `M0 200 L${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(' L')} L400 200 Z`;
}
export default function GemArt({ slug = '', rank = 1, className = '', label }) {
  const seed = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0) + rank;
  const [deep, mid, sun] = PALETTES[seed % PALETTES.length];
  return (
    <svg className={`gem-art ${className}`} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs><linearGradient id={`sky-${slug}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mid} /><stop offset="1" stopColor={deep} /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#sky-${slug})`} />
      <circle cx={80 + (seed % 240)} cy="62" r="22" fill={sun} opacity="0.9" />
      <path d={ridge(seed, 120, 70)} fill="#fff" opacity="0.18" />
      <path d={ridge(seed + 7, 150, 55)} fill={deep} opacity="0.75" />
      <path d={ridge(seed + 13, 185, 35)} fill={deep} />
    </svg>
  );
}
