import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Keyboard as KeyboardIcon, RotateCcw, Trophy } from 'lucide-react';
import TypingBox from '../components/typing/TypingBox';
import TypingStats from '../components/typing/TypingStats';
import TypingResult from '../components/typing/TypingResult';
import Segmented from '../components/ui/Segmented';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProgress } from '../context/ProgressContext';
import { useUI } from '../context/UIContext';
import { generateText } from '../utils/typingText';
import { typingLevels, typingModes } from '../data/typingTexts';
import { dateKey, formatShortDate } from '../utils/format';
import { shareText } from '../utils/share';

const TIME_OPTIONS = [
  { id: '15', label: '15s' },
  { id: '30', label: '30s' },
  { id: '60', label: '60s' },
  { id: 'custom', label: 'Custom' },
];

export default function Typing() {
  useDocumentTitle('Typing Challenge');
  const [params, setParams] = useSearchParams();
  const isDaily = params.get('daily') === '1';
  const { state, derived, addTypingResult } = useProgress();
  const { toast } = useUI();

  const [settings, setSettings] = useLocalStorage('typing:settings', { mode: 'paragraphs', level: 'beginner', time: '30', custom: 90 });
  const [seed, setSeed] = useState(() => String(Math.random()));
  const [runId, setRunId] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const mode = isDaily ? 'paragraphs' : settings.mode;
  const level = isDaily ? 'intermediate' : settings.level;
  const durationSec = isDaily ? 60 : settings.time === 'custom' ? Math.min(600, Math.max(5, Number(settings.custom) || 60)) : Number(settings.time);
  const textSeed = isDaily ? `daily-${dateKey()}` : seed;

  const text = useMemo(() => generateText({ mode, level, durationSec, seed: textSeed }), [mode, level, durationSec, textSeed]);

  const bestBefore = useRef(derived.bestWpm);
  bestBefore.current = derived.bestWpm;

  const onFinish = useCallback((stats) => {
    if (!stats.characters) { setLastResult({ ...stats, skipped: true }); return; }
    const isBest = stats.wpm > bestBefore.current;
    addTypingResult({
      id: String(Date.now()), wpm: stats.wpm, accuracy: stats.accuracy, chars: stats.characters, errors: stats.errors,
      correct: stats.correct, incorrect: stats.incorrect, duration: durationSec, mode, level, daily: isDaily, date: new Date().toISOString(),
    });
    setLastResult({ ...stats, isBest });
  }, [addTypingResult, durationSec, mode, level, isDaily]);

  const engine = useTypingEngine({ text, durationSec, onFinish });

  const update = (patch) => {
    if (isDaily) setParams({}, { replace: true });
    setSettings((s) => ({ ...s, ...patch }));
    setLastResult(null);
    setRunId((r) => r + 1);
  };
  const retry = () => { engine.reset(); setLastResult(null); setRunId((r) => r + 1); };
  const newChallenge = () => { if (isDaily) setParams({}, { replace: true }); setSeed(String(Math.random())); setLastResult(null); setRunId((r) => r + 1); };
  const share = async () => {
    const outcome = await shareText({
      title: 'My HimalayaHub typing result',
      text: `I typed ${lastResult.wpm} WPM with ${lastResult.accuracy}% accuracy in a ${durationSec}s test on HimalayaHub.`,
      url: `${window.location.origin}/typing`,
    });
    if (outcome === 'copied') toast('Result copied to clipboard');
    if (outcome === 'failed') toast('Could not share. Please copy it manually.');
  };

  const leaderboard = useMemo(() => [...state.typingResults].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 10), [state.typingResults]);
  const bestFor = (d) => state.typingResults.filter((r) => r.duration === d).reduce((m, r) => Math.max(m, r.wpm), 0);
  const dailyDone = state.typingResults.some((r) => r.daily && r.date.slice(0, 10) === new Date().toISOString().slice(0, 10));

  const finished = engine.status === 'finished' && lastResult && !lastResult.skipped;

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Typing Challenge</h1>
        <p>Pick a mode and time, then just start typing. Your best scores are saved on this device.</p>
      </header>

      <div className="typing-layout">
        <div>
          {isDaily ? (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <Flame aria-hidden="true" />
              <p style={{ flex: 1 }}><strong>Daily challenge</strong> — everyone gets the same 60-second text today. {dailyDone && 'You have already completed it today; try to beat your score.'}</p>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setParams({}, { replace: true })}>Exit daily</button>
            </div>
          ) : (
            <div className="typing-controls">
              <div className="field"><span className="label" id="mode-l">Text</span>
                <Segmented label="Text type" options={typingModes} value={settings.mode} onChange={(v) => update({ mode: v })} />
              </div>
              <div className="field"><span className="label">Level</span>
                <Segmented label="Difficulty level" options={typingLevels} value={settings.level} onChange={(v) => update({ level: v })} />
              </div>
              <div className="field"><span className="label">Time</span>
                <Segmented label="Time limit" options={TIME_OPTIONS} value={settings.time} onChange={(v) => update({ time: v })} />
              </div>
              {settings.time === 'custom' && (
                <div className="field" style={{ width: 130 }}>
                  <label htmlFor="custom-time">Seconds (5–600)</label>
                  <input id="custom-time" className="input" type="number" min="5" max="600" value={settings.custom}
                    onChange={(e) => update({ custom: e.target.value })} />
                </div>
              )}
            </div>
          )}

          {finished ? (
            <TypingResult result={lastResult} isBest={lastResult.isBest} onRetry={retry} onNew={newChallenge} onShare={share} />
          ) : (
            <>
              <div className="typing-hud">
                <div className="row">
                  <span className="timer" aria-label={`${engine.timeLeft} seconds left`} role="timer">{engine.timeLeft}s</span>
                  <span className="small muted">{engine.status === 'idle' ? 'Timer starts on your first key' : 'Esc to restart'}</span>
                </div>
                <Button variant="ghost" size="sm" icon={RotateCcw} onClick={retry}>Restart</Button>
              </div>
              <TypingBox key={`${runId}-${text.length}-${textSeed}`} text={text} input={engine.input} status={engine.status}
                onChange={engine.handleChange} onRestart={retry} label="Typing challenge input" />
              <ProgressBar className="section" value={engine.stats.progress} label="Text progress" />
              {engine.status === 'finished' && lastResult?.skipped && (
                <p className="muted small">Time ran out before you typed anything. Press Restart to try again.</p>
              )}
            </>
          )}
        </div>

        <aside aria-label="Live statistics" className="stack">
          <div className="card">
            <h2 className="card-title">Live stats</h2>
            <TypingStats stats={finished ? lastResult : engine.stats} />
          </div>
          <div className="card">
            <h2 className="card-title">Personal bests</h2>
            <dl className="typing-stats" style={{ margin: 0 }}>
              {[15, 30, 60].map((d) => (
                <div className="stat" key={d}><dt className="stat-label">{d}s test</dt><dd className="stat-value" style={{ margin: 0 }}>{bestFor(d) || '—'}</dd></div>
              ))}
              <div className="stat"><dt className="stat-label">Overall</dt><dd className="stat-value" style={{ margin: 0 }}>{derived.bestWpm || '—'}</dd></div>
            </dl>
          </div>
          <Button to="/typing/lessons" variant="secondary" block icon={KeyboardIcon}>Typing lessons</Button>
        </aside>
      </div>

      <section className="section" aria-labelledby="lb-title">
        <div className="section-title">
          <h2 id="lb-title"><Trophy aria-hidden="true" size={20} style={{ verticalAlign: '-3px', marginRight: 6 }} />Personal leaderboard</h2>
          <span className="small muted">Top 10 runs on this device</span>
        </div>
        {leaderboard.length ? (
          <div className="card table-wrap" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th scope="col">#</th><th scope="col">WPM</th><th scope="col">Accuracy</th><th scope="col">Errors</th><th scope="col">Mode</th><th scope="col">Level</th><th scope="col">Time</th><th scope="col">Date</th></tr></thead>
              <tbody>
                {leaderboard.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                    <td><strong>{r.wpm}</strong></td><td>{r.accuracy}%</td><td>{r.errors}</td>
                    <td>{typingModes.find((m) => m.id === r.mode)?.label}{r.daily ? ' · daily' : ''}</td>
                    <td>{typingLevels.find((l) => l.id === r.level)?.label}</td><td>{r.duration}s</td><td>{formatShortDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card"><EmptyState icon={Trophy} title="No runs yet">Finish your first challenge to start your leaderboard.</EmptyState></div>
        )}
        <p className="small muted" style={{ marginTop: 12 }}>Want lessons first? <Link to="/typing/lessons">Start with the home row</Link>.</p>
      </section>
    </div>
  );
}
