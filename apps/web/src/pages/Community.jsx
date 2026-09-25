import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PenLine, Search, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import Segmented from '../components/ui/Segmented';
import EmptyState from '../components/ui/EmptyState';
import Alert from '../components/ui/Alert';
import CaptureGuard from '../components/security/CaptureGuard';
import { PostCard, SignInPrompt, useParticipation } from '../components/community/shared';
import { api } from '../api/client';
import { useApi } from '../api/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SORTS = [{ id: 'hot', label: 'Hot' }, { id: 'new', label: 'New' }, { id: 'top', label: 'Top' }];

function Composer({ slug, onPosted }) {
  const part = useParticipation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', linkUrl: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!part.can) return part.reason === 'signin' ? <SignInPrompt /> : <Alert type="info">{part.reason}</Alert>;
  if (!open) return <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><PenLine aria-hidden="true" /> New post</button>;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({}); setMsg(null);
    try {
      const r = await api.post(`/community/c/${slug}/posts`, { ...form, linkUrl: form.linkUrl.trim() }, { full: true });
      setForm({ title: '', body: '', linkUrl: '' }); setOpen(false);
      setMsg({ type: r.data.held ? 'warning' : 'success', text: r.message });
      onPosted(r.data.post);
    } catch (err) { setErrors(err.fieldErrors); setMsg({ type: 'error', text: err.message }); } finally { setBusy(false); }
  };
  return (
    <form className="card cm-composer stack" onSubmit={submit} noValidate>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="field"><label htmlFor="cm-t">Title</label><input id="cm-t" className="input" maxLength={180} value={form.title} onChange={set('title')} aria-invalid={Boolean(errors.title)} />{errors.title && <span className="field-error">{errors.title}</span>}</div>
      <div className="field"><label htmlFor="cm-b">Post</label><textarea id="cm-b" className="textarea" rows={6} maxLength={10000} value={form.body} onChange={set('body')} aria-invalid={Boolean(errors.body)} />{errors.body && <span className="field-error">{errors.body}</span>}</div>
      <div className="field"><label htmlFor="cm-l">Link (optional)</label><input id="cm-l" className="input" type="url" placeholder="https://" value={form.linkUrl} onChange={set('linkUrl')} aria-invalid={Boolean(errors.linkUrl)} />{errors.linkUrl && <span className="field-error">{errors.linkUrl}</span>}</div>
      <p className="small muted"><ShieldCheck aria-hidden="true" className="inline-ico" /> You’ll post under an anonymous name for this community. Don’t share phone numbers, addresses or photos of other people.</p>
      <div className="cm-row"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}

