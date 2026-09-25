import { Link } from 'react-router-dom';
import { Award, BookOpen, Flame, GraduationCap, Keyboard, ListChecks, Target, Zap } from 'lucide-react';
import DashboardCard from '../components/dashboard/DashboardCard';
import SignInCard from '../components/dashboard/SignInCard';
import BarChart from '../components/ui/BarChart';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import ContinueLearning from '../components/courses/ContinueLearning';
import { courseProgressPercent } from '../components/courses/CourseCard';
import { useProgress } from '../context/ProgressContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { toolLinks } from '../data/navigation';
import { courses } from '../data/courses';
import { getNote } from '../data/notes';
import { quizCategories } from '../data/quizQuestions';
import { typingLessons } from '../data/typingLessons';
import { Icon } from '../utils/icons';
import { formatShortDate } from '../utils/format';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Settings2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DASHBOARD_WIDGETS } from '../components/widgets/LiveWidgets';

/** Rearrangeable live widgets. Order and hidden widgets are saved in LocalStorage. */
function LiveWidgetBoard() {
  const defaults = DASHBOARD_WIDGETS.map((w) => w.id);
  const [prefs, setPrefs] = useLocalStorage('dashboard:widgets:v1', { order: defaults, hidden: [] });
  const [editing, setEditing] = useState(false);
  const order = [...prefs.order.filter((id) => defaults.includes(id)), ...defaults.filter((id) => !prefs.order.includes(id))];
  const move = (id, dir) => {
    const next = [...order]; const i = next.indexOf(id); const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setPrefs({ ...prefs, order: next });
  };
  const toggle = (id) => setPrefs({ ...prefs, order, hidden: prefs.hidden.includes(id) ? prefs.hidden.filter((h) => h !== id) : [...prefs.hidden, id] });
  const visible = order.filter((id) => editing || !prefs.hidden.includes(id));
  return (
    <section aria-labelledby="board-title">
      <div className="customize-bar">
        <h2 id="board-title" style={{ margin: 0, fontSize: 'var(--fs-xl)' }}>Your day</h2>
        <div className="row">
          {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPrefs({ order: defaults, hidden: [] })}>Reset layout</button>}
          <button type="button" className="btn btn-secondary btn-sm" aria-pressed={editing} onClick={() => setEditing((e) => !e)}><Settings2 aria-hidden="true" />{editing ? 'Done' : 'Customise'}</button>
        </div>
      </div>
      {editing && <p className="small muted">Use the arrows to reorder widgets and the eye to show or hide them. Your layout is saved on this device.</p>}
      <div className="widget-grid">
        {visible.map((id, idx) => {
          const w = DASHBOARD_WIDGETS.find((x) => x.id === id);
          const hidden = prefs.hidden.includes(id);
          const controls = editing ? (
            <span className="widget-controls">
              <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={`Move ${w.label} earlier`} disabled={idx === 0} onClick={() => move(id, -1)}><ArrowUp aria-hidden="true" /></button>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={`Move ${w.label} later`} disabled={idx === visible.length - 1} onClick={() => move(id, 1)}><ArrowDown aria-hidden="true" /></button>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={hidden ? `Show ${w.label}` : `Hide ${w.label}`} aria-pressed={!hidden} onClick={() => toggle(id)}>{hidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button>
            </span>
          ) : undefined;
          return <div key={id} className={`widget-wrap${hidden ? ' is-hidden' : ''}`}><w.C className="" controls={controls} /></div>;
        })}
      </div>
    </section>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { state, derived } = useProgress();
  if (!state.profile) return <div className="container page"><SignInCard /></div>;

  const runs = state.typingResults.slice(0, 8).reverse();
  const chartData = runs.map((r, i) => ({ label: `#${state.typingResults.length - runs.length + i + 1}`, value: r.wpm, alt: r.accuracy }));
  const quizData = quizCategories.map((c) => {
    const rs = state.quizResults.filter((r) => r.category === c.id);
    return { label: c.name.split(' ')[0], value: rs.length ? Math.max(...rs.map((r) => r.percent)) : 0 };
  });
  const goal = state.profile.goalWpm || 40;

  const recentCourseLessons = courses
    .map((c) => ({ c, p: state.courseProgress[c.id] }))
    .filter((x) => x.p?.completedLessons?.length)
    .sort((a, b) => (b.p.updatedAt || '').localeCompare(a.p.updatedAt || ''))
    .slice(0, 5)
    .map(({ c, p }) => ({ course: c, lesson: c.lessons.find((l) => l.id === p.completedLessons[p.completedLessons.length - 1]), date: p.updatedAt }));
  const passedTyping = typingLessons.filter((l) => state.typingLessons[l.id]?.completed);

  return (
    <div className="container page">
      <div className="dash-hero">
        <div>
          <h1 style={{ marginBottom: 4 }}>Welcome back, {state.profile.name}!</h1>
          <p className="muted" style={{ margin: 0 }}>Here is your learning at a glance.</p>
        </div>
        <div className="row">
          <span className="chip chip-accent"><Flame aria-hidden="true" /> {derived.streak}-day streak</span>
          <span className="chip chip-primary"><Zap aria-hidden="true" /> {state.xp} XP · Level {derived.level.level}</span>
          <Link to="/profile" className="btn btn-secondary btn-sm">Profile</Link>
        </div>
      </div>

      <LiveWidgetBoard />
      <h2 className="section" style={{ fontSize: 'var(--fs-xl)', marginBottom: 12 }}>Your learning</h2>
      <div className="dash-grid">
        <DashboardCard className="span-3" icon={Keyboard} label="Typing speed" value={derived.bestWpm ? `${derived.bestWpm} WPM` : '—'} hint={derived.avgWpm != null ? `Recent average ${derived.avgWpm} WPM` : 'Take a typing test'} />
        <DashboardCard className="span-3" icon={Target} tone="success" label="Accuracy" value={derived.avgAccuracy != null ? `${derived.avgAccuracy}%` : '—'} hint={`${state.typingResults.length} tests taken`} />
        <DashboardCard className="span-3" icon={GraduationCap} tone="warning" label="Courses completed" value={derived.coursesCompleted} hint={`Lessons completed: ${derived.lessonsCompleted}`} />
        <DashboardCard className="span-3" icon={ListChecks} tone="accent" label="Quiz average" value={derived.quizAvg != null ? `${derived.quizAvg}%` : '—'} hint={`${state.quizResults.length} quizzes finished`} />

        <section className="card span-8" aria-labelledby="chart-title">
          <div className="row-between"><h2 id="chart-title" className="card-title">Typing progress</h2><span className="small muted">Last {runs.length || 0} tests</span></div>
          {chartData.length ? <BarChart data={chartData} max={100} title="WPM and accuracy for recent typing tests" legend={['WPM', 'Accuracy %']} />
            : <EmptyState icon={Keyboard} title="No typing tests yet" action={<Link to="/typing" className="btn btn-primary">Start typing</Link>}>Your chart will appear here.</EmptyState>}
          <ProgressBar className="section" value={Math.min(100, (derived.bestWpm / goal) * 100)} label={`Goal: ${goal} WPM`} />
        </section>

        <section className="card span-4" aria-labelledby="xp-title">
          <h2 id="xp-title" className="card-title">Level &amp; XP</h2>
          <div className="row" style={{ alignItems: 'baseline' }}><span className="xp-level">Lv {derived.level.level}</span><span className="muted small">{state.xp} XP total</span></div>
          <ProgressBar className="section" value={derived.level.percent} label={`${derived.level.into} / ${derived.level.next} XP to next level`} />
          <p className="small muted" style={{ marginTop: 16, marginBottom: 0 }}>Earn XP from typing tests, lessons, quizzes, notes and the daily question. Learn on consecutive days to grow your streak.</p>
        </section>

        <section className="card span-8" aria-labelledby="cl-title">
          <div className="row-between"><h2 id="cl-title" className="card-title">Continue learning</h2><Link to="/courses" className="small">All courses</Link></div>
          <ContinueLearning limit={2} emptyText="No course in progress. Start one from the Courses page." />
          <div className="stack" style={{ marginTop: 16 }}>
            {courses.filter((c) => state.courseProgress[c.id]).slice(0, 4).map((c) => (
              <ProgressBar key={c.id} value={courseProgressPercent(c, state.courseProgress)} label={c.title} />
            ))}
          </div>
        </section>

        <section className="card span-4" aria-labelledby="qt-title">
          <h2 id="qt-title" className="card-title">Quick tools</h2>
          <ul className="plain-list">
            {toolLinks.map((t) => <li key={t.to}><Link to={t.to}><span><Icon name={t.icon} size={16} style={{ verticalAlign: '-3px', marginRight: 8 }} />{t.label}</span><span aria-hidden="true">›</span></Link></li>)}
          </ul>
        </section>

        <section className="card span-6" aria-labelledby="quiz-chart">
          <h2 id="quiz-chart" className="card-title">Best quiz scores</h2>
          <BarChart data={quizData} max={100} title="Best quiz score per category" valueSuffix="%" />
        </section>

        <section className="card span-6" aria-labelledby="rc-title">
          <h2 id="rc-title" className="card-title">Recently completed</h2>
          {recentCourseLessons.length || passedTyping.length ? (
            <ul className="plain-list">
              {recentCourseLessons.map(({ course, lesson, date }) => lesson && (
                <li key={course.id}><Link to={`/courses/${course.id}?lesson=${lesson.id}`}><span>{lesson.title} <span className="muted">· {course.title}</span></span><span className="muted">{date ? formatShortDate(date) : ''}</span></Link></li>
              ))}
              {passedTyping.slice(-3).map((l) => (
                <li key={l.id}><Link to={`/typing/lessons/${l.id}`}><span>Typing: {l.title}</span><span className="muted">{state.typingLessons[l.id].bestWpm} WPM</span></Link></li>
              ))}
            </ul>
          ) : <p className="small muted" style={{ margin: 0 }}>Complete a course or typing lesson to see it here.</p>}
        </section>

        <section className="card span-6" aria-labelledby="bm-title">
          <h2 id="bm-title" className="card-title"><BookOpen size={18} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Bookmarked notes</h2>
          {state.bookmarks.length ? (
            <ul className="plain-list">{state.bookmarks.map(getNote).filter(Boolean).slice(0, 6).map((n) => <li key={n.id}><Link to={`/notes/${n.id}`}>{n.title}<span aria-hidden="true">›</span></Link></li>)}</ul>
          ) : <p className="small muted" style={{ margin: 0 }}>Use the bookmark button on any note to save it here.</p>}
        </section>

        <section className="card span-6" aria-labelledby="rv-title">
          <h2 id="rv-title" className="card-title">Recently viewed notes</h2>
          {state.recentNotes.length ? (
            <ul className="plain-list">{state.recentNotes.map(getNote).filter(Boolean).map((n) => <li key={n.id}><Link to={`/notes/${n.id}`}>{n.title}<span aria-hidden="true">›</span></Link></li>)}</ul>
          ) : <p className="small muted" style={{ margin: 0 }}>Notes you open will be listed here.</p>}
        </section>

        <section className="card span-12" aria-labelledby="badge-title">
          <div className="row-between"><h2 id="badge-title" className="card-title"><Award size={18} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Achievements</h2>
            <span className="small muted">{derived.badges.filter((b) => b.earned).length} of {derived.badges.length} earned</span></div>
          <ul className="badge-grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {derived.badges.map((b) => (
              <li key={b.id} className={`badge${b.earned ? '' : ' locked'}`} title={b.desc}>
                <span className="b-icon" aria-hidden="true">{b.icon}</span>
                <strong>{b.name}</strong>
                <span className="sr-only">{b.earned ? ' (earned)' : ' (locked)'}: {b.desc}</span>
                <span className="muted" aria-hidden="true" style={{ display: 'block' }}>{b.desc}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
