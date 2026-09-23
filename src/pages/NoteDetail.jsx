import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Copy, Printer, Share2 } from 'lucide-react';
import { getCategory, getNote, notes } from '../data/notes';
import { courses } from '../data/courses';
import { quizCategories } from '../data/quizQuestions';
import NoteDiagram from '../components/notes/NoteDiagram';
import NoteCard from '../components/notes/NoteCard';
import Button from '../components/ui/Button';
import { useProgress } from '../context/ProgressContext';
import { useUI } from '../context/UIContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { copyText, shareText } from '../utils/share';
import NotFound from './NotFound';

function noteToText(n) {
  const list = (title, arr) => (arr?.length ? `\n${title}\n${arr.map((x) => `- ${x}`).join('\n')}\n` : '');
  return [
    n.title, '', n.explanation,
    list('Key points', n.keyPoints),
    list('Examples', n.examples),
    n.numericals?.length ? `\nNumericals\n${n.numericals.map((x) => `Q: ${x.q}\nA: ${x.a}`).join('\n\n')}\n` : '',
    list('Exam questions', n.examQuestions),
    list('Quick revision', n.revision),
    `\nSource: HimalayaHub - ${window.location.href}`,
  ].join('\n');
}

export default function NoteDetail() {
  const { noteId } = useParams();
  const note = getNote(noteId);
  const { viewNote, toggleBookmark, isBookmarked } = useProgress();
  const { toast } = useUI();
  useDocumentTitle(note ? note.title : 'Note not found');

  useEffect(() => { if (note) viewNote(note.id); }, [note, viewNote]);

  if (!note) return <NotFound />;
  const cat = getCategory(note.category);
  const marked = isBookmarked(note.id);
  const related = notes.filter((n) => n.category === note.category && n.id !== note.id).slice(0, 3);
  const relatedCourse = courses.find((c) => c.lessons.some((l) => l.relatedNoteId === note.id));
  const hasQuiz = quizCategories.some((q) => q.id === note.category);

  const onCopy = async () => toast((await copyText(noteToText(note))) ? 'Note copied to clipboard' : 'Could not copy the note');
  const onShare = async () => {
    const r = await shareText({ title: note.title, text: `${note.title} – ${note.summary}`, url: window.location.href });
    if (r === 'copied') toast('Link copied to clipboard');
  };

  return (
    <div className="container page">
      <nav className="small no-print" aria-label="Breadcrumb" style={{ marginBottom: 12 }}>
        <Link to="/notes">IT Notes</Link> / <Link to={`/notes?category=${cat.id}`}>{cat.name}</Link>
      </nav>
      <article className="note-article">
        <header>
          <span className="chip chip-primary">{cat.name}</span>
          <h1 style={{ marginTop: 12 }}>{note.title}</h1>
          <p className="muted" style={{ fontSize: 'var(--fs-lg)' }}>{note.summary}</p>
          <div className="note-toolbar no-print">
            <Button variant="secondary" size="sm" icon={marked ? BookmarkCheck : Bookmark} onClick={() => toggleBookmark(note.id)} aria-pressed={marked}>
              {marked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button variant="secondary" size="sm" icon={Copy} onClick={onCopy}>Copy note</Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>Print</Button>
            <Button variant="secondary" size="sm" icon={Share2} onClick={onShare}>Share</Button>
          </div>
        </header>

        <h2>Simple explanation</h2>
        {note.explanation.split('\n\n').map((p) => <p key={p.slice(0, 40)}>{p}</p>)}

        {note.diagram && (<><h2>Diagram</h2><NoteDiagram diagram={note.diagram} /></>)}

        <h2>Key points</h2>
        <ul>{note.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>

        {note.examples?.length > 0 && (<><h2>Examples</h2><ul>{note.examples.map((e) => <li key={e}>{e}</li>)}</ul></>)}

        {note.numericals?.length > 0 && (
          <>
            <h2>Numerical questions</h2>
            {note.numericals.map((n) => (
              <details className="numerical" key={n.q}>
                <summary>{n.q}</summary>
                <pre>{n.a}</pre>
              </details>
            ))}
          </>
        )}

        <h2>Important exam questions</h2>
        <ol className="qa-list">{note.examQuestions.map((q) => <li key={q}>{q}</li>)}</ol>

        <section className="revision section" aria-labelledby="rev">
          <h2 id="rev">Quick revision</h2>
          <ul style={{ margin: 0 }}>{note.revision.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>

        {(relatedCourse || hasQuiz) && (
          <div className="row section no-print">
            {relatedCourse && <Button to={`/courses/${relatedCourse.id}`} variant="secondary">Course: {relatedCourse.title}</Button>}
            {hasQuiz && <Button to={`/quizzes/${note.category}`} variant="secondary">Practise with the {cat.name} quiz</Button>}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="section no-print" aria-labelledby="related">
          <div className="section-title"><h2 id="related">More in {cat.name}</h2></div>
          <div className="grid grid-3">{related.map((n) => <NoteCard key={n.id} note={n} />)}</div>
        </section>
      )}
    </div>
  );
}
