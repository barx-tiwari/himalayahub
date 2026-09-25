import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Lightbulb } from 'lucide-react';
import { typingLessons, LESSON_PASS_ACCURACY } from '../data/typingLessons';
import { useProgress } from '../context/ProgressContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import TypingBox from '../components/typing/TypingBox';
import TypingStats from '../components/typing/TypingStats';
import Keyboard from '../components/typing/Keyboard';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import NotFound from './NotFound';

export default function TypingLesson() {
  const { lessonId } = useParams();
  const index = typingLessons.findIndex((l) => l.id === lessonId);
  const lesson = typingLessons[index];
  useDocumentTitle(lesson ? `Lesson ${index + 1}: ${lesson.title}` : 'Lesson not found');
  if (!lesson) return <NotFound />;
  return <LessonView key={lesson.id} lesson={lesson} index={index} />;
}

function LessonView({ lesson, index }) {
  const { state, saveLessonResult } = useProgress();
  const [result, setResult] = useState(null);
  const [runId, setRunId] = useState(0);
  const record = state.typingLessons[lesson.id];
  const next = typingLessons[index + 1];
  const prev = typingLessons[index - 1];

  const onFinish = useCallback((stats) => {
    const passed = stats.accuracy >= LESSON_PASS_ACCURACY;
    saveLessonResult({ lessonId: lesson.id, wpm: stats.wpm, accuracy: stats.accuracy, passed });
    setResult({ ...stats, passed });
  }, [lesson.id, saveLessonResult]);

  const engine = useTypingEngine({ text: lesson.text, durationSec: null, onFinish });
  const restart = () => { engine.reset(); setResult(null); setRunId((r) => r + 1); };

  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}>
        <Link to="/typing/lessons">Typing lessons</Link> / Lesson {index + 1}
      </nav>
      <header className="page-header">
        <h1>Lesson {index + 1}: {lesson.title}</h1>
        <p>{lesson.summary}</p>
      </header>

      <div className="typing-layout">
        <div className="stack">
          <section className="card" aria-labelledby="explain">
            <h2 id="explain" className="card-title">How it works</h2>
            <p>{lesson.explanation}</p>
            <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
              {lesson.tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>

          <section aria-label="Keyboard guide">
            <Keyboard highlight={lesson.keys} next={engine.status === 'finished' ? null : lesson.text[engine.input.length]} />
            <p className="small muted" style={{ marginTop: 8 }}>Light keys are this lesson's focus; the filled key is the next one to press.</p>
          </section>

          {result ? (
            <section className="card" aria-live="polite">
              <Alert type={result.passed ? 'success' : 'warning'}>
                <p><strong>{result.passed ? 'Lesson passed!' : 'Almost there.'}</strong> {result.wpm} WPM with {result.accuracy}% accuracy.
                  {!result.passed && ` You need ${LESSON_PASS_ACCURACY}% accuracy to pass. Slow down a little and try again.`}</p>
              </Alert>
              <div className="row" style={{ marginTop: 16 }}>
                <Button icon={RotateCcw} variant={result.passed ? 'secondary' : 'primary'} onClick={restart}>Practise again</Button>
                {next && <Button to={`/typing/lessons/${next.id}`} variant={result.passed ? 'primary' : 'secondary'} iconRight={ArrowRight}>Next: {next.title}</Button>}
                {!next && <Button to="/typing" variant="secondary">Take a timed challenge</Button>}
              </div>
            </section>
          ) : (
            <>
              <div className="typing-hud">
                <span className="small muted">Untimed — accuracy matters most. Esc restarts.</span>
                <Button variant="ghost" size="sm" icon={RotateCcw} onClick={restart}>Restart</Button>
              </div>
              <TypingBox key={runId} text={lesson.text} input={engine.input} status={engine.status} onChange={engine.handleChange} onRestart={restart} label={`Practice area for ${lesson.title}`} />
              <ProgressBar value={engine.stats.progress} label="Lesson progress" />
            </>
          )}
        </div>

        <aside className="stack" aria-label="Lesson score">
          <div className="card">
            <h2 className="card-title">Score</h2>
            <TypingStats stats={result || engine.stats} />
          </div>
          <div className="card">
            <h2 className="card-title">Your record</h2>
            {record ? (
              <p className="small" style={{ margin: 0 }}>
                {record.completed && <span className="chip chip-success" style={{ marginBottom: 8 }}><Check aria-hidden="true" /> Passed</span>}<br />
                Best speed: <strong>{record.bestWpm} WPM</strong><br />
                Best accuracy: <strong>{record.bestAccuracy}%</strong><br />
                Attempts: {record.attempts}
              </p>
            ) : <p className="small muted" style={{ margin: 0 }}>No attempts yet.</p>}
          </div>
          <div className="alert alert-info"><Lightbulb aria-hidden="true" /><p>Keep your eyes on the screen, not the keyboard. The bumps on F and J guide you home.</p></div>
          <div className="row-between">
            {prev ? <Button to={`/typing/lessons/${prev.id}`} variant="ghost" size="sm" icon={ArrowLeft}>Previous</Button> : <span />}
            {next && <Button to={`/typing/lessons/${next.id}`} variant="ghost" size="sm" iconRight={ArrowRight}>Next</Button>}
          </div>
        </aside>
      </div>
    </div>
  );
}
