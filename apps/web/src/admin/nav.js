/**
 * Admin sidebar. `perm` hides items the user can't use (the API enforces it anyway).
 * `ready: false` items open a placeholder until their slice is built.
 */
export const ADMIN_NAV = [
  { group: null, items: [{ to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', perm: 'cms.access', ready: true, end: true }] },
  { group: 'Content', items: [
    { to: '/admin/news', label: 'News', icon: 'Newspaper', perm: 'news.read', slice: 4 },
    { to: '/admin/news-categories', label: 'Categories', icon: 'Tags', perm: 'news.update', slice: 4 },
    { to: '/admin/notes', label: 'Notes', icon: 'BookOpen', perm: 'notes.read', slice: 3 },
    { to: '/admin/courses', label: 'Courses', icon: 'GraduationCap', perm: 'courses.read', slice: 5 },
    { to: '/admin/quizzes', label: 'Quizzes', icon: 'ListChecks', perm: 'quizzes.manage', slice: 5 },
    { to: '/admin/destinations', label: 'Destinations', icon: 'Mountain', perm: 'destinations.update', ready: true },
    { to: '/admin/travel-categories', label: 'Travel Categories', icon: 'Compass', perm: 'destinations.update', ready: true },
  ] },
  { group: 'Community', items: [
    { to: '/admin/moderation', label: 'Moderation', icon: 'ShieldAlert', perm: 'comments.moderate', ready: true },
  ] },
  { group: 'Live Data', items: [
    { to: '/admin/weather', label: 'Weather', icon: 'CloudSun', perm: 'weather.manage', slice: 6 },
    { to: '/admin/sports', label: 'Sports', icon: 'Trophy', perm: 'sports.manage', slice: 6 },
    { to: '/admin/markets', label: 'Markets', icon: 'LineChart', perm: 'markets.manage', slice: 6 },
    { to: '/admin/crypto', label: 'Crypto', icon: 'Bitcoin', perm: 'markets.manage', slice: 6 },
    { to: '/admin/nepse', label: 'NEPSE', icon: 'BarChart3', perm: 'markets.manage', slice: 6 },
  ] },
  { group: 'Education', items: [
    { to: '/admin/programs', label: 'Programs', icon: 'Landmark', perm: 'academics.manage', slice: 3 },
    { to: '/admin/subjects', label: 'Subjects', icon: 'Layers', perm: 'academics.manage', slice: 3 },
    { to: '/admin/semesters', label: 'Semesters', icon: 'CalendarDays', perm: 'academics.manage', slice: 3 },
  ] },
  { group: 'Users', items: [
    { to: '/admin/users', label: 'Users', icon: 'Users', perm: 'users.read', slice: 5 },
    { to: '/admin/roles', label: 'Roles', icon: 'UserCheck', perm: 'users.roles', slice: 5 },
    { to: '/admin/permissions', label: 'Permissions', icon: 'KeyRound', perm: 'admins.manage', slice: 5 },
  ] },
  { group: 'Emergency', items: [{ to: '/admin/emergency', label: 'Emergency Contacts', icon: 'Siren', perm: 'emergency.manage', slice: 5 }] },
  { group: 'System', items: [
    { to: '/admin/api-settings', label: 'API Settings', icon: 'Server', perm: 'api.manage', slice: 6 },
    { to: '/admin/settings', label: 'Site Settings', icon: 'Settings', perm: 'settings.manage', ready: true },
    { to: '/admin/media', label: 'Media', icon: 'Image', perm: 'media.manage', slice: 5 },
    { to: '/admin/logs', label: 'Logs', icon: 'ScrollText', perm: 'logs.read', slice: 6 },
  ] },
];

export const SLICE_NAMES = { 2: 'Destinations', 3: 'Notes & academics', 4: 'News', 5: 'Courses, quizzes, users, media & emergency', 6: 'Live data, API settings & logs' };
export const findNavItem = (path) => ADMIN_NAV.flatMap((g) => g.items).find((i) => i.to === path);
