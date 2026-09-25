import { useEffect, useState } from 'react';
import { Download, LogOut, Trash2 } from 'lucide-react';
import SignInCard from '../components/dashboard/SignInCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Segmented from '../components/ui/Segmented';
import { formatShortDate, initials } from '../utils/format';

export default function Profile() {
  useDocumentTitle('Profile');
  const { state, derived, setProfile, signOut, resetAll } = useProgress();
  const { theme, setTheme } = useTheme();
  const { toast } = useUI();
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState(() => ({ name: state.profile?.name || '', goalWpm: state.profile?.goalWpm || 40 }));

  useEffect(() => {
    if (state.profile) setForm({ name: state.profile.name, goalWpm: state.profile.goalWpm || 40 });
  }, [state.profile]);

  if (!state.profile) return <div className="container page"><SignInCard title="Create your profile" /></div>;

  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setProfile({ ...state.profile, name: form.name.trim(), goalWpm: Number(form.goalWpm) });
    toast('Profile saved');
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'himalayahub-progress.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="container page">
      <div className="dash-hero">
        <div className="row" style={{ gap: 16 }}>
          <span className="avatar avatar-lg" aria-hidden="true">{initials(state.profile.name)}</span>
          <div>
            <h1 style={{ margin: 0 }}>{state.profile.name}</h1>
            <p className="muted" style={{ margin: 0 }}>Level {derived.level.level} · {state.xp} XP · member since {formatShortDate(state.profile.joined)}</p>
          </div>
        </div>
        <Button variant="secondary" icon={LogOut} onClick={signOut}>Sign out</Button>
      </div>

      <div className="grid grid-2">
        <form className="card stack" onSubmit={save} aria-labelledby="pf-title">
          <h2 id="pf-title" className="card-title">Personal details</h2>
          <div className="field"><label htmlFor="pf-name">Name</label><input id="pf-name" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
          <div className="field">
            <label htmlFor="pf-goal">Typing goal (WPM)</label>
            <input id="pf-goal" className="input" type="number" min="10" max="200" value={form.goalWpm} onChange={(e) => setForm((f) => ({ ...f, goalWpm: e.target.value }))} />
          </div>
          <div><Button type="submit">Save changes</Button></div>
        </form>

        <div className="stack">
          <section className="card" aria-labelledby="pref-title">
            <h2 id="pref-title" className="card-title">Preferences</h2>
            <span className="label" style={{ display: 'block', marginBottom: 6 }}>Theme</span>
            <Segmented label="Theme" options={[{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }]} value={theme} onChange={setTheme} />
          </section>
          <section className="card" aria-labelledby="data-title">
            <h2 id="data-title" className="card-title">Your data</h2>
            <p className="small muted">Everything is stored in this browser's LocalStorage. Nothing is sent to a server.</p>
            <div className="row">
              <Button variant="secondary" icon={Download} onClick={exportData}>Export progress (JSON)</Button>
              <Button variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>Reset all progress</Button>
            </div>
          </section>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset all progress?">
        <p>This deletes your profile, typing scores, course progress, quiz results, bookmarks, XP and badges from this browser. This cannot be undone.</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={() => { resetAll(); setConfirm(false); toast('All progress has been reset'); }}>Yes, reset everything</Button>
        </div>
      </Modal>
    </div>
  );
}
