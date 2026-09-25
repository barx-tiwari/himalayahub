import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import EmptyState from '../components/ui/EmptyState';
import { searchAll } from '../utils/search';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  useDocumentTitle(q ? `Search: ${q}` : 'Search');
  const groups = useMemo(() => searchAll(q, { perGroup: 30 }), [q]);
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  return (
    <div className="container page">
      <header className="page-header"><h1>Search</h1><p>Find notes, courses, lessons, quizzes and tools.</p></header>
      <div style={{ maxWidth: 640 }}>
        <SearchBar value={q} onChange={(v) => setParams(v ? { q: v } : {}, { replace: true })} label="Search HimalayaHub" placeholder="Search everything" autoFocus />
        <p className="small muted" aria-live="polite" style={{ marginTop: 12 }}>{q.trim() ? `${total} result${total === 1 ? '' : 's'} for “${q}”` : 'Start typing to search.'}</p>
        {q.trim() && !total ? <EmptyState title="No results">Try a different or shorter keyword.</EmptyState> : <SearchResults groups={groups} idPrefix="sp" />}
      </div>
    </div>
  );
}
