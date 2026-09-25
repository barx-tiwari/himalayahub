/**
 * Programs reference subjects from the shared library by id.
 * To add or move a subject: edit the semester list. To add a new subject:
 * add it to data/subjects/*.js, then reference its id here.
 * `title` overrides the library title when a program names the course differently.
 */
import { getSubject } from '../subjects';

export const SYLLABUS_NOTE = 'Semester placement shows a typical arrangement. Course names, order and content differ between universities and syllabus years — always check your own university\'s current syllabus.';

export const programs = [
  {
    id: 'csit', name: 'BSc CSIT', full: 'Bachelor of Science in Computer Science and Information Technology',
    blurb: 'Computer science fundamentals through to security, cloud and IoT.',
    semesters: [
      ['iit', 'c-programming', 'digital-logic', 'mathematics'],
      ['discrete'],
      ['dsa', 'comp-arch'],
      ['networks', 'os', 'dbms', 'ai'],
      ['crypto', 'web-tech'],
      ['se'],
      ['project-mgmt', 'cloud', 'project-work'],
      ['cybersec', 'iot'],
    ],
  },
  {
    id: 'bca', name: 'BCA', full: 'Bachelor of Computer Applications',
    blurb: 'Applied computing: programming, databases, networks and the web.',
    semesters: [
      [{ id: 'iit', title: 'Computer Fundamentals & Applications' }, 'mathematics', 'digital-logic'],
      [{ id: 'c-programming', title: 'Programming in C' }, 'statistics'],
      ['dsa', 'comp-arch', 'web-tech'],
      ['os', 'dbms'],
      [{ id: 'networks', title: 'Computer Networking' }, 'se'],
      ['ai'],
      ['cybersec'],
      ['project-work'],
    ],
  },
  {
    id: 'bim', name: 'BIM', full: 'Bachelor of Information Management',
    blurb: 'Where IT meets business: systems, data and management.',
    semesters: [
      ['iit', 'business-math', 'management'],
      [{ id: 'c-programming', title: 'Programming' }, 'accounting', 'economics'],
      ['statistics', 'dbms'],
      [{ id: 'networks', title: 'Networking' }, 'web-tech'],
      ['se', 'info-systems'],
      [],
      ['project-mgmt'],
      ['project-work'],
    ],
  },
  {
    id: 'bba', name: 'BBA', full: 'Bachelor of Business Administration',
    blurb: 'Core business disciplines from accounting to entrepreneurship.',
    semesters: [
      ['business-comm', 'business-math', 'management', 'economics'],
      ['accounting', 'statistics', 'business-env'],
      ['marketing', 'business-law'],
      ['finance', 'hrm'],
      ['entrepreneurship'],
    ],
  },
];

export const getProgram = (id) => programs.find((p) => p.id === id);

/** [{ semester, subjects: [{ ...subject, title }] }] — skipping empty semesters and unknown ids. */
export function programSemesters(program) {
  return program.semesters.map((list, i) => ({
    semester: i + 1,
    subjects: list.map((e) => {
      const ref = typeof e === 'string' ? { id: e } : e;
      const s = getSubject(ref.id);
      return s ? { ...s, title: ref.title || s.title } : null;
    }).filter(Boolean),
  })).filter((s) => s.subjects.length);
}

/** Programs (and semesters) that include a subject. */
export function whereTaught(subjectId) {
  return programs.flatMap((p) => programSemesters(p).filter((s) => s.subjects.some((x) => x.id === subjectId)).map((s) => ({ program: p, semester: s.semester, title: s.subjects.find((x) => x.id === subjectId).title })));
}
