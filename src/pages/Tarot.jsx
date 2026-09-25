import { useEffect, useRef, useState } from 'react';
import { Info, RotateCcw, Shuffle } from 'lucide-react';
import TarotCard from '../components/tarot/TarotCard';
import Segmented from '../components/ui/Segmented';
import Button from '../components/ui/Button';
import { tarotCards } from '../data/tarotCards';
import { shuffle } from '../utils/random';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SPREADS = [{ id: 'single', label: 'Single card' }, { id: 'three', label: 'Three cards' }];
const POSITIONS = { single: ['Your card'], three: ['Past', 'Present', 'Future'] };
const POSITION_HINT = {
  'Your card': 'A theme to reflect on today.',
  Past: 'What has shaped the situation.',
  Present: 'Where your attention is now.',
  Future: 'A possible direction if things continue — not a fixed outcome.',
};

export default function Tarot() {
  useDocumentTitle('Tarot Reading');
  const [spread, setSpread] = useState('three');
  const [question, setQuestion] = useState('');
  const [drawn, setDrawn] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [dealKey, setDealKey] = useState(0);
  const timers = useRef([]);
  const readingRef = useRef(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const positions = POSITIONS[spread];
  const allFlipped = drawn.length > 0 && flipped.every(Boolean);

  const draw = () => {
    timers.current.forEach(clearTimeout);
    const cards = shuffle(tarotCards).slice(0, positions.length);
    setDrawn(cards);
    setFlipped(cards.map(() => false));
    setDealKey((k) => k + 1);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    cards.forEach((_, i) => {
      timers.current.push(setTimeout(() => setFlipped((f) => f.map((v, j) => (j === i ? true : v))), reduce ? 0 : 700 + i * 650));
    });
  };
  const reset = () => { timers.current.forEach(clearTimeout); setDrawn([]); setFlipped([]); };
  const changeSpread = (s) => { setSpread(s); reset(); };

  useEffect(() => {
    if (allFlipped) readingRef.current?.focus({ preventScroll: true });
  }, [allFlipped]);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Tarot Reading</h1>
        <p>Draw from the 22 Major Arcana and use the cards as prompts for reflection.</p>
      </header>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <Info aria-hidden="true" />
        <p><strong>For entertainment and reflection only.</strong> Tarot cannot predict or guarantee future events. Please don't use it for health, money, legal or safety decisions.</p>
      </div>

      <div className="card">
        <div className="row-between">
          <Segmented label="Spread" options={SPREADS} value={spread} onChange={changeSpread} />
          <div className="row">
            {drawn.length > 0 && <Button variant="ghost" icon={RotateCcw} onClick={reset}>Clear</Button>}
            <Button icon={Shuffle} onClick={draw}>{drawn.length ? 'Draw again' : 'Draw Cards'}</Button>
          </div>
        </div>
        <div className="field" style={{ marginTop: 16, maxWidth: 520 }}>
          <label htmlFor="tarot-q">Question or focus (optional)</label>
          <input id="tarot-q" className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How can I approach my exams?" maxLength={140} />
        </div>

        <div className="tarot-table" aria-live="polite">
          {positions.map((pos, i) => (
            <div className="tarot-slot" key={`${pos}-${dealKey}`}>
              <span className="tarot-slot-label">{pos}</span>
              <TarotCard card={drawn[i]} flipped={Boolean(flipped[i])} drawing={drawn.length > 0} position={pos}
                onFlip={drawn[i] && !flipped[i] ? () => setFlipped((f) => f.map((v, j) => (j === i ? true : v))) : undefined} />
            </div>
          ))}
        </div>
        {!drawn.length && <p className="muted" style={{ textAlign: 'center', margin: 0 }}>Press “Draw Cards” to shuffle the deck and deal your spread.</p>}
      </div>

      {allFlipped && (
        <section className="section" aria-labelledby="reading-title">
          <div className="section-title">
            <h2 id="reading-title" ref={readingRef} tabIndex={-1}>Your reading{question.trim() ? `: “${question.trim()}”` : ''}</h2>
          </div>
          <div className="reading-grid">
            {drawn.map((c, i) => (
              <article className="card" key={c.id}>
                <p className="small muted" style={{ marginBottom: 4 }}>{positions[i]} · {POSITION_HINT[positions[i]]}</p>
                <h3 style={{ marginBottom: 8 }}><span aria-hidden="true">{c.symbol}</span> {c.name}</h3>
                <div className="row" style={{ marginBottom: 12, gap: 6 }}>{c.keywords.map((k) => <span className="chip" key={k}>{k}</span>)}</div>
                <p><strong>Meaning:</strong> {c.meaning}</p>
                <p style={{ margin: 0 }}><strong>Interpretation:</strong> {c.interpretation}</p>
              </article>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 16 }}>Treat this as a conversation starter with yourself. Your choices shape what happens next.</p>
        </section>
      )}
    </div>
  );
}
