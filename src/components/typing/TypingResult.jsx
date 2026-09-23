import { useEffect, useRef } from 'react';
import { RotateCcw, Shuffle, Share2, Trophy } from 'lucide-react';
import Button from '../ui/Button';

export default function TypingResult({ result, isBest, onRetry, onNew, onShare, title = 'Typing Result' }) {
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return (
    <section className="card" aria-labelledby="result-title">
      <div className="row-between">
        <h2 id="result-title" ref={headingRef} tabIndex={-1} style={{ margin: 0 }}>{title}</h2>
        {isBest && <span className="chip chip-success"><Trophy aria-hidden="true" /> New personal best</span>}
      </div>
      <div className="result-hero">
        <div className="stat"><span className="stat-value">{result.wpm}</span><span className="stat-label">WPM</span></div>
        <div className="stat"><span className="stat-value">{result.accuracy}%</span><span className="stat-label">Accuracy</span></div>
        <div className="stat"><span className="stat-value">{result.characters}</span><span className="stat-label">Characters</span></div>
        <div className="stat"><span className="stat-value">{result.errors}</span><span className="stat-label">Errors</span></div>
      </div>
      <p className="muted small">
        Correct characters: {result.correct} · Incorrect (left unfixed): {result.incorrect} · Raw speed: {result.rawWpm} WPM · Time: {Math.round(result.elapsedMs / 1000)}s
      </p>
      <div className="row">
        {onRetry && <Button icon={RotateCcw} onClick={onRetry}>Try Again</Button>}
        {onNew && <Button variant="secondary" icon={Shuffle} onClick={onNew}>New Challenge</Button>}
        {onShare && <Button variant="ghost" icon={Share2} onClick={onShare}>Share Result</Button>}
      </div>
    </section>
  );
}