export default function Community() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const sort = SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'hot';
  const q = params.get('q') || '';
  const [query, setQuery] = useState(q);
  const communities = useApi('/community/communities');
  const trending = useApi(slug ? null : '/community/trending', { enabled: !slug });
  const info = useApi(slug ? `/community/c/${slug}` : null, { enabled: Boolean(slug) });
  useDocumentTitle(slug ? (info.data?.name ? `${info.data.name} · Community` : 'Community') : 'Community');

  const [feed, setFeed] = useState({ items: [], page: 1, hasNext: false, status: 'loading', error: null });
  const base = slug ? `/community/c/${slug}/posts` : '/community/posts';
  const load = useCallback(async (page) => {
    setFeed((f) => ({ ...f, status: page === 1 ? 'loading' : 'more', error: null }));
    try {
      const r = await api.get(`${base}?sort=${sort}&page=${page}&limit=20${q ? `&q=${encodeURIComponent(q)}` : ''}`, { full: true });
      setFeed((f) => ({ items: page === 1 ? r.data : [...f.items, ...r.data], page, hasNext: r.meta?.hasNext, status: 'ready', error: null }));
    } catch (error) { setFeed((f) => ({ ...f, status: 'error', error })); }
  }, [base, sort, q]);
  useEffect(() => { load(1); }, [load]);

  const setSort = (s) => { const p = new URLSearchParams(params); p.set('sort', s); setParams(p, { replace: true }); };
  const search = (e) => { e.preventDefault(); const p = new URLSearchParams(params); if (query.trim()) p.set('q', query.trim()); else p.delete('q'); setParams(p); };

  return (
    <div className="container page cm-page" data-domain="nepal">
      <header className="page-header">
        {slug && <p className="cm-crumb small"><Link to="/community">Community</Link>{info.data && <> / {info.data.name}</>}</p>}
        <h1>{slug ? <><span className="h1-emoji" aria-hidden="true">{info.data?.icon}</span> {info.data?.name || "Community"}</> : "Community"}</h1>
        <p>{slug ? info.data?.description : 'Ask, share and help — anonymously. Every member appears under a pseudonym that changes from one community to the next.'}</p>
      </header>

      <div className="cm-layout">
        <main className="cm-main">
          <div className="cm-toolbar">
            <Segmented options={SORTS} value={sort} onChange={setSort} label="Sort posts" />
            <form className="cm-search" role="search" onSubmit={search}>
              <label className="sr-only" htmlFor="cm-q">Search posts</label>
              <input id="cm-q" className="input" type="search" placeholder={slug ? 'Search this community' : 'Search all communities'} value={query} onChange={(e) => setQuery(e.target.value)} />
              <button className="btn btn-secondary" type="submit" aria-label="Search"><Search aria-hidden="true" /></button>
            </form>
          </div>
          {slug && <Composer slug={slug} onPosted={(p) => (p.status === 'VISIBLE' ? navigate(`/community/post/${p.id}`) : load(1))} />}
          {!slug && <p className="small muted">Pick a community on the right to start a post.</p>}

          <CaptureGuard>
            {feed.status === 'loading' && <div className="cm-skel" role="status" aria-label="Loading posts">{[0, 1, 2].map((i) => <div key={i} className="card"><span className="skeleton title" /><span className="skeleton" /><span className="skeleton" style={{ width: '60%' }} /></div>)}</div>}
            {feed.status === 'error' && <Alert type="error" action={<button type="button" className="btn btn-sm btn-secondary" onClick={() => load(1)}>Retry</button>}>{feed.error?.message}</Alert>}
            {feed.status !== 'loading' && !feed.error && feed.items.length === 0 && (
              <EmptyState icon={Users} title={q ? 'No posts match your search' : 'No posts yet'}>{q ? 'Try different words.' : 'Be the first to start a conversation.'}</EmptyState>
            )}
            <div className="cm-list">{feed.items.map((p) => <PostCard key={p.id} post={p} showCommunity={!slug} />)}</div>
            {feed.hasNext && <button type="button" className="btn btn-secondary btn-block" disabled={feed.status === 'more'} onClick={() => load(feed.page + 1)}>{feed.status === 'more' ? 'Loading…' : 'Load more'}</button>}
          </CaptureGuard>
        </main>

        <aside className="cm-side">
          <section className="card">
            <h2 className="card-title">Communities</h2>
            {communities.status === 'error' ? <p className="small muted">Couldn’t load communities.</p> : (
              <ul className="cm-comms">{(communities.data || []).map((c) => (
                <li key={c.slug}><Link to={`/community/c/${c.slug}`} aria-current={c.slug === slug ? 'page' : undefined}><span aria-hidden="true">{c.icon}</span> {c.name}<span className="muted small">{c.postCount}</span></Link></li>
              ))}</ul>
            )}
          </section>
          {slug && info.data?.rules?.length > 0 && (
            <section className="card"><h2 className="card-title">Rules</h2><ol className="cm-rules small">{info.data.rules.map((r) => <li key={r}>{r}</li>)}</ol></section>
          )}
          {!slug && trending.data?.topics?.length > 0 && (
            <section className="card"><h2 className="card-title"><TrendingUp aria-hidden="true" className="inline-ico" /> Trending topics</h2>
              <ul className="pill-list">{trending.data.topics.map((t) => <li key={t.term}><Link to={`/community?q=${encodeURIComponent(t.term)}`}>{t.term}</Link></li>)}</ul>
            </section>
          )}
          <section className="card card-flat small">
            <h2 className="card-title">Your identity</h2>
            <p className="muted" style={{ margin: 0 }}>Other members never see your name, email or profile — only an alias like “Misty-Danfe-4821”. Moderators can act on abuse without seeing who you are. Screenshots are discouraged here, but no website can fully prevent them, so don’t share anything you’d never want seen.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
