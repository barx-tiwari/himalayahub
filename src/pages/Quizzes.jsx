import { Link } from 'react-router-dom';
import { quizCategories, quizQuestions } from '../data/quizQuestions';
import { useProgress } from '../context/ProgressContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Icon } from '../utils/icons';
import { formatShortDate } from '../utils/format';

export default function Quizzes() {
  useDocumentTitle('Quizzes');
  const { state, derived } = useProgress();
  const bestFor = (id) => state.quizResults.filter((r) => r.category === id).reduce((m, r) => Math.max(m, r.percent), -1);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Quizzes</h1>
        <p>Timed multiple-choice quizzes with explanations after every answer. {derived.quizAvg != null && `Your average so far: ${derived.quizAvg}%.`}</p>
      </header>
      <div className="hub-grid">
        {quizCategories.map((c) => {
          const count = quizQuestions.filter((q) => q.category === c.id).length;
          const best = bestFor(c.id);
          return (
            <Link key={c.id} to={`/quizzes/${c.id}`} className="card card-link hub-card">
              <span className="icon-tile"><Icon name={c.icon} /></span>
              <h2 className="card-title" style={{ margin: 0 }}>{c.name}</h2>
              <p className="card-sub">{count} questions · {Math.round((count * 30) / 60)} min limit</p>
              <span className="small">{best >= 0 ? <span className="chip chip-success">Best: {best}%</span> : <span className="chip">Not attempted</span>}</span>
            </Link>
          );
        })}
      </div>
      {state.quizResults.length > 0 && (
        <section className="section" aria-labelledby="recent-q">
          <div className="section-title"><h2 id="recent-q">Recent attempts</h2></div>
          <div className="card table-wrap" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th scope="col">Quiz</th><th scope="col">Score</th><th scope="col">Percent</th><th scope="col">Date</th></tr></thead>
              <tbody>
                {state.quizResults.slice(0, 8).map((r) => (
                  <tr key={r.id}><td>{quizCategories.find((c) => c.id === r.category)?.name}</td><td>{r.score}/{r.total}</td><td>{r.percent}%</td><td>{formatShortDate(r.date)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
