import { Link } from 'react-router-dom';
import DateConverter from '../components/tools/DateConverter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function DateConverterPage() {
  useDocumentTitle('Date Converter');
  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}><Link to="/tools">Tools</Link> / Date Converter</nav>
      <header className="page-header">
        <h1>Date Converter</h1>
        <p>Convert between Gregorian (AD) and Bikram Sambat (BS) dates instantly.</p>
      </header>
      <DateConverter />
    </div>
  );
}
