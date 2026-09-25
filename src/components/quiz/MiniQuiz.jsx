import { useState } from 'react';
import QuizCard from './QuizCard';

/** Untimed, unscored check-your-understanding questions inside a lesson. */
export default function MiniQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  return (
    <div className="stack">
      {questions.map((q, i) => (
        <QuizCard key={q.id} question={q} headingLevel={4} selected={answers[i]} revealed={answers[i] != null}
          onSelect={(choice) => setAnswers((a) => ({ ...a, [i]: choice }))} number={i + 1} total={questions.length} />
      ))}
    </div>
  );
}
