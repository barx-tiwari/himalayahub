import { useEffect, useRef, useState } from 'react';
import { imageSources } from '../../services/imageService';

function Fallback({ label, className }) {
  return (
    <span className={`img-fallback ${className}`} role={label ? 'img' : undefined} aria-label={label || undefined}>
      <svg viewBox="0 0 120 60" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="M0 60 L0 42 L22 26 L34 36 L54 14 L70 32 L84 22 L102 38 L120 30 L120 60 Z" /></svg>
    </span>
  );
}

/**
 * Responsive photo: srcset at Commons' standard widths, lazy by default,
 * decoded off the main thread, and a mountain placeholder if it fails.
 * `priority` is for the one above-the-fold hero image.
 */
export default function SmartImage({ photo, sizes = '100vw', priority = false, className = '', alt, ...rest }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  const s = imageSources(photo);
  const label = alt ?? photo?.alt ?? '';
  useEffect(() => { if (priority && ref.current) ref.current.setAttribute('fetchpriority', 'high'); }, [priority]);
  useEffect(() => { setFailed(false); }, [photo?.file, photo?.src]);
  // An image can fail before React attaches onError (e.g. a cached failure); catch that too.
  useEffect(() => { const el = ref.current; if (el && el.complete && el.naturalWidth === 0 && el.currentSrc) setFailed(true); });
  if (!s || failed) return <Fallback label={label} className={className} />;
  const img = (
    <img ref={ref} src={s.src} srcSet={s.srcSet} sizes={sizes} alt={label} className={className}
      loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} {...rest} />
  );
  return s.sources.length ? <picture>{s.sources.map((x) => <source key={x.type} type={x.type} srcSet={x.srcSet} />)}{img}</picture> : img;
}
