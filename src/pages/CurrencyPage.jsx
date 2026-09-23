import { Link } from 'react-router-dom';
import CurrencyConverter from '../components/tools/CurrencyConverter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function CurrencyPage() {
  useDocumentTitle('Currency Converter');
  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}><Link to="/tools">Tools</Link> / Currency Converter</nav>
      <header className="page-header">
        <h1>Currency Converter</h1>
        <p>Convert between NPR and ten common world currencies.</p>
      </header>
      <CurrencyConverter />
    </div>
  );
}
