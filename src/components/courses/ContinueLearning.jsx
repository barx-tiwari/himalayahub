import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { courses } from '../../data/courses';
import { useProgress } from '../../context/ProgressContext';
import { Icon } from '../../utils/icons';
import ProgressBar from '../ui/ProgressBar';
import { courseProgressPercent } from './CourseCard';

/** Courses the learner has started but not finished, most recent first. */
export function useInProgressCourses() {
  const { state } = useProgress();
  return courses
    .map((c) => ({ course: c, p: state.courseProgress[c.id], percent: courseProgressPercent(c, state.courseProgress) }))
    .filter((x) => x.p && x.percent < 100)
    .sort((a, b) => (b.p.updatedAt || '').localeCompare(a.p.updatedAt || ''));
}

export default function ContinueLearning({ limit = 3, emptyText }) {
  const items = useInProgressCourses().slice(0, limit);
  if (!items.length) return emptyText ? <p className="muted small" style={{ margin: 0 }}>{emptyText}</p> : null;
  return (
    <div className="grid grid-3">
      {items.map(({ course, p, percent }) => {
        const lesson = course.lessons.find((l) => l.id === p.lastLessonId) || course.lessons[0];
        return (
          <Link key={course.id} to={`/courses/${course.id}?lesson=${lesson.id}`} className="card card-link dash-card">
            <span className="icon-tile" style={{ background: course.color, color: '#fff' }}><Icon name={course.icon} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block' }}>{course.title}</strong>
              <span className="small muted" style={{ display: 'block', marginBottom: 8 }}><Play size={12} aria-hidden="true" /> {lesson.title}</span>
              <ProgressBar value={percent} label="Complete" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
