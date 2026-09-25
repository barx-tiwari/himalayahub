import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CircleSlash, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import { useApi } from '../../api/useApi';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { relativeTime } from '../../services/timezoneService';

const SERVICE_LABEL = { NEWS: 'News', WEATHER: 'Weather', SPORTS_FOOTBALL: 'Football', SPORTS_CRICKET: 'Cricket', CRYPTO: 'Crypto', NEPSE: 'NEPSE', CURRENCY: 'Currency' };
const STATUS = {
  ok: { icon: CheckCircle2, label: 'Working', cls: 'ok' }, failing: { icon: XCircle, label: 'Failing', cls: 'bad' },
  disabled: { icon: CircleSlash, label: 'Disabled', cls: 'off' }, unknown: { icon: HelpCircle, label: 'Not checked yet', cls: 'off' },
};
const CONTENT = [['news', 'News articles', '/admin/news'], ['notes', 'Notes', '/admin/notes'], ['courses', 'Courses', '/admin/courses'], ['destinations', 'Destinations', '/admin/destinations']];

export default function Dashboard() {
  useDocumentTitle('Dashboard · Admin');
  const { user } = useAuth();
  const q = useApi('/admin/overview');
  return (
    <div className="admin-page">
      <header className="admin-head">
        <div><h1>Namaste, {user.name.split(' ')[0]}</h1><p className="muted">An overview of HimalayaHub’s content and live data.</p></div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={q.refetch} disabled={q.status === 'loading' || q.status === 'refreshing'}><RefreshCw aria-hidden="true" /> Refresh</button>
      </header>
      {q.status === 'loading' && <div className="admin-grid" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="admin-card"><span className="skeleton title" /><span className="skeleton line" /></div>)}</div>}
      {q.status === 'error' && !q.data && (
        <div className="admin-card error" role="alert"><AlertTriangle aria-hidden="true" /><div><h2>Couldn’t load the overview</h2><p>{q.error.message}</p><button type="button" className="btn btn-secondary btn-sm" onClick={q.refetch}>Try again</button></div></div>
      )}
      {q.data && (
        <>
          <section className="admin-stats" aria-label="Totals">
            <div className="stat-tile"><span className="n">{q.data.users.toLocaleString()}</span><span>Total users</span></div>
            <div className="stat-tile"><span className="n">{q.data.totals.published.toLocaleString()}</span><span>Published items</span></div>
            <div className="stat-tile"><span className="n">{q.data.totals.drafts.toLocaleString()}</span><span>Drafts</span></div>
            <div className="stat-tile muted-tile"><span className="n">—</span><span>Today’s visitors <small>(analytics not enabled yet)</small></span></div>
          </section>
          <div className="admin-cols">
            <section className="admin-card" aria-labelledby="content-h">
              <h2 id="content-h">Content</h2>
              <table className="admin-table">
                <thead><tr><th scope="col">Type</th><th scope="col">Published</th><th scope="col">Drafts</th><th scope="col">Archived</th></tr></thead>
                <tbody>{CONTENT.map(([k, label, to]) => { const c = q.data.content[k] || {}; return (
                  <tr key={k}><th scope="row" data-label="Type"><Link to={to}>{label}</Link></th><td data-label="Published">{c.PUBLISHED ?? 0}</td><td data-label="Drafts">{c.DRAFT ?? 0}</td><td data-label="Archived">{c.ARCHIVED ?? 0}</td></tr>
                ); })}</tbody>
              </table>
            </section>
            <section className="admin-card" aria-labelledby="api-h">
              <h2 id="api-h">Live data sources</h2>
              {q.data.api.length ? (
                <ul className="api-list">{q.data.api.map((a) => { const s = STATUS[a.status] || STATUS.unknown; return (
                  <li key={a.service}><span className={`api-dot ${s.cls}`}><s.icon aria-hidden="true" /></span>
                    <span><strong>{SERVICE_LABEL[a.service] || a.service}</strong><small>{a.provider}{a.lastSuccessAt ? ` · last success ${relativeTime(a.lastSuccessAt)}` : ''}</small>{a.status === 'failing' && a.lastError && <small className="err">{a.lastError}</small>}</span>
                    <span className={`pill ${s.cls}`}>{s.label}</span></li>
                ); })}</ul>
              ) : <p className="muted small">No providers configured yet.</p>}
              <p className="src-note">Provider syncing is switched on in the Live Data update.</p>
            </section>
          </div>
          <div className="admin-cols">
            <section className="admin-card" aria-labelledby="alerts-h">
              <h2 id="alerts-h">Alerts</h2>
              {q.data.alerts.length ? <ul className="alert-list">{q.data.alerts.map((a) => <li key={a.id} className={`sev-${a.severity.toLowerCase()}`}><strong>{a.source}</strong> {a.message}<small>{a.count > 1 ? `${a.count}× · ` : ''}{relativeTime(a.lastSeen)}</small></li>)}</ul>
                : <p className="muted small"><CheckCircle2 aria-hidden="true" className="inline-ok" /> No open alerts.</p>}
            </section>
            {q.data.recentActivity.length > 0 && (
              <section className="admin-card" aria-labelledby="act-h">
                <h2 id="act-h">Recent admin activity</h2>
                <ul className="activity-list">{q.data.recentActivity.map((a) => <li key={a.id}><span>{a.user?.name || 'System'} · <code>{a.action}</code></span><small>{relativeTime(a.createdAt)}</small></li>)}</ul>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
