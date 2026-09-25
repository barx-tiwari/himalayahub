import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { useApi } from '../../api/useApi';
import { useAuth } from '../../context/AuthContext';
import { useDestinations } from '../../context/DestinationsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

function Row({ c, onDone, canDelete }) {
  const [f, setF] = useState({ name: c.name, emoji: c.emoji || '', sortOrder: c.sortOrder });
  const [busy, setBusy] = useState(false);
  const dirty = f.name !== c.name || f.emoji !== (c.emoji || '') || Number(f.sortOrder) !== c.sortOrder;
  const run = async (fn, msg) => { setBusy(true); try { await fn(); onDone(msg, true); } catch (e) { onDone(e.message, false); } finally { setBusy(false); } };
  return (
    <tr>
      <td data-label="Emoji"><input className="input emoji-input" aria-label={`Emoji for ${c.name}`} value={f.emoji} maxLength={8} onChange={(e) => setF({ ...f, emoji: e.target.value })} /></td>
      <th scope="row" data-label="Name"><input className="input" aria-label={`Name for ${c.name}`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /><small className="muted">{c.slug}</small></th>
      <td data-label="Order"><input className="input order-input" type="number" min="0" aria-label={`Order for ${c.name}`} value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: e.target.value })} /></td>
      <td data-label="Used by">{c.destinationCount}</td>
      <td className="row-actions">
        <button type="button" className="btn btn-secondary btn-sm" disabled={!dirty || busy || f.name.trim().length < 2} onClick={() => run(() => api(`/admin/destination-categories/${c.id}`, { method: 'PATCH', body: { name: f.name.trim(), emoji: f.emoji || null, sortOrder: Number(f.sortOrder) || 0 } }), `Saved “${f.name.trim()}”.`)}><Save aria-hidden="true" /> Save</button>
        {canDelete && <button type="button" className="btn btn-ghost btn-icon btn-sm" disabled={busy || c.destinationCount > 0} title={c.destinationCount ? 'Remove it from destinations first' : 'Delete'} aria-label={`Delete ${c.name}`}
          onClick={() => window.confirm(`Delete the “${c.name}” category?`) && run(() => api.del(`/admin/destination-categories/${c.id}`), `Deleted “${c.name}”.`)}><Trash2 aria-hidden="true" /></button>}
      </td>
    </tr>
  );
}

export default function TravelCategories() {
  useDocumentTitle('Travel categories · Admin');
  const { can } = useAuth();
  const { reload } = useDestinations();
  const q = useApi('/admin/destination-categories');
  const [msg, setMsg] = useState(null);
  const [add, setAdd] = useState({ name: '', emoji: '' });
  const [err, setErr] = useState('');
  const done = async (m, ok) => { setMsg({ m, ok }); if (ok) { await q.refetch(); reload(); } };
  const create = async (e) => {
    e.preventDefault(); setErr('');
    if (add.name.trim().length < 2) { setErr('Enter a category name.'); return; }
    try {
      await api.post('/admin/destination-categories', { name: add.name.trim(), slug: toSlug(add.name), emoji: add.emoji || null, sortOrder: (q.data?.length || 0) });
      setAdd({ name: '', emoji: '' }); await done(`Added “${add.name.trim()}”.`, true);
    } catch (x) { setErr(x.fieldErrors?.slug ? 'A category with this name already exists.' : x.message); }
  };
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Travel categories</h1><p className="muted">Used to group destinations and by the “Where should you go?” filters.</p></div></header>
      {msg && <p className={`alert-inline ${msg.ok ? 'ok' : 'error'}`} role={msg.ok ? 'status' : 'alert'}>{msg.m}</p>}
      <div className="admin-card">
        {q.status === 'loading' ? <span className="skeleton block" /> : q.status === 'error' ? <p className="alert-inline error">{q.error.message}</p> : (
          <table className="admin-table cat-table">
            <thead><tr><th scope="col">Emoji</th><th scope="col">Name</th><th scope="col">Order</th><th scope="col">Used by</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{q.data.map((c) => <Row key={`${c.id}-${c.name}-${c.sortOrder}`} c={c} onDone={done} canDelete={can('destinations.delete')} />)}</tbody>
          </table>
        )}
      </div>
      <form className="admin-card form-card" onSubmit={create} noValidate aria-labelledby="add-cat"><h2 id="add-cat">Add a category</h2>
        <div className="row">
          <input className="input emoji-input" aria-label="Emoji" placeholder="🏔" maxLength={8} value={add.emoji} onChange={(e) => setAdd({ ...add, emoji: e.target.value })} />
          <input className="input" style={{ maxWidth: 320 }} aria-label="Category name" placeholder="e.g. Hot springs" value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} aria-invalid={Boolean(err) || undefined} />
          <button type="submit" className="btn btn-primary btn-sm"><Plus aria-hidden="true" /> Add</button>
        </div>
        {err && <span className="field-error" role="alert">{err}</span>}
      </form>
    </div>
  );
}
