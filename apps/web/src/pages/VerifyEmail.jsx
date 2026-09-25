import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import OtpForm from '../components/auth/OtpForm';
import { LogoMark } from '../components/layout/Logo';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** /verify-email — the emailed link (?token=) or the 6-digit code for a signed-in account. */
export default function VerifyEmail() {
  useDocumentTitle('Confirm your email');
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, status, refresh } = useAuth();
  const [link, setLink] = useState({ state: token ? 'checking' : 'none', message: '' });
  const once = useRef(false);
  useEffect(() => {
    if (!token || once.current) return; once.current = true;
    api.post('/auth/verify-email', { token }).then(() => { setLink({ state: 'done', message: '' }); refresh(); })
      .catch((e) => setLink({ state: 'error', message: e.message }));
  }, [token, refresh]);

  const done = link.state === 'done' || (user && user.emailVerified && link.state !== 'checking');
  if (status === 'ready' && !user && !token) return <Navigate to="/login?next=/verify-email" replace />;
  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <LogoMark className="auth-mark" />
        {done ? (<>
          <h1><CheckCircle2 aria-hidden="true" className="inline-ico" style={{ color: 'var(--success)' }} /> Email confirmed</h1>
          <p className="muted">You can now post and vote in the community, save places and plan trips.</p>
          <Link to="/community" className="btn btn-primary btn-block">Go to the community</Link>
          <Link to="/hidden-gems" className="btn btn-secondary btn-block">Explore Hidden Gems</Link>
        </>) : link.state === 'checking' ? (<><h1>Confirming…</h1><p className="muted" role="status">One moment.</p></>) : (<>
          <h1>Confirm your email</h1>
          {link.state === 'error' && <p className="alert-inline error" role="alert">{link.message} {user ? 'Use the code below instead.' : <Link to="/login?next=/verify-email">Sign in to get a new code.</Link>}</p>}
          {user && <OtpForm onVerified={() => setLink({ state: 'done', message: '' })} />}
        </>)}
      </div>
    </div>
  );
}
