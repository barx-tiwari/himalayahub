import { useEffect, useState } from 'react';

/** Returns a Date that refreshes on every tick, aligned to the start of each second. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let id;
    const align = setTimeout(() => {
      setNow(new Date());
      id = setInterval(() => setNow(new Date()), intervalMs);
    }, intervalMs - (Date.now() % intervalMs));
    return () => { clearTimeout(align); clearInterval(id); };
  }, [intervalMs]);
  return now;
}
