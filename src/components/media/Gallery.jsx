import { useState } from 'react';
import { Expand } from 'lucide-react';
import SmartImage from './SmartImage';
import Lightbox from './Lightbox';
import { useCredits } from '../../hooks/useCredits';
import { creditLine } from '../../services/imageService';

/** Desktop: one large image + smaller ones. Mobile: swipeable row. Click opens the lightbox. */
export default function Gallery({ photos, title }) {
  const [open, setOpen] = useState(null);
  const credits = useCredits(photos);
  return (
    <>
      <div className={`gallery count-${Math.min(photos.length, 5)}`}>
        {photos.slice(0, 5).map((p, i) => (
          <button key={p.file || p.src} type="button" className={`gallery-item${i === 0 ? ' is-lead' : ''}`} onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}>
            <SmartImage photo={p} sizes={i === 0 ? '(min-width: 900px) 60vw, 85vw' : '(min-width: 900px) 25vw, 70vw'} />
            <span className="gallery-zoom" aria-hidden="true"><Expand /></span>
          </button>
        ))}
      </div>
      <p className="src-note gallery-credit">{creditLine(photos[0], credits[photos[0]?.file])}. Tap a photo to see every credit.</p>
      {open != null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} credits={credits} title={title} />}
    </>
  );
}
