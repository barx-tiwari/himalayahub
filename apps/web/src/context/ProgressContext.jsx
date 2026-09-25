/**
 * All learner progress lives here and is persisted to LocalStorage.
 * To move to a backend later, replace the load/save effects with calls to
 * services (e.g. services/progressService.js) and keep the same actions.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { dateKey } from '../utils/format';
import { computeStreak, evaluateBadges, levelFromXp } from '../utils/gamification';
import { courses } from '../data/courses';

const STORAGE_KEY = 'progress:v1';

const EMPTY = {
  profile: null,
  typingResults: [],
  typingLessons: {},
  courseProgress: {},
  quizResults: [],
  notesRead: [],
  recentNotes: [],
  bookmarks: [],
  activityDates: [],
  xp: 0,
  dailyQuestion: null,
};

function withActivity(state, xpGain = 0) {
  const today = dateKey();
  const activityDates = state.activityDates.includes(today)
    ? state.activityDates
    : [...state.activityDates, today].slice(-400);
  return { ...state, activityDates, xp: state.xp + Math.max(0, Math.round(xpGain)) };
}

function reducer(state, action) {
  switch (action.type) {
    case 'setProfile':
      return { ...state, profile: action.profile };
    case 'signOut':
      return { ...state, profile: null };
    case 'addTypingResult': {
      const r = action.result;
      const next = { ...state, typingResults: [r, ...state.typingResults].slice(0, 100) };
      return withActivity(next, 10 + r.wpm / 5);
    }
    case 'saveLessonResult': {
      const { lessonId, wpm, accuracy, passed } = action;
      const prev = state.typingLessons[lessonId] || { bestWpm: 0, bestAccuracy: 0, completed: false, attempts: 0 };
      const firstPass = passed && !prev.completed;
      const updated = {
        bestWpm: Math.max(prev.bestWpm, wpm),
        bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
        completed: prev.completed || passed,
        attempts: prev.attempts + 1,
      };
      return withActivity({ ...state, typingLessons: { ...state.typingLessons, [lessonId]: updated } }, firstPass ? 20 : 3);
    }
    case 'completeCourseLesson': {
      const { courseId, lessonId } = action;
      const prev = state.courseProgress[courseId] || { completedLessons: [], lastLessonId: null };
      if (prev.completedLessons.includes(lessonId)) {
        return { ...state, courseProgress: { ...state.courseProgress, [courseId]: { ...prev, lastLessonId: lessonId } } };
      }
      const updated = { completedLessons: [...prev.completedLessons, lessonId], lastLessonId: lessonId, updatedAt: new Date().toISOString() };
      return withActivity({ ...state, courseProgress: { ...state.courseProgress, [courseId]: updated } }, 15);
    }
    case 'visitCourseLesson': {
      const { courseId, lessonId } = action;
      const prev = state.courseProgress[courseId] || { completedLessons: [], lastLessonId: null };
      if (prev.lastLessonId === lessonId) return state;
      return { ...state, courseProgress: { ...state.courseProgress, [courseId]: { ...prev, lastLessonId: lessonId, updatedAt: new Date().toISOString() } } };
    }
    case 'addQuizResult': {
      const q = action.result;
      return withActivity({ ...state, quizResults: [q, ...state.quizResults].slice(0, 100) }, q.score * 5);
    }
    case 'viewNote': {
      const { noteId } = action;
      const firstRead = !state.notesRead.includes(noteId);
      const recentNotes = [noteId, ...state.recentNotes.filter((n) => n !== noteId)].slice(0, 8);
      const next = { ...state, recentNotes, notesRead: firstRead ? [...state.notesRead, noteId] : state.notesRead };
      return firstRead ? withActivity(next, 2) : next;
    }
    case 'toggleBookmark': {
      const has = state.bookmarks.includes(action.noteId);
      return { ...state, bookmarks: has ? state.bookmarks.filter((b) => b !== action.noteId) : [action.noteId, ...state.bookmarks] };
    }
    case 'answerDaily': {
      if (state.dailyQuestion?.date === dateKey()) return state;
      const next = { ...state, dailyQuestion: { date: dateKey(), correct: action.correct, choice: action.choice } };
      return withActivity(next, action.correct ? 10 : 2);
    }
    case 'reset':
      return { ...EMPTY };
    default:
      return state;
  }
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ ...EMPTY, ...readStorage(STORAGE_KEY, {}) }));

  useEffect(() => { writeStorage(STORAGE_KEY, state); }, [state]);

  const actions = useMemo(() => ({
    setProfile: (profile) => dispatch({ type: 'setProfile', profile }),
    signOut: () => dispatch({ type: 'signOut' }),
    addTypingResult: (result) => dispatch({ type: 'addTypingResult', result }),
    saveLessonResult: (payload) => dispatch({ type: 'saveLessonResult', ...payload }),
    completeCourseLesson: (courseId, lessonId) => dispatch({ type: 'completeCourseLesson', courseId, lessonId }),
    visitCourseLesson: (courseId, lessonId) => dispatch({ type: 'visitCourseLesson', courseId, lessonId }),
    addQuizResult: (result) => dispatch({ type: 'addQuizResult', result }),
    viewNote: (noteId) => dispatch({ type: 'viewNote', noteId }),
    toggleBookmark: (noteId) => dispatch({ type: 'toggleBookmark', noteId }),
    answerDaily: (choice, correct) => dispatch({ type: 'answerDaily', choice, correct }),
    resetAll: () => dispatch({ type: 'reset' }),
  }), []);

  const derived = useMemo(() => {
    const tr = state.typingResults;
    const bestWpm = tr.reduce((m, r) => Math.max(m, r.wpm), 0);
    const avgAccuracy = tr.length ? Math.round(tr.reduce((s, r) => s + r.accuracy, 0) / tr.length) : null;
    const recent = tr.slice(0, 10);
    const avgWpm = recent.length ? Math.round(recent.reduce((s, r) => s + r.wpm, 0) / recent.length) : null;

    const lessonsCompleted = Object.values(state.courseProgress).reduce((s, c) => s + c.completedLessons.length, 0);
    const coursesCompleted = courses.filter((c) => {
      const p = state.courseProgress[c.id];
      return p && c.lessons.every((l) => p.completedLessons.includes(l.id));
    }).length;
    const totalLessons = courses.reduce((s, c) => s + c.lessons.length, 0);
    const learningPercent = totalLessons ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

    const quizAvg = state.quizResults.length
      ? Math.round(state.quizResults.reduce((s, q) => s + q.percent, 0) / state.quizResults.length)
      : null;

    const streak = computeStreak(state.activityDates);
    const level = levelFromXp(state.xp);
    const typingLessonsDone = Object.values(state.typingLessons).filter((l) => l.completed).length;
    const badges = evaluateBadges(state, { streak, coursesCompleted });

    return {
      bestWpm, avgWpm, avgAccuracy, lessonsCompleted, coursesCompleted, totalLessons,
      learningPercent, quizAvg, streak, level, typingLessonsDone, badges,
    };
  }, [state]);

  const isBookmarked = useCallback((id) => state.bookmarks.includes(id), [state.bookmarks]);
  const value = useMemo(() => ({ state, derived, isBookmarked, ...actions }), [state, derived, isBookmarked, actions]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
