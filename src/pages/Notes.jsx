import { NotesTabs } from './ProgramNotes';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { noteCategories, notes } from '../data/notes';
import NoteCard from '../components/notes/NoteCard';
import SearchBar from '../components/search/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProgress } from '../context/ProgressContext';

export default function Notes() {
  useDocumentTitle('IT Notes');
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const query = params.get('q') || '';
  const { state } = useProgress();

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (category === 'bookmarks') { if (!state.bookmarks.includes(n.id)) return false; }
      else if (category !== 'all' && n.category !== category) return false;
      if (!q) return true;
      return `${n.title} ${n.summary} ${(n.tags || []).join(' ')} ${n.keyPoints.join(' ')}`.toLowerCase().includes(q);
    });
  }, [category, query, state.bookmarks]);

  const counts = useMemo(() => Object.fromEntries(noteCategories.map((c) => [c.id, notes.filter((n) => n.category === c.id).length])), []);
  const catName = category === 'all' ? 'All notes' : category === 'bookmarks' ? 'Bookmarked' : noteCategories.find((c) => c.id === category)?.name;

  return (
    <div className="container page">
      <header className="page-header">
        <h1>IT Notes</h1>
        <p>Clear explanations, diagrams, exam questions and quick revision for {notes.length} core IT topics.</p>
      </header>
      <NotesTabs active="it" />
      <div className="notes-layout">
        <nav aria-label="Note categories">
          <ul className="cat-list">
            <li><button type="button" aria-pressed={category === 'all'} onClick={() => setParam('category', 'all')}>All notes <span>{notes.length}</span></button></li>
            <li><button type="button" aria-pressed={category === 'bookmarks'} onClick={() => setParam('category', 'bookmarks')}>Bookmarked <span>{state.bookmarks.length}</span></button></li>
            {noteCategories.map((c) => (
              <li key={c.id}><button type="button" aria-pressed={category === c.id} onClick={() => setParam('category', c.id)}>{c.name} <span>{counts[c.id]}</span></button></li>
            ))}
          </ul>
        </nav>
        <div>
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div style={{ flex: '1 1 280px' }}>
              <SearchBar value={query} onChange={(v) => setParam('q', v)} label="Search notes" placeholder="Search notes, e.g. subnet, TCP, SQL" />
            </div>
            <p className="small muted" style={{ margin: 0 }} aria-live="polite">{catName}: {filtered.length} result{filtered.length === 1 ? '' : 's'}</p>
          </div>
          {filtered.length ? (
            <div className="grid grid-3">{filtered.map((n) => <NoteCard key={n.id} note={n} />)}</div>
          ) : (
            <EmptyState icon={BookOpen} title="No notes found">
              {category === 'bookmarks' ? 'Bookmark notes with the bookmark icon to see them here.' : 'Try another word or pick a different category.'}
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
