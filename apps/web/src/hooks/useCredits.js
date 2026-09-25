import { useEffect, useState } from 'react';
import { getCredits } from '../services/imageService';

/** Author/licence info for Commons photos, loaded lazily and cached. */
export function useCredits(photos, enabled = true) {
  const files = (photos || []).map((p) => p?.file).filter(Boolean);
  const key = files.join('|');
  const [credits, setCredits] = useState({});
  useEffect(() => {
    if (!enabled || !files.length) return undefined;
    let alive = true;
    getCredits(files).then((c) => { if (alive) setCredits(c); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return credits;
}
