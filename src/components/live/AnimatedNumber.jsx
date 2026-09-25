import { useEffect, useRef, useState } from 'react';

/** Counts up to `value` once when it first appears. Respects reduced motion. */
export default function AnimatedNumber({ value, duration = 900, format = (n) => Math.round(n).toLocaleString() }) {
  const [shown, setShown] = useState(value);
  const from = useRef(0);
  useEffect(() => {
    if (!Number.isFinite(value)) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(value); return undefined; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - k) ** 3;
      setShown(a + (value - a) * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{Number.isFinite(value) ? format(shown) : '—'}</span>;
}
