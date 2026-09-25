import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Camera, Heart, LogOut, Map, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import OtpForm from '../components/auth/OtpForm';
import Alert from '../components/ui/Alert';
import { api } from '../api/client';
import { useApi } from '../api/useApi';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const INTERESTS = [['trekking', 'Trekking'], ['hiking', 'Hiking'], ['culture', 'Culture'], ['religious-sites', 'Religious sites'], ['wildlife', 'Wildlife'], ['lakes', 'Lakes'], ['photography', 'Photography'], ['food', 'Food'], ['adventure-sports', 'Adventure sports'], ['camping', 'Camping'], ['village-stays', 'Village stays'], ['festivals', 'Festivals'], ['cycling', 'Cycling'], ['birdwatching', 'Birdwatching']];
const ROLE_LABEL = { VISITOR: 'Visitor', USER: 'Member (email not confirmed)', VERIFIED_USER: 'Verified member', MODERATOR: 'Moderator', ADMIN: 'Admin' };

function Profile() {
  const { refresh } = useAuth();
  const p = useApi('/me/profile');
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => { if (p.data) setF({ name: p.data.name, country: p.data.country || '', bio: p.data.bio || '', travelInterests: p.data.travelInterests, travelerType: p.data.travelerType || '' }); }, [p.data]);
  if (p.status === 'error') return <Alert type="error">{p.error.message}</Alert>;
  if (!f) return <p className="muted" role="status">Loading your profile…</p>;
  const toggle = (id) => setF((x) => ({ ...x, travelInterests: x.travelInterests.includes(id) ? x.travelInterests.filter((i) => i !== id) : [...x.travelInterests, id] }));
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await api(`/me/profile`, { method: 'PATCH', body: { ...f, travelerType: f.travelerType || null } }); await refresh(); setMsg({ type: 'success', text: 'Profile saved.' }); }
    catch (err) { setMsg({ type: 'error', text: err.message }); } finally { setBusy(false); }
  };
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setMsg(null);
    try { await api.upload('/me/avatar', file); await Promise.all([refresh(), p.refetch()]); setMsg({ type: 'success', text: 'Photo updated.' }); }
    catch (err) { setMsg({ type: 'error', text: err.message }); } finally { e.target.value = ''; }
  };
  return (
    <form className="card acct-card stack" onSubmit={save}>
      <div className="acct-photo">
        <span className="acct-avatar">{p.data.avatar ? <img src={p.data.avatar} alt="Your profile photo" /> : <UserRound aria-hidden="true" />}</span>
        <div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}><Camera aria-hidden="true" /> {p.data.avatar ? 'Change photo' : 'Add photo'}</button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={upload} />
          <p className="small muted" style={{ margin: '4px 0 0' }}>JPEG, PNG or WebP, up to 3 MB. Location data is removed.</p>
        </div>
      </div>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="grid grid-2">
        <div className="field"><label htmlFor="ac-n">Name</label><input id="ac-n" className="input" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="ac-c">Country</label><input id="ac-c" className="input" maxLength={60} autoComplete="country-name" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></div>
      </div>
      <div className="field"><label htmlFor="ac-t">I usually travel…</label>
        <select id="ac-t" className="select" value={f.travelerType} onChange={(e) => setF({ ...f, travelerType: e.target.value })}><option value="">Prefer not to say</option><option value="domestic">Within Nepal</option><option value="international">From abroad</option></select></div>
      <fieldset className="acct-interests"><legend className="label">Travel interests</legend>
        {INTERESTS.map(([id, label]) => <label key={id} className={`chip-toggle${f.travelInterests.includes(id) ? ' on' : ''}`}><input type="checkbox" checked={f.travelInterests.includes(id)} onChange={() => toggle(id)} /> {label}</label>)}
      </fieldset>
      <div className="field"><label htmlFor="ac-b">About you (optional)</label><textarea id="ac-b" className="textarea" rows={3} maxLength={500} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
      <p className="small muted"><ShieldCheck aria-hidden="true" className="inline-ico" /> Your profile is private. Community posts show an anonymous alias, never this information.</p>
      <button type="submit" className="btn btn-primary" disabled={busy || !f.name.trim()}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}

function Favourites() {
  const q = useApi('/me/favorites/destinations');
  if (q.status === 'loading') return <p className="muted">Loading…</p>;
  if (!q.data?.length) return <p className="muted">No saved places yet. Tap <Heart aria-hidden="true" className="inline-ico" /> Save on any <Link to="/hidden-gems">Hidden Gem</Link>.</p>;
  return <ul className="acct-list">{q.data.map((d) => <li key={d.slug}><Link to={`/hidden-gems/${d.slug}`}>{d.name}</Link><span className="small muted">{d.district}</span></li>)}</ul>;
}

function Trips() {
  const q = useApi('/me/trips');
  const del = async (id) => { if (window.confirm('Delete this trip?')) { await api.del(`/me/trips/${id}`).catch(() => {}); q.refetch(); } };
  if (q.status === 'loading') return <p className="muted">Loading…</p>;
  if (!q.data?.length) return <p className="muted">No trips yet. Save a suggested itinerary from <Link to="/hidden-gems#gems-itin">Hidden Gems</Link>.</p>;
  return (
    <ul className="acct-list">{q.data.map((t) => (
      <li key={t.id}><details><summary><strong>{t.title}</strong> <span className="small muted">{t.days ? `${t.days} days` : ''}</span></summary>
        {Array.isArray(t.itinerary) && <ol className="small">{t.itinerary.map((d) => <li key={d.day}>Day {d.day}: {d.title}</li>)}</ol>}
      </details><button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={`Delete ${t.title}`} onClick={() => del(t.id)}><Trash2 aria-hidden="true" /></button></li>
    ))}</ul>
  );
}

export default function Account() {
  useDocumentTitle('Your account');
  const { user, status, logout, role } = useAuth();
  if (status === 'loading') return <div className="container page"><p className="muted" role="status">Loading…</p></div>;
  if (!user) return <Navigate to="/login?next=/account" replace />;
  return (
    <div className="container page acct" data-domain="nepal">
      <header className="page-header acct-head">
        <div><h1>Your account</h1><p>{user.email} · {ROLE_LABEL[role] || role}</p></div>
        <button type="button" className="btn btn-secondary" onClick={logout}><LogOut aria-hidden="true" /> Sign out</button>
      </header>
      {!user.emailVerified && (
        <section className="card acct-verify"><h2 className="card-title">Confirm your email</h2><p className="muted">You need a confirmed email to post, comment and vote in the community.</p><OtpForm /></section>
      )}
      <div className="acct-grid">
        <section aria-labelledby="ac-prof"><h2 id="ac-prof">Profile</h2><Profile /></section>
        <div className="acct-side">
          <section className="card" aria-labelledby="ac-fav"><h2 id="ac-fav" className="card-title"><Heart aria-hidden="true" className="inline-ico" /> Favourite places</h2><Favourites /></section>
          <section className="card" aria-labelledby="ac-trip"><h2 id="ac-trip" className="card-title"><Map aria-hidden="true" className="inline-ico" /> Saved trips</h2><Trips /></section>
          <section className="card card-flat small"><h2 className="card-title">Security</h2><p className="muted" style={{ margin: 0 }}>Signing out here ends this device’s session. Changing your password signs out every other device.</p></section>
        </div>
      </div>
    </div>
  );
}
