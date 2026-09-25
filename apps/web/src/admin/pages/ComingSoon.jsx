import { Link, useLocation } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { findNavItem, SLICE_NAMES } from '../nav';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/** Honest placeholder for sections whose slice isn't built yet. */
export default function ComingSoon() {
  const { pathname } = useLocation();
  const item = findNavItem(pathname);
  useDocumentTitle(item ? `${item.label} · Admin` : 'Admin');
  if (!item) return <div className="admin-page"><h1>Page not found</h1><p><Link to="/admin">Back to the dashboard</Link></p></div>;
  return (
    <div className="admin-page">
      <header className="admin-head"><h1>{item.label}</h1></header>
      <div className="admin-card coming">
        <Hammer aria-hidden="true" />
        <div>
          <h2>Not built yet</h2>
          <p>Managing {item.label.toLowerCase()} arrives with the <strong>{SLICE_NAMES[item.slice]}</strong> update. Until then this content still comes from the website’s built-in data.</p>
          <Link to="/admin" className="btn btn-secondary btn-sm">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
