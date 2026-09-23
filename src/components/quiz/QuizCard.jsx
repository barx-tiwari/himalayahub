import { Check, X } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * One multiple-choice question. Once `revealed`, options lock and the
 * correct answer plus explanation are shown.
 */
export default function QuizCard({ question, selected, onSelect, revealed, number, total, headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <div>
      {number != null && <p className="small muted" style={{ marginBottom: 4 }}>Question {number} of {total}</p>}
      <H style={{ fontSize: 'var(--fs-xl)' }} id={`q-${question.id}`}>{question.question}</H>
      <ul className="quiz-options" aria-labelledby={`q-${question.id}`}>
        {question.options.map((opt, i) => {
          const isCorrect = revealed && i === question.answer;
          const isWrong = revealed && i === selected && i !== question.answer;
          const cls = ['quiz-option', selected === i && !revealed && 'is-selected', isCorrect && 'is-correct', isWrong && 'is-wrong'].filter(Boolean).join(' ');
          let status = '';
          if (isCorrect) status = ' (correct answer)';
          else if (isWrong) status = ' (your answer, incorrect)';
          return (
            <li key={opt}>
              <button type="button" className={cls} onClick={() => onSelect(i)} disabled={revealed} aria-pressed={selected === i}>
                <span className="letter" aria-hidden="true">{isCorrect ? <Check size={16} /> : isWrong ? <X size={16} /> : LETTERS[i]}</span>
                <span><span className="sr-only">{LETTERS[i]}. </span>{opt}<span className="sr-only">{status}</span></span>
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {revealed && (
          <div className={`alert ${selected === question.answer ? 'alert-success' : 'alert-error'}`}>
            {selected === question.answer ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
            <p>
              <strong>{selected === question.answer ? 'Correct!' : selected == null ? `Time's up. Answer: ${LETTERS[question.answer]}.` : `Not quite. The answer is ${LETTERS[question.answer]}.`}</strong>{' '}
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
