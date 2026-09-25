import { Link } from 'react-router-dom';
import { Check, Play } from 'lucide-react';
import { typingLessons, LESSON_PASS_ACCURACY } from '../data/typingLessons';
import { useProgress } from '../context/ProgressContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

export default function TypingLessons() {
  useDocumentTitle('Typing Lessons');
  const { state, derived } = useProgress();
  const nextLesson = typingLessons.find((l) => !state.typingLessons[l.id]?.completed) || typingLessons[0];

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Typing Lessons</h1>
        <p>Ten short lessons that build touch typing step by step. Pass a lesson with {LESSON_PASS_ACCURACY}% accuracy or more.</p>
      </header>
      <div className="card row-between" style={{ marginBottom: 24 }}>
        <div style={{ flex: '1 1 260px' }}>
          <ProgressBar value={(derived.typingLessonsDone / typingLessons.length) * 100} label={`${derived.typingLessonsDone} of ${typingLessons.length} lessons passed`} />
        </div>
        <Button to={`/typing/lessons/${nextLesson.id}`} icon={Play}>{derived.typingLessonsDone ? 'Continue' : 'Start lesson 1'}</Button>
      </div>
      <ol className="lesson-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {typingLessons.map((l, i) => {
          const p = state.typingLessons[l.id];
          return (
            <li key={l.id}>
              <Link to={`/typing/lessons/${l.id}`} className={`card card-link lesson-row${p?.completed ? ' done' : ''}`} style={{ padding: 16 }}>
                <span className="lesson-num" aria-hidden="true">{p?.completed ? <Check size={20} /> : i + 1}</span>
                <span>
                  <strong>{l.title}</strong>
                  <span className="small muted" style={{ display: 'block' }}>{l.summary}</span>
                </span>
                <span className="small muted" style={{ textAlign: 'right' }}>
                  {p ? <>{p.bestWpm} WPM · {p.bestAccuracy}%<br />{p.completed ? 'Passed' : `${p.attempts} attempt${p.attempts > 1 ? 's' : ''}`}</> : 'Not started'}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
