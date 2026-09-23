import { dateKey } from './format';

export const XP_PER_LEVEL = 250;

export function levelFromXp(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, next: XP_PER_LEVEL, percent: Math.round((into / XP_PER_LEVEL) * 100) };
}

/** Consecutive-day streak ending today (or yesterday, so a streak survives until the day ends). */
export function computeStreak(activityDates = []) {
  if (!activityDates.length) return 0;
  const set = new Set(activityDates);
  const day = new Date();
  if (!set.has(dateKey(day))) {
    day.setDate(day.getDate() - 1);
    if (!set.has(dateKey(day))) return 0;
  }
  let streak = 0;
  while (set.has(dateKey(day))) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export const BADGES = [
  { id: 'first-test', icon: '⌨️', name: 'First test', desc: 'Finish a typing challenge', test: (s) => s.typingResults.length >= 1 },
  { id: 'wpm-40', icon: '🚀', name: '40 WPM', desc: 'Reach 40 WPM', test: (s) => s.typingResults.some((r) => r.wpm >= 40) },
  { id: 'wpm-60', icon: '⚡', name: '60 WPM', desc: 'Reach 60 WPM', test: (s) => s.typingResults.some((r) => r.wpm >= 60) },
  { id: 'accurate', icon: '🎯', name: 'Sharpshooter', desc: '98% accuracy in a 30s+ test', test: (s) => s.typingResults.some((r) => r.accuracy >= 98 && r.duration >= 30) },
  { id: 'lessons-5', icon: '🖐️', name: 'Touch typist', desc: 'Complete 5 typing lessons', test: (s) => Object.values(s.typingLessons).filter((l) => l.completed).length >= 5 },
  { id: 'reader', icon: '📚', name: 'Reader', desc: 'Read 5 IT notes', test: (s) => s.notesRead.length >= 5 },
  { id: 'first-quiz', icon: '🧠', name: 'Quiz taker', desc: 'Finish a quiz', test: (s) => s.quizResults.length >= 1 },
  { id: 'perfect', icon: '💯', name: 'Perfect score', desc: 'Score 100% on a quiz', test: (s) => s.quizResults.some((q) => q.percent === 100) },
  { id: 'learner', icon: '🎓', name: 'Learner', desc: 'Complete a course lesson', test: (s) => Object.values(s.courseProgress).some((c) => c.completedLessons.length > 0) },
  { id: 'graduate', icon: '🏅', name: 'Graduate', desc: 'Complete a full course', test: (s, ctx) => ctx.coursesCompleted >= 1 },
  { id: 'streak-3', icon: '🔥', name: '3-day streak', desc: 'Learn 3 days in a row', test: (s, ctx) => ctx.streak >= 3 },
  { id: 'streak-7', icon: '🏔️', name: '7-day streak', desc: 'Learn 7 days in a row', test: (s, ctx) => ctx.streak >= 7 },
];

export function evaluateBadges(state, ctx) {
  return BADGES.map((b) => ({ ...b, earned: Boolean(b.test(state, ctx)) }));
}
