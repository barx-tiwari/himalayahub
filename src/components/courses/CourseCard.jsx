import { Link } from 'react-router-dom';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';
import { Icon } from '../../utils/icons';
import ProgressBar from '../ui/ProgressBar';
import { useProgress } from '../../context/ProgressContext';

export function courseProgressPercent(course, courseProgress) {
  const done = courseProgress[course.id]?.completedLessons?.length || 0;
  return Math.round((done / course.lessons.length) * 100);
}

export default function CourseCard({ course }) {
  const { state } = useProgress();
  const percent = courseProgressPercent(course, state.courseProgress);
  return (
    <article className="card course-card">
      <div className="course-cover" style={{ background: `linear-gradient(135deg, ${course.color}, color-mix(in srgb, ${course.color} 55%, #0d1320))` }} aria-hidden="true">
        <Icon name={course.icon} />
      </div>
      <div>
        <h3 className="card-title"><Link to={`/courses/${course.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{course.title}</Link></h3>
        <p className="card-sub">Instructor: {course.instructor}</p>
      </div>
      <div className="course-meta">
        <span><BarChart3 aria-hidden="true" />{course.difficulty}</span>
        <span><Clock aria-hidden="true" />{course.duration}</span>
        <span><BookOpen aria-hidden="true" />{course.lessons.length} lessons</span>
      </div>
      <ProgressBar value={percent} label="Progress" />
      <Link to={`/courses/${course.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }} aria-label={`${percent ? 'Continue' : 'Start'} ${course.title}`}>
        {percent === 100 ? 'Review course' : percent ? 'Continue' : 'Start course'}
      </Link>
    </article>
  );
}
