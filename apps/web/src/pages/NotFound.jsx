import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUI } from '../context/UIContext';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { setSearchOpen } = useUI();
  return (
    <div className="container page">
      <div className="empty">
        <p className="xp-level" style={{ color: 'var(--primary)' }} aria-hidden="true">404</p>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>This page wandered off the trail</h1>
        <p>The link may be old or mistyped.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Go home</Link>
          <button type="button" className="btn btn-secondary" onClick={() => setSearchOpen(true)}><Search aria-hidden="true" /> Search</button>
        </div>
      </div>
    </div>
  );
}
