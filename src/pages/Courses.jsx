import { useMemo, useState } from 'react';
import { courses } from '../data/courses';
import CourseCard from '../components/courses/CourseCard';
import ContinueLearning, { useInProgressCourses } from '../components/courses/ContinueLearning';
import Segmented from '../components/ui/Segmented';
import SearchBar from '../components/search/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const LEVELS = [{ id: 'all', label: 'All' }, { id: 'Beginner', label: 'Beginner' }, { id: 'Intermediate', label: 'Intermediate' }, { id: 'Advanced', label: 'Advanced' }];

export default function Courses() {
  useDocumentTitle('Courses');
  const [level, setLevel] = useState('all');
  const [q, setQ] = useState('');
  const inProgress = useInProgressCourses();
  const list = useMemo(() => courses.filter((c) => (level === 'all' || c.difficulty === level)
    && `${c.title} ${c.description} ${c.instructor}`.toLowerCase().includes(q.trim().toLowerCase())), [level, q]);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Online IT Courses</h1>
        <p>Short, structured courses with lesson notes, practice questions and a quiz for each topic.</p>
      </header>
      {inProgress.length > 0 && (
        <section aria-labelledby="cl" style={{ marginBottom: 40 }}>
          <div className="section-title"><h2 id="cl">Continue learning</h2></div>
          <ContinueLearning />
        </section>
      )}
      <div className="row-between" style={{ marginBottom: 16 }}>
        <Segmented label="Filter by difficulty" options={LEVELS} value={level} onChange={setLevel} />
        <div style={{ flex: '0 1 320px' }}><SearchBar value={q} onChange={setQ} label="Search courses" placeholder="Search courses" /></div>
      </div>
      {list.length ? <div className="grid grid-3">{list.map((c) => <CourseCard key={c.id} course={c} />)}</div>
        : <EmptyState title="No courses match">Try another difficulty or search term.</EmptyState>}
    </div>
  );
}
