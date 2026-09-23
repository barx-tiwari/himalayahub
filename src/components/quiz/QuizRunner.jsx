import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, RotateCcw, Timer } from 'lucide-react';
import QuizCard from './QuizCard';
import ScoreRing from './ScoreRing';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { useProgress } from '../../context/ProgressContext';

const SECONDS_PER_QUESTION = 30;

function Result({ questions, answers, onRetry, extra }) {
  const score = questions.filter((q, i) => answers[i] === q.answer).length;
  const percent = Math.round((score / questions.length) * 100);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const verdict = percent >= 80 ? 'Excellent work!' : percent >= 50 ? 'Good effort. Review the explanations below.' : 'Keep practising. The notes will help.';
  return (
    <div className="card quiz-card">
      <div className="row" style={{ gap: 24 }}>
        <ScoreRing percent={percent} />
        <div>
          <h2 ref={heading} tabIndex={-1}>Final result</h2>
          <p style={{ margin: 0 }}><strong>{score} / {questions.length}</strong> correct. {verdict}</p>
        </div>
      </div>
      <h3 className="section" style={{ fontSize: 'var(--fs-lg)' }}>Review</h3>
      <ol style={{ paddingLeft: '1.2em' }}>
        {questions.map((q, i) => (
          <li key={q.id} style={{ marginBottom: 12 }}>
            <strong>{q.question}</strong><br />
            <span className={answers[i] === q.answer ? '' : 'muted'}>
              {answers[i] === q.answer ? '✓ ' : '✗ '}
              Your answer: {answers[i] != null ? q.options[answers[i]] : 'No answer'} · Correct: {q.options[q.answer]}
            </span>
            <div className="small muted">{q.explanation}</div>
          </li>
        ))}
      </ol>
      <div className="row"><Button icon={RotateCcw} onClick={onRetry}>Try again</Button>{extra}</div>
    </div>
  );
}

/** Full quiz flow: timer, answer/explanation, prev/next, final result. */
export default function QuizRunner({ questions, category, onRetry, extra }) {
  const { addQuizResult } = useProgress();
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(total * SECONDS_PER_QUESTION);
  const savedRef = useRef(false);

  const finish = useCallback(() => setFinished(true), []);

  useEffect(() => {
    if (finished) return undefined;
    const id = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(id);
  }, [finished]);
  useEffect(() => { if (timeLeft === 0) finish(); }, [timeLeft, finish]);

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    const score = questions.filter((q, i) => answers[i] === q.answer).length;
    addQuizResult({ id: String(Date.now()), category, score, total, percent: Math.round((score / total) * 100), date: new Date().toISOString() });
  }, [finished, answers, questions, category, total, addQuizResult]);

  const q = questions[index];
  const answered = answers[index] != null;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const select = useCallback((i) => {
    setAnswers((a) => (a[index] != null ? a : { ...a, [index]: i }));
  }, [index]);

  // Keyboard: 1-4 or A-D to answer, ←/→ to move.
  useEffect(() => {
    if (finished) return undefined;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (document.querySelector('[role="dialog"]')) return;
      const k = e.key.toLowerCase();
      const n = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
      if (n >= 0 && n < q.options.length) select(n);
      if (e.key === 'ArrowRight' && index < total - 1) setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finished, q, index, total, select]);

  if (finished) return <Result questions={questions} answers={answers} onRetry={onRetry} extra={extra} />;

  const mm = String(Math.floor(timeLeft / 60)).padStart(1, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="card quiz-card">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <span className="chip chip-primary"><Timer aria-hidden="true" /> <span role="timer" aria-label={`${timeLeft} seconds left`}>{mm}:{ss}</span></span>
        <span className="small muted">{answeredCount} of {total} answered</span>
      </div>
      <ProgressBar value={(answeredCount / total) * 100} showValue={false} label="Quiz progress" />
      <div style={{ marginTop: 20 }}>
        <QuizCard question={q} selected={answers[index]} onSelect={select} revealed={answered} number={index + 1} total={total} />
      </div>
      <div className="row-between" style={{ marginTop: 20 }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>Previous</Button>
        {index < total - 1
          ? <Button iconRight={ArrowRight} onClick={() => setIndex((i) => i + 1)}>Next question</Button>
          : <Button icon={Flag} onClick={finish}>Finish quiz</Button>}
      </div>
      <nav aria-label="Jump to question" style={{ marginTop: 20 }}>
        <div className="quiz-dots">
          {questions.map((qq, i) => {
            const a = answers[i];
            const cls = a == null ? '' : a === qq.answer ? 'ok' : 'bad';
            return (
              <button key={qq.id} type="button" className={cls} aria-current={i === index} onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${a == null ? ', unanswered' : a === qq.answer ? ', correct' : ', incorrect'}`}>{i + 1}</button>
            );
          })}
        </div>
        {answeredCount === total && index !== total - 1 && (
          <Button size="sm" variant="ghost" icon={Flag} onClick={finish} className="section">All answered — finish now</Button>
        )}
      </nav>
      <p className="small muted" style={{ marginTop: 16, marginBottom: 0 }}>Tip: press <kbd>1</kbd>–<kbd>4</kbd> to answer and <kbd>←</kbd> <kbd>→</kbd> to move.</p>
    </div>
  );
}
