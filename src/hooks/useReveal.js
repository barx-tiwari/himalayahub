import { useEffect } from 'react';

/**
 * Scroll-reveal for elements marked `data-reveal` inside `rootRef`.
 * Content is visible by default; the hidden start state only applies once
 * <html> has the `reveal-ready` class, so nothing disappears if JavaScript,
 * IntersectionObserver or motion is unavailable.
 */
export function useReveal(rootRef, deps = []) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const els = [...root.querySelectorAll('[data-reveal]:not(.is-visible)')];
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return undefined; }
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}
