import { useEffect, useState } from 'react';

/**
 * Screenshot DETERRENCE for sensitive views (community threads).
 *
 * No website can prevent screenshots: the operating system, another device's camera or
 * browser dev tools can always capture the screen. These measures only discourage casual
 * capture and make leaked images traceable to "HimalayaHub community" rather than
 * frictionless. They must never be sold to users as protection.
 *
 * What it does while `enabled`:
 *  - blocks the context menu (right-click "Save image / Copy") inside the protected element
 *  - reports `obscured = true` when the tab is hidden or the window loses focus, so the
 *    content can be blurred (many screenshot tools steal focus first)
 *  - on the PrintScreen key, briefly obscures and overwrites the clipboard (best effort;
 *    browsers only deliver the key event on some platforms, and never for OS shortcuts
 *    such as Win+Shift+S or Cmd+Shift+4)
 *  - printing is handled in CSS (.capture-guard is hidden in @media print)
 */
export function useCaptureDeterrence(ref, { enabled = true } = {}) {
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    const onContext = (e) => { if (el && el.contains(e.target)) e.preventDefault(); };
    const hide = () => setObscured(true);
    const show = () => setObscured(document.visibilityState === 'hidden');
    const onVis = () => setObscured(document.visibilityState === 'hidden');
    let timer;
    const onKey = (e) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        setObscured(true);
        navigator.clipboard?.writeText?.('Screenshots of HimalayaHub community content are discouraged.').catch(() => {});
        clearTimeout(timer); timer = setTimeout(() => setObscured(false), 1500);
      }
    };
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    window.addEventListener('keyup', onKey);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('keydown', onKey);
    };
  }, [ref, enabled]);

  return { obscured: enabled && obscured };
}
