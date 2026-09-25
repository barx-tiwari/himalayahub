import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { getCategory } from '../../data/notes';
import { useProgress } from '../../context/ProgressContext';

export default function NoteCard({ note }) {
  const { isBookmarked, toggleBookmark, state } = useProgress();
  const marked = isBookmarked(note.id);
  const read = state.notesRead.includes(note.id);
  return (
    <article className="card note-card" style={{ position: 'relative' }}>
      <div className="row-between">
        <span className="chip chip-primary">{getCategory(note.category)?.name}</span>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleBookmark(note.id)}
          aria-pressed={marked} aria-label={marked ? `Remove bookmark for ${note.title}` : `Bookmark ${note.title}`}>
          {marked ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
        </button>
      </div>
      <h3 className="card-title" style={{ margin: 0 }}>
        <Link to={`/notes/${note.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{note.title}</Link>
      </h3>
      <p>{note.summary}</p>
      <div className="row-between small">
        <Link to={`/notes/${note.id}`}>Read note</Link>
        {read && <span className="chip chip-success"><Check aria-hidden="true" /> Read</span>}
      </div>
    </article>
  );
}
