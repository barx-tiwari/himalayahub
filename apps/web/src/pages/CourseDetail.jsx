import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, FileText, ListChecks, Video } from 'lucide-react';
import { getCourse } from '../data/courses';
import { getNote } from '../data/notes';
import { getQuestionsByCategory } from '../data/quizQuestions';
import { useProgress } from '../context/ProgressContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { courseProgressPercent } from '../components/courses/CourseCard';
import MiniQuiz from '../components/quiz/MiniQuiz';
import NotFound from './NotFound';

export default function CourseDetail() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const [params, setParams] = useSearchParams();
  const { state, completeCourseLesson, visitCourseLesson } = useProgress();
  useDocumentTitle(course ? course.title : 'Course not found');

  const lessonId = params.get('lesson');
  const lessonIndex = course ? Math.max(0, course.lessons.findIndex((l) => l.id === lessonId)) : 0;
  const lesson = course?.lessons[lessonIndex];

  useEffect(() => {
    if (course && params.get('lesson')) visitCourseLesson(course.id, lesson.id);
  }, [course, lesson, params, visitCourseLesson]);

  if (!course) return <NotFound />;

  const progress = state.courseProgress[course.id];
  const done = (id) => progress?.completedLessons?.includes(id);
  const percent = courseProgressPercent(course, state.courseProgress);
  const next = course.lessons[lessonIndex + 1];
  const prev = course.lessons[lessonIndex - 1];
  const goTo = (l) => { setParams({ lesson: l.id }); window.scrollTo(0, 0); };
  const note = lesson.relatedNoteId ? getNote(lesson.relatedNoteId) : null;
  const quizQs = getQuestionsByCategory(course.quizCategory);
  const miniQs = quizQs.slice(lessonIndex * 2, lessonIndex * 2 + 2).length ? quizQs.slice(lessonIndex * 2, lessonIndex * 2 + 2) : quizQs.slice(0, 2);

  return (
    <div className="container page">
      <nav className="small" aria-label="Breadcrumb" style={{ marginBottom: 12 }}><Link to="/courses">Courses</Link> / {course.title}</nav>
      <header className="page-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="row small" style={{ marginTop: 12 }}>
          <span className="chip">{course.difficulty}</span><span className="chip">{course.duration}</span>
          <span className="chip">{course.lessons.length} lessons</span><span className="muted">Instructor: {course.instructor}</span>
        </div>
      </header>

      <div className="course-layout">
        <article className="stack">
          {lesson.videoUrl ? (
            <iframe className="video-frame" src={lesson.videoUrl} title={`Video: ${lesson.title}`} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
          ) : (
            <div className="video-placeholder" role="img" aria-label="Video coming soon">
              <div>
                <Video aria-hidden="true" />
                <p style={{ margin: 0 }}><strong>Video lesson coming soon</strong></p>
                <p className="small" style={{ margin: 0 }}>Set <code>videoUrl</code> for this lesson in <code>src/data/courses.js</code> to embed a video.</p>
              </div>
            </div>
          )}

          <section className="card" aria-labelledby="lesson-title">
            <p className="small muted" style={{ marginBottom: 4 }}>Lesson {lessonIndex + 1} of {course.lessons.length} · {lesson.duration}</p>
            <h2 id="lesson-title">{lesson.title}</h2>
            {lessonIndex === 0 && <p className="muted"><strong>Introduction:</strong> {course.description}</p>}
            <h3 style={{ fontSize: 'var(--fs-lg)' }}><FileText size={18} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Lesson notes</h3>
            {lesson.content.split('\n\n').map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            {note && <p className="small">Read more: <Link to={`/notes/${note.id}`}>{note.title} (IT Notes)</Link></p>}
          </section>

          <section className="card" aria-labelledby="practice">
            <h3 id="practice" style={{ fontSize: 'var(--fs-lg)' }}><ListChecks size={18} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Practice questions</h3>
            <ol className="qa-list" style={{ display: 'grid', gap: 8 }}>{lesson.practice.map((p) => <li key={p}>{p}</li>)}</ol>
          </section>

          {miniQs.length > 0 && (
            <section className="card" aria-labelledby="mini-quiz">
              <h3 id="mini-quiz" style={{ fontSize: 'var(--fs-lg)' }}>Quick quiz</h3>
              <MiniQuiz key={lesson.id} questions={miniQs} />
              <p className="small" style={{ marginTop: 12, marginBottom: 0 }}><Link to={`/quizzes/${course.quizCategory}`}>Take the full timed quiz</Link></p>
            </section>
          )}

          <div className="row-between">
            {prev ? <Button variant="ghost" icon={ArrowLeft} onClick={() => goTo(prev)}>Previous</Button> : <span />}
            <div className="row">
              {done(lesson.id)
                ? <span className="chip chip-success"><Check aria-hidden="true" /> Completed</span>
                : <Button variant="secondary" icon={Check} onClick={() => completeCourseLesson(course.id, lesson.id)}>Mark as complete</Button>}
              {next
                ? <Button iconRight={ArrowRight} onClick={() => { completeCourseLesson(course.id, lesson.id); goTo(next); }}>Next lesson</Button>
                : <Button to={`/quizzes/${course.quizCategory}`} onClick={() => completeCourseLesson(course.id, lesson.id)}>Finish &amp; take quiz</Button>}
            </div>
          </div>
        </article>

        <aside className="card" aria-label="Course lessons" style={{ position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
          <h2 className="card-title">Lessons</h2>
          <ProgressBar value={percent} label="Course progress" />
          <ol className="lesson-nav" style={{ marginTop: 16 }}>
            {course.lessons.map((l, i) => (
              <li key={l.id} className={done(l.id) ? 'done' : ''}>
                <button type="button" onClick={() => goTo(l)} aria-current={i === lessonIndex}>
                  {done(l.id) ? <CheckCircle2 aria-label="Completed" /> : <Circle aria-hidden="true" />}
                  <span style={{ flex: 1 }}>{l.title}</span>
                  <span className="small muted">{l.duration}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
