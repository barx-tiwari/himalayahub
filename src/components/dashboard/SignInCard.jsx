import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';

/**
 * Local "sign in": creates a profile stored in LocalStorage only.
 * Replace with real auth (Firebase Auth, Supabase Auth, your API) later —
 * see README "Connecting a backend".
 */
export default function SignInCard({ title = 'Sign in to your dashboard' }) {
  const { setProfile } = useProgress();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('40');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setProfile({ name: name.trim(), goalWpm: Number(goal) || 40, joined: new Date().toISOString() });
  };
  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 480, margin: '0 auto' }} aria-labelledby="signin-title" noValidate>
      <span className="icon-tile" style={{ marginBottom: 12 }}><LogOut aria-hidden="true" style={{ transform: 'scaleX(-1)' }} /></span>
      <h1 id="signin-title" style={{ fontSize: 'var(--fs-2xl)' }}>{title}</h1>
      <p className="muted">Your progress is saved in this browser only. No password or email is needed.</p>
      <div className="stack">
        <div className="field">
          <label htmlFor="si-name">Your name</label>
          <input id="si-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
            aria-invalid={Boolean(error)} aria-describedby={error ? 'si-err' : undefined} />
          {error && <span id="si-err" className="field-hint" style={{ color: 'var(--danger)' }}>{error}</span>}
        </div>
        <div className="field">
          <label htmlFor="si-goal">Typing goal (WPM)</label>
          <select id="si-goal" className="select" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {[25, 30, 40, 50, 60, 80].map((g) => <option key={g} value={g}>{g} WPM</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Continue</button>
      </div>
    </form>
  );
}
