import { Link } from 'react-router-dom';
import WorldClock from '../components/tools/WorldClock';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function WorldClockPage() {
  useDocumentTitle('World Clock');
  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}><Link to="/tools">Tools</Link> / World Clock</nav>
      <header className="page-header">
        <h1>World Clock</h1>
        <p>Live local time for the cities you care about.</p>
      </header>
      <WorldClock />
    </div>
  );
}
