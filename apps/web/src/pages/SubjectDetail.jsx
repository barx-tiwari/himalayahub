import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import MiniQuiz from '../components/quiz/MiniQuiz';
import Button from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getProgram, programSemesters, whereTaught, SYLLABUS_NOTE } from '../data/programs';
import { readStorage, writeStorage } from '../utils/storage';
import NotFound from './NotFound';

const SECTIONS = [['notes', 'Notes'], ['definitions', 'Important definitions'], ['exam', 'Exam questions'], ['numericals', 'Numerical questions'], ['mcqs', 'MCQs'], ['short', 'Short questions'], ['long', 'Long questions'], ['revision', 'Quick revision']];

export function rememberSubject(programId, subjectId) {
  const list = readStorage('notes:recentSubjects', []).filter((x) => !(x.p === programId && x.s === subjectId));
  writeStorage('notes:recentSubjects', [{ p: programId, s: subjectId, at: Date.now() }, ...list].slice(0, 12));
}

export default function SubjectDetail() {
  const { program: programId, subjectId } = useParams();
  const program = getProgram(programId);
  const entry = program && programSemesters(program).flatMap((s) => s.subjects.map((x) => ({ ...x, semester: s.semester }))).find((x) => x.id === subjectId);
  useDocumentTitle(entry ? `${entry.title} — ${program.name}` : 'Notes');
  useEffect(() => { if (entry) rememberSubject(programId, subjectId); }, [programId, subjectId, entry]);
  if (!entry) return <NotFound />;
  const s = entry;
  const others = whereTaught(s.id).filter((w) => w.program.id !== programId);
  const shown = SECTIONS.filter(([id]) => id !== 'numericals' || s.numericals.length);

  return (
    <div className="container page" data-domain="learn">
      <nav aria-label="Breadcrumb" className="small" style={{ marginBottom: 12 }}>
        <Link to="/notes">Notes</Link> › <Link to={`/notes/${program.id}`}>{program.name}</Link> › <span aria-current="page">{s.title}</span>
      </nav>
      <header className="page-header">
        <h1>{s.title}</h1>
        <p>{program.name} · typical semester {s.semester}. {s.overview}</p>
        <div className="header-actions no-print"><Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>Print notes</Button></div>
      </header>
      <div className="subject-layout">
        <nav aria-label="On this page" className="no-print"><ul className="toc">{shown.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul></nav>
        <article className="note-article" style={{ maxWidth: 'none' }}>
          <section id="notes" aria-labelledby="h-notes">
            <h2 id="h-notes" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>Notes</h2>
            {s.notes.map((n) => <div key={n.heading}><h3 style={{ fontSize: 'var(--fs-lg)' }}>{n.heading}</h3><p>{n.body}</p></div>)}
          </section>
          <section id="definitions" aria-labelledby="h-def"><h2 id="h-def">Important definitions</h2>
            <dl className="def-list">{s.definitions.map((d) => <div key={d.term}><dt>{d.term}</dt><dd>{d.meaning}</dd></div>)}</dl></section>
          <section id="exam" aria-labelledby="h-exam"><h2 id="h-exam">Exam questions</h2>
            <ol className="qa-list">{s.examQuestions.map((q) => <li key={q}>{q}</li>)}</ol></section>
          {s.numericals.length > 0 && (
            <section id="numericals" aria-labelledby="h-num"><h2 id="h-num">Numerical questions</h2>
              {s.numericals.map((n) => <details key={n.q} className="numerical"><summary>{n.q}</summary><pre>{n.a}</pre></details>)}</section>
          )}
          <section id="mcqs" aria-labelledby="h-mcq"><h2 id="h-mcq">MCQs</h2><MiniQuiz questions={s.mcqs} /></section>
          <section id="short" aria-labelledby="h-short"><h2 id="h-short">Short questions</h2>
            {s.shortQuestions.map((x) => <details key={x.q} className="qa"><summary>{x.q}</summary><p>{x.a}</p></details>)}</section>
          <section id="long" aria-labelledby="h-long"><h2 id="h-long">Long questions</h2>
            {s.longQuestions.map((x) => <details key={x.q} className="qa"><summary>{x.q}</summary><p className="small muted" style={{ marginBottom: 4 }}>Points to cover:</p><ul>{x.outline.map((o) => <li key={o}>{o}</li>)}</ul></details>)}</section>
          <section id="revision" className="revision" aria-labelledby="h-rev" style={{ marginTop: 32 }}><h2 id="h-rev">Quick revision</h2>
            <ul>{s.revision.map((r) => <li key={r}>{r}</li>)}</ul></section>
          {others.length > 0 && (
            <p className="small" style={{ marginTop: 24 }}>Also in: {others.map((w, i) => <span key={w.program.id}>{i > 0 && ', '}<Link to={`/notes/${w.program.id}/${s.id}`}>{w.program.name} (semester {w.semester})</Link></span>)}</p>
          )}
          <p className="src-note">{SYLLABUS_NOTE}</p>
        </article>
      </div>
    </div>
  );
}
