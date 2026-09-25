import { useState } from 'react';
import { Check, EyeOff, Lock, RotateCcw, ShieldBan, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';
import { useApi } from '../../api/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const REASON = { SPAM: 'Spam', HARASSMENT: 'Harassment', HATE: 'Hate', MISINFORMATION: 'Misinformation', PERSONAL_INFO: 'Personal info', ILLEGAL: 'Illegal', OTHER: 'Other' };

/**
 * Community moderation queue. Items held by spam checks or reported by members.
 * Moderators see aliases and an "author key" (same key = same person) but never
 * the member's name, email or account — anonymity holds for staff too.
 */
function Item({ it, onDone }) {
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [banDays, setBanDays] = useState('7');
  const type = it.type.toLowerCase();
  const run = async (fn, msg) => { setBusy(true); try { await fn(); onDone(msg, true); } catch (e) { onDone(e.message, false); } finally { setBusy(false); } };
  const act = (action) => run(() => api.post(`/admin/community/${type}/${it.id}/moderate`, { action, reason: reason.trim() || undefined }), `${action} done.`);
  const dismiss = () => run(() => api.post(`/admin/community/reports/${type}/${it.id}/resolve`, { status: 'DISMISSED', resolution: reason.trim() || undefined }), 'Reports dismissed.');
  const ban = () => {
    if (reason.trim().length < 3) { onDone('Give a reason for the restriction (min 3 characters).', false); return; }
    run(() => api.post('/admin/community/bans', { targetType: it.type, targetId: it.id, communityOnly: true, days: banDays === 'perm' ? null : Number(banDays), reason: reason.trim() }), 'Author restricted in this community.');
  };
  return (
    <li className="admin-card mod-item">
      <p className="small muted" style={{ margin: 0 }}>
        {it.type === 'POST' ? 'Post' : 'Comment'} in {it.community?.name} · <strong>{it.alias}</strong> · author key <code>{it.authorKey}</code> · {new Date(it.createdAt).toLocaleString()}
        {' · '}status <strong>{it.status}</strong> · spam score {it.spamScore}
      </p>
      {it.title && <h2>{it.title}</h2>}
      {it.postTitle && <p className="small muted" style={{ margin: 0 }}>On: {it.postTitle}</p>}
      <p className="mod-body">{it.body}</p>
      {it.linkUrl && <p className="small">Link: <code>{it.linkUrl}</code></p>}
      {it.reportCount > 0 && <p className="small" style={{ margin: 0 }}><strong>{it.reportCount} report{it.reportCount > 1 ? 's' : ''}:</strong> {it.reports.map((r, i) => <span key={i}>{REASON[r.reason] || r.reason}{r.details ? ` (“${r.details}”)` : ''}{i < it.reports.length - 1 ? ', ' : ''}</span>)}</p>}
      <div className="mod-controls">
        <input className="input" placeholder="Reason / note (shown in audit log)" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} aria-label="Moderation reason" />
        <div className="row-actions">
          {it.status !== 'VISIBLE' && <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => act('approve')}><Check aria-hidden="true" /> Approve</button>}
          {it.status === 'VISIBLE' && it.reportCount > 0 && <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={dismiss}><X aria-hidden="true" /> Dismiss reports</button>}
          {it.status !== 'REMOVED' && <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act('remove')}><Trash2 aria-hidden="true" /> Remove</button>}
          {it.status === 'REMOVED' && <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act('restore')}><RotateCcw aria-hidden="true" /> Restore</button>}
          {it.type === 'POST' && <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('lock')}><Lock aria-hidden="true" /> Lock</button>}
          <span className="mod-ban">
            <select className="select" value={banDays} onChange={(e) => setBanDays(e.target.value)} aria-label="Restriction length"><option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option><option value="perm">Permanent</option></select>
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={ban}><ShieldBan aria-hidden="true" /> Restrict author</button>
          </span>
        </div>
      </div>
    </li>
  );
}

export default function Moderation() {
  useDocumentTitle('Moderation · Admin');
  const q = useApi('/admin/community/queue');
  const [msg, setMsg] = useState(null);
  const done = async (m, ok) => { setMsg({ m, ok }); if (ok) await q.refetch(); };
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Community moderation</h1><p className="muted">Held posts and reported content. Members stay anonymous to moderators; every action is audited.</p></div>
        {q.data && <p className="small muted">{q.data.counts.pending} held · {q.data.counts.reported} reported</p>}</header>
      {msg && <p className={`alert-inline ${msg.ok ? 'success' : 'error'}`} role="status">{msg.m}</p>}
      {q.status === 'loading' && <p className="muted" role="status">Loading…</p>}
      {q.status === 'error' && <p className="alert-inline error">{q.error.message}</p>}
      {q.data && !q.data.items.length && <div className="admin-card"><EyeOff aria-hidden="true" /><p style={{ margin: 0 }}>Nothing waiting. The queue is clear.</p></div>}
      {q.data?.items.length > 0 && <ul className="mod-list">{q.data.items.map((it) => <Item key={`${it.type}:${it.id}`} it={it} onDone={done} />)}</ul>}
    </div>
  );
}
