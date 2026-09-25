import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** 403 page, used for the admin area and any restricted page. */
export default function AccessDenied({ signedInAs }) {
  useDocumentTitle('Access denied');
  return (
    <div className="container page">
      <div className="empty" role="alert">
        <ShieldAlert aria-hidden="true" />
        <p className="xp-level" style={{ color: 'var(--c-red)' }} aria-hidden="true">403</p>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>This area is for the HimalayaHub team</h1>
        <p>{signedInAs ? <>You’re signed in as <strong>{signedInAs}</strong>, which doesn’t have access to the admin panel.</> : 'You don’t have permission to view this page.'} If you think this is a mistake, ask a site administrator.</p>
        <div className="row" style={{ justifyContent: 'center' }}><Link to="/" className="btn btn-primary">Go to the website</Link></div>
      </div>
    </div>
  );
}
