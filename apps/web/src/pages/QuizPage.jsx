import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { quizCategories, getQuestionsByCategory } from '../data/quizQuestions';
import { noteCategories } from '../data/notes';
import QuizRunner from '../components/quiz/QuizRunner';
import Button from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { shuffle } from '../utils/random';
import NotFound from './NotFound';

export default function QuizPage() {
  const { category } = useParams();
  const cat = quizCategories.find((c) => c.id === category);
  const [attempt, setAttempt] = useState(0);
  useDocumentTitle(cat ? `${cat.name} Quiz` : 'Quiz not found');
  // New random order on each attempt.
  const questions = useMemo(() => (cat ? shuffle(getQuestionsByCategory(cat.id)).slice(0, 10) : []), [cat, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cat) return <NotFound />;
  const hasNotes = noteCategories.some((n) => n.id === cat.id);
  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}><Link to="/quizzes">Quizzes</Link> / {cat.name}</nav>
      <header className="page-header">
        <h1>{cat.name} Quiz</h1>
        <p>{questions.length} questions · 30 seconds per question. Answers lock once chosen and the explanation appears.</p>
      </header>
      <QuizRunner key={attempt} questions={questions} category={cat.id} onRetry={() => setAttempt((a) => a + 1)}
        extra={hasNotes && <Button to={`/notes?category=${cat.id}`} variant="secondary">Revise {cat.name} notes</Button>} />
    </div>
  );
}
