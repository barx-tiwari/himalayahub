import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import SmartImage from './SmartImage';
import { creditLine } from '../../services/imageService';

/** Fullscreen viewer. ← → move, Esc closes, swipe on touch screens. */
export default function Lightbox({ photos, index, onIndex, onClose, credits = {}, title }) {
  const closeRef = useRef(null);
  const touch = useRef(null);
  const n = photos.length;
  const go = (d) => onIndex((index + d + n) % n);

  useEffect(() => {
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; prevFocus?.focus?.(); };
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Tab') {
        const f = [...document.querySelectorAll('.lightbox button')];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const p = photos[index];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title ? `${title} photos` : 'Photo viewer'}, image ${index + 1} of ${n}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
      <button ref={closeRef} type="button" className="lb-btn lb-close" onClick={onClose} aria-label="Close (Esc)"><X /></button>
      {n > 1 && <button type="button" className="lb-btn lb-prev" onClick={() => go(-1)} aria-label="Previous image (Left arrow)"><ChevronLeft /></button>}
      <figure className="lb-figure">
        <SmartImage key={p.file || p.src} photo={p} priority sizes="100vw" className="lb-img" />
        <figcaption>
          <span>{p.alt}</span>
          <span className="lb-credit">{creditLine(p, credits[p.file])}{credits[p.file]?.page && <> · <a href={credits[p.file].page} target="_blank" rel="noopener noreferrer">Licence and source</a></>}</span>
          <span className="lb-count" aria-hidden="true">{index + 1} / {n}</span>
        </figcaption>
      </figure>
      {n > 1 && <button type="button" className="lb-btn lb-next" onClick={() => go(1)} aria-label="Next image (Right arrow)"><ChevronRight /></button>}
    </div>
  );
}
