import { Link } from 'react-router-dom';
import { learnLinks } from '../data/navigation';
import { Icon } from '../utils/icons';
import ContinueLearning from '../components/courses/ContinueLearning';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Learn() {
  useDocumentTitle('Learn');
  return (
    <div className="container page">
      <header className="page-header">
        <h1>Learn</h1>
        <p>Courses to follow, notes to revise and quizzes to test yourself.</p>
      </header>
      <div className="hub-grid">
        {learnLinks.map((l) => (
          <Link key={l.to} to={l.to} className="card card-link hub-card">
            <span className="icon-tile"><Icon name={l.icon} /></span>
            <h2 className="card-title" style={{ margin: 0 }}>{l.label}</h2>
            <p className="card-sub">{l.desc}</p>
          </Link>
        ))}
      </div>
      <section className="section" aria-labelledby="cl-title">
        <div className="section-title"><h2 id="cl-title">Continue learning</h2></div>
        <ContinueLearning emptyText="You haven't started a course yet. Pick one from Courses to see it here." />
      </section>
    </div>
  );
}
