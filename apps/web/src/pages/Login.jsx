import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LogoMark } from '../components/layout/Logo';
import OtpForm from '../components/auth/OtpForm';

/** Only allow same-site relative redirects (prevents open-redirect via ?next=). */
export const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/\\') ? n : '/dashboard');

const OAUTH_ERRORS = { google: 'Google sign-in didn’t complete. Please try again.', apple: 'Sign in with Apple didn’t complete. Please try again.' };

function Field({ id, label, error, hint, ...input }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} {...input} />
      {hint && !error && <span id={`${id}-hint`} className="field-hint">{hint}</span>}
      {error && <span id={`${id}-err`} className="field-error">{error}</span>}
    </div>
  );
}

export default function Login() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  useDocumentTitle(mode === 'register' ? 'Create account' : 'Sign in');
  const { user, status, login, register, apiDown, providers, oauthUrl, continueAsGuest } = useAuth();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(OAUTH_ERRORS[params.get('error')] || '');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('form'); // form → otp (after sign-up)

  if (step === 'otp' && user && !user.emailVerified) {
    return (
      <div className="container page auth-page">
        <div className="auth-card">
          <LogoMark className="auth-mark" />
          <h1>Check your email</h1>
          {message && <p className="alert-inline warn" role="status">{message}</p>}
          <OtpForm onVerified={() => navigate(next, { replace: true })} />
          <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate(next, { replace: true })}>I’ll do this later</button>
        </div>
      </div>
    );
  }
  if (status === 'ready' && user) return <Navigate to={next} replace />;
  const isReg = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (isReg && !form.name.trim()) errs.name = 'Enter your name (other members never see it).';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Enter your password.';
    else if (isReg && form.password.length < 10) errs.password = 'Use at least 10 characters.';
    setErrors(errs); setMessage('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      if (isReg) {
        const r = await register(form.name.trim(), form.email.trim(), form.password);
        setMessage(r.mailSent ? '' : r.message);
        setStep('otp'); return;
      }
      await login(form.email.trim(), form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setMessage(err.message);
    } finally { setBusy(false); }
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const guest = () => { continueAsGuest(); navigate(next === '/dashboard' ? '/' : next, { replace: true }); };

  return (
    <div className="container page auth-page">
      <form className="auth-card" onSubmit={submit} noValidate aria-labelledby="login-title">
        <LogoMark className="auth-mark" />
        <h1 id="login-title">{isReg ? 'Create your account' : 'Sign in'}</h1>
        <p className="muted">{isReg ? 'Save favourite places and trips, and join the community under an anonymous name.' : 'Welcome back to HimalayaHub.'}</p>
        {apiDown && <p className="alert-inline warn" role="status">The HimalayaHub server can’t be reached right now, so signing in isn’t available. The rest of the site still works.</p>}
        {message && <p className="alert-inline error" role="alert">{message}</p>}

        {(providers.google || providers.apple) && !apiDown && (
          <div className="oauth-row">
            {providers.google && <a className="btn btn-secondary btn-block oauth-btn" href={oauthUrl('google')}><GoogleMark /> Continue with Google</a>}
            {providers.apple && <a className="btn btn-secondary btn-block oauth-btn" href={oauthUrl('apple')}><AppleMark /> Continue with Apple</a>}
            <div className="or-sep" role="separator"><span>or with email</span></div>
          </div>
        )}

        {isReg && <Field id="li-name" label="Your name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} hint="Private. Community posts use an anonymous alias instead." />}
        <Field id="li-email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field id="li-pass" label="Password" type="password" autoComplete={isReg ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} error={errors.password} hint={isReg ? 'At least 10 characters. A few random words work well.' : undefined} />
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || apiDown}>
          {isReg ? <UserPlus aria-hidden="true" /> : <LogIn aria-hidden="true" />} {busy ? 'Please wait…' : isReg ? 'Create account' : 'Sign in'}
        </button>
        <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>
          {isReg ? <>Already have an account? <button type="button" className="linklike" onClick={() => { setMode('login'); setErrors({}); }}>Sign in</button></>
            : <>New to HimalayaHub? <button type="button" className="linklike" onClick={() => { setMode('register'); setErrors({}); }}>Create an account</button></>}
        </p>
        <button type="button" className="btn btn-ghost btn-block" onClick={guest}><UserRound aria-hidden="true" /> Continue as guest</button>
        <p className="small muted" style={{ margin: 0 }}>Guests can read everything, including the community. Posting and voting need an account with a confirmed email. <Link to="/privacy">Privacy</Link></p>
      </form>
    </div>
  );
}

function GoogleMark() {
  return (<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.96 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/></svg>);
}
function AppleMark() {
  return (<svg viewBox="0 0 17 20" width="16" height="18" aria-hidden="true" fill="currentColor"><path d="M14.1 10.6c0-2.5 2-3.7 2.1-3.7a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.9A4.8 4.8 0 0 0 1.6 7.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7 4.2 4.2 0 0 1-2.2-3.9zM11.7 3.2A4.3 4.3 0 0 0 12.7 0a4.4 4.4 0 0 0-2.9 1.5 4.1 4.1 0 0 0-1 3.1 3.6 3.6 0 0 0 2.9-1.4z"/></svg>);
}
