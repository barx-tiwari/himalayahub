import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Star } from 'lucide-react';
import { api } from '../../api/client';
import { useApi } from '../../api/useApi';
import { useAuth } from '../../context/AuthContext';
import { useDestinations } from '../../context/DestinationsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getProvince } from '../../data/nepalPlaces';
import { relativeTime } from '../../services/timezoneService';
import { StatusPill, thumbUrl } from '../components';

const TABS = [['ALL', 'All'], ['PUBLISHED', 'Published'], ['DRAFT', 'Drafts'], ['ARCHIVED', 'Archived']];

export default function Destinations() {
  useDocumentTitle('Destinations · Admin');
  const { can } = useAuth();
  const { reload: reloadSite } = useDestinations();
  const navigate = useNavigate();
  const [status, setStatus] = useState('ALL');
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');
  useEffect(() => { const t = setTimeout(() => { setQ(query.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [query]);
  const list = useApi(`/admin/destinations?status=${status}&page=${page}&limit=20${q ? `&q=${encodeURIComponent(q)}` : ''}`, { full: true });

  const toggleFeatured = async (d) => {
    setMsg('');
    try {
      await api(`/admin/destinations/${d.id}`, { method: 'PATCH', body: { isFeatured: !d.isFeatured } });
      await list.refetch(); reloadSite();
      setMsg(`${d.name} ${d.isFeatured ? 'removed from' : 'added to'} the homepage.`);
    } catch (e) { setMsg(e.message); }
  };
  const rows = list.data?.data || [];
  const meta = list.data?.meta;
  const counts = meta?.counts || {};

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div><h1>Destinations</h1><p className="muted">Published destinations appear on Explore Nepal; featured ones lead the homepage.</p></div>
        {can('destinations.create') && <Link to="/admin/destinations/new" className="btn btn-primary btn-sm"><Plus aria-hidden="true" /> New destination</Link>}
      </header>
      <div className="admin-toolbar">
        <div className="chip-tabs" role="tablist" aria-label="Filter by status">
          {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={status === id} aria-pressed={status === id} onClick={() => { setStatus(id); setPage(1); }}>{label}{meta && <span className="tab-count"> {id === 'ALL' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[id] || 0}</span>}</button>)}
        </div>
        <label className="admin-search"><Search aria-hidden="true" /><span className="sr-only">Search destinations</span><input className="input" type="search" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      </div>
      {msg && <p className="alert-inline ok" role="status">{msg}</p>}
      <div className="admin-card" aria-busy={list.status === 'loading'}>
        {list.status === 'error' && !list.data ? <p className="alert-inline error" role="alert">{list.error.message} <button type="button" className="btn btn-secondary btn-sm" onClick={list.refetch}>Try again</button></p>
          : list.status === 'loading' ? <><span className="skeleton title" /><span className="skeleton line" /><span className="skeleton line" /></>
            : rows.length === 0 ? <div className="empty-inline"><p>{q ? `No destinations match “${q}”.` : 'No destinations here yet.'}</p>{can('destinations.create') && !q && <Link to="/admin/destinations/new" className="btn btn-primary btn-sm">Add the first one</Link>}</div>
              : (
                <table className="admin-table dest-table">
                  <thead><tr><th scope="col"><span className="sr-only">Photo</span></th><th scope="col">Destination</th><th scope="col">Province</th><th scope="col">Status</th><th scope="col">Homepage</th><th scope="col">Updated</th></tr></thead>
                  <tbody>{rows.map((d) => (
                    <tr key={d.id}>
                      <td className="thumb-cell">{thumbUrl(d.images?.[0]) ? <img src={thumbUrl(d.images[0])} alt="" loading="lazy" /> : <span className="thumb-empty" aria-hidden="true" />}</td>
                      <th scope="row" data-label="Destination"><Link to={`/admin/destinations/${d.id}`}>{d.name}</Link><small className="muted">/{d.slug}</small></th>
                      <td data-label="Province">{getProvince(d.province)?.name.replace(' Province', '') || d.province}</td>
                      <td data-label="Status"><StatusPill status={d.status} /></td>
                      <td data-label="Homepage">
                        <button type="button" className={`star-btn${d.isFeatured ? ' on' : ''}`} aria-pressed={d.isFeatured} onClick={() => toggleFeatured(d)} disabled={d.status !== 'PUBLISHED' && !d.isFeatured}
                          title={d.status !== 'PUBLISHED' ? 'Publish first to feature on the homepage' : d.isFeatured ? 'Remove from homepage' : 'Feature on homepage'}>
                          <Star aria-hidden="true" /><span>{d.isFeatured ? 'Featured' : 'Feature'}</span><span className="sr-only"> {d.name}</span>
                        </button>
                      </td>
                      <td data-label="Updated">{relativeTime(d.updatedAt)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
        {rows.length > 0 && (
          <nav className="pager" aria-label="Pages">
            <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span className="small muted">Page {meta?.page ?? page} of {meta?.totalPages ?? 1} · {meta?.total ?? rows.length} total</span>
            <button type="button" className="btn btn-secondary btn-sm" disabled={!meta?.hasNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </nav>
        )}
      </div>
      <p className="src-note">Tip: <button type="button" className="linklike" onClick={() => navigate('/admin/travel-categories')}>manage travel categories</button> used by the “Where should you go?” filters.</p>
    </div>
  );
}
