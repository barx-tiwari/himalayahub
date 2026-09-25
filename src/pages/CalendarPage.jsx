import { Link } from 'react-router-dom';
import Calendar from '../components/tools/Calendar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function CalendarPage() {
  useDocumentTitle('Nepali + English Calendar');
  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}><Link to="/tools">Tools</Link> / Nepali + English Calendar</nav>
      <header className="page-header">
        <h1>Nepali + English Calendar</h1>
        <p>Switch between the Bikram Sambat and Gregorian calendars. Both dates are always shown together.</p>
      </header>
      <Calendar />
    </div>
  );
}
