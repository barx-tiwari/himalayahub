import { useMemo, useRef } from 'react';
import { EyeOff } from 'lucide-react';
import { useCaptureDeterrence } from '../../hooks/useCaptureDeterrence';

/**
 * Wraps content with screenshot deterrence: a faint tiled watermark, blur when the tab
 * is inactive, no right-click menu, hidden when printed. See useCaptureDeterrence for
 * the limits — this discourages capture, it cannot prevent it.
 */
export default function CaptureGuard({ children, label = 'HimalayaHub community', enabled = true }) {
  const ref = useRef(null);
  const { obscured } = useCaptureDeterrence(ref, { enabled });
  // Watermark text includes the date so a leaked screenshot is visibly dated and sourced.
  const mark = useMemo(() => `${label} · ${new Date().toISOString().slice(0, 10)}`, [label]);
  const svg = useMemo(() => {
    const t = mark.replace(/[<&>"]/g, '');
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='180'><text x='10' y='100' transform='rotate(-18 180 90)' font-family='sans-serif' font-size='14' fill='rgba(128,128,128,0.10)'>${t}</text></svg>`)}")`;
  }, [mark]);
  if (!enabled) return children;
  return (
    <div ref={ref} className={`capture-guard${obscured ? ' is-obscured' : ''}`} style={{ '--wm': svg }}>
      {children}
      {obscured && (
        <div className="capture-veil" role="status">
          <EyeOff aria-hidden="true" /> <span>Content hidden while this window is in the background.</span>
        </div>
      )}
    </div>
  );
}
