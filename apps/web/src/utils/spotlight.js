/**
 * Cursor spotlight for cards: sets --mx/--my on the hovered card so the CSS radial glow
 * follows the pointer. One passive listener for the whole app; skipped for touch and
 * reduced-motion users.
 */
const SELECTOR = '.learn-tile, .course-mini, .tin-grid > .glass, .card, .gem-card, .gems-mini a, .cm-post, .guide-block, .stay, .itin-card, .gem-fact';
export function installSpotlight() {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches) return;
  let frame = 0; let last = null;
  document.addEventListener('pointermove', (e) => {
    last = e;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const el = last.target instanceof Element ? last.target.closest(SELECTOR) : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${last.clientX - r.left}px`);
      el.style.setProperty('--my', `${last.clientY - r.top}px`);
    });
  }, { passive: true });
}
