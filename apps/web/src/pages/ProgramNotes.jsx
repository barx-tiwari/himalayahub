import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import Alert from '../components/ui/Alert';
import { Icon } from '../utils/icons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getProgram, programs, programSemesters, SYLLABUS_NOTE } from '../data/programs';
import NotFound from './NotFound';

export function NotesTabs({ active }) {
  return (
    <nav className="chip-tabs program-tabs" aria-label="Notes collections">
      <Link to="/notes" aria-current={active === 'it' ? 'page' : undefined}>IT Notes</Link>
      {programs.map((p) => <Link key={p.id} to={`/notes/${p.id}`} aria-current={active === p.id ? 'page' : undefined}>{p.name}</Link>)}
    </nav>
  );
}

export default function ProgramNotes({ programId }) {
  const program = getProgram(programId);
  useDocumentTitle(program ? `${program.name} Notes` : 'Notes');
  const [q, setQ] = useState('');
  const sems = useMemo(() => (program ? programSemesters(program) : []), [program]);
  if (!program) return <NotFound />;
  const term = q.trim().toLowerCase();
  const filtered = sems.map((s) => ({ ...s, subjects: s.subjects.filter((x) => !term || `${x.title} ${x.short} ${x.tags.join(' ')} ${x.overview}`.toLowerCase().includes(term)) })).filter((s) => s.subjects.length);
  const count = sems.reduce((n, s) => n + s.subjects.length, 0);

  return (
    <div className="container page" data-domain="learn">
      <header className="page-header">
        <h1>{program.name} Notes</h1>
        <p>{program.full}. {program.blurb} {count} subjects with notes, definitions, exam questions, MCQs and quick revision.</p>
      </header>
      <NotesTabs active={program.id} />
      <Alert type="info" className="syllabus-note">{SYLLABUS_NOTE}</Alert>
      <div style={{ maxWidth: 420, margin: '16px 0 8px' }}>
        <SearchBar value={q} onChange={setQ} label={`Search ${program.name} subjects`} placeholder="Search subjects, e.g. database" />
      </div>
      {filtered.length ? filtered.map((s) => (
        <section key={s.semester} className="sem-block" aria-labelledby={`sem-${s.semester}`}>
          <h2 id={`sem-${s.semester}`}>Semester {s.semester} <small>{s.subjects.length} subject{s.subjects.length === 1 ? '' : 's'}</small></h2>
          <div className="subject-grid">
            {s.subjects.map((x) => (
              <Link key={x.id} to={`/notes/${program.id}/${x.id}`} className="card card-link subject-card">
                <span className="icon-tile domain"><Icon name={x.icon} /></span>
                <span><h3>{x.title}</h3><p>{x.overview}</p></span>
              </Link>
            ))}
          </div>
        </section>
      )) : <p className="muted">No subjects match “{q}”.</p>}
    </div>
  );
}
