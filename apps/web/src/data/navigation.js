/**
 * Site navigation. Dropdown groups use `children`; `match` lists path
 * prefixes that mark a group as active. Icons are names from utils/icons.
 */
export const toolLinks = [
  { to: '/tools/calendar', label: 'Calendar', desc: 'Nepali and English monthly calendar', icon: 'CalendarDays' },
  { to: '/tools/date-converter', label: 'Date Converter', desc: 'AD ↔ BS in one step', icon: 'ArrowLeftRight' },
  { to: '/tools/currency', label: 'Currency Converter', desc: 'NPR, USD, INR and more', icon: 'Coins' },
  { to: '/tools/world-clock', label: 'World Clock', desc: 'Live time in cities you choose', icon: 'Globe' },
  { to: '/bmi', label: 'BMI Calculator', desc: 'Body Mass Index with clear context', icon: 'HeartPulse' },
];

export const funLinks = [
  { to: '/astrology', label: 'AI Astrologer', desc: 'Horoscope chat, for entertainment', icon: 'Sparkles' },
  { to: '/tarot', label: 'Tarot', desc: 'Card spreads, just for fun', icon: 'Star' },
];

export const learnLinks = [
  { to: '/courses', label: 'Courses', desc: 'Guided lessons with quizzes', icon: 'GraduationCap' },
  { to: '/quizzes', label: 'Quizzes', desc: 'Test yourself by topic', icon: 'ListChecks' },
  { to: '/typing/lessons', label: 'Typing Lessons', desc: 'Ten steps to touch typing', icon: 'Keyboard' },
];

export const notesLinks = [
  { to: '/notes', label: 'IT Notes', desc: 'Exam-ready IT revision notes', icon: 'BookOpen' },
  { to: '/notes/csit', label: 'CSIT Notes', desc: 'BSc Computer Science & IT', icon: 'Cpu' },
  { to: '/notes/bca', label: 'BCA Notes', desc: 'Bachelor of Computer Applications', icon: 'Code2' },
  { to: '/notes/bim', label: 'BIM Notes', desc: 'Bachelor of Information Management', icon: 'Server' },
  { to: '/notes/bba', label: 'BBA Notes', desc: 'Bachelor of Business Administration', icon: 'Landmark' },
];

export const sportsLinks = [
  { to: '/sports', label: 'Sports Center', desc: 'All sports at a glance', icon: 'Trophy' },
  { to: '/football', label: 'Football', desc: 'Fixtures, results and tables', icon: 'CircleDot' },
  { to: '/cricket', label: 'Cricket', desc: 'Live, upcoming and completed', icon: 'Target' },
  { to: '/npl', label: 'NPL', desc: 'Nepal Premier League', icon: 'Flag' },
];

export const marketsLinks = [
  { to: '/markets', label: 'Markets overview', desc: 'NEPSE and crypto', icon: 'LineChart' },
  { to: '/crypto', label: 'Crypto', desc: 'Top 50 coins with charts', icon: 'Bitcoin' },
  { to: '/nepse', label: 'NEPSE', desc: 'Nepal Stock Exchange', icon: 'BarChart3' },
];

export const weatherLinks = [
  { to: '/explore-nepal', label: 'Explore Nepal', desc: 'Destinations, photos and travel notes', icon: 'Mountain' },
  { to: '/hidden-gems', label: 'Hidden Gems of the East', desc: 'Ten places few travellers see', icon: 'Gem' },
  { to: '/travel-guide', label: 'Travel Nepal Guide', desc: 'Visas, SIMs, permits and etiquette', icon: 'Plane' },
  { to: '/where-to-go', label: 'Where should I go?', desc: 'Destinations ranked by forecast', icon: 'Compass' },
  { to: '/weather', label: 'Nepal Weather', desc: 'Forecast for any place', icon: 'CloudSun' },
];

export const infoLinks = [
  { to: '/emergency', label: 'Emergency Help', desc: 'Verified national numbers', icon: 'Siren' },
  { to: '/explore-nepal', label: 'Explore Nepal', desc: 'Destinations and travel notes', icon: 'MapPin' },
];

export const mainNav = [
  { to: '/', label: 'Home', end: true },
  { label: 'Explore', children: weatherLinks, match: ['/weather', '/where-to-go', '/explore-nepal', '/hidden-gems', '/travel-guide'] },
  { to: '/community', label: 'Community', match: ['/community'] },
  { to: '/typing', label: 'Typing', match: ['/typing'] },
  { label: 'Learn', children: learnLinks, match: ['/learn', '/courses', '/quizzes'] },
  { label: 'Notes', children: notesLinks, match: ['/notes'] },
  { to: '/news', label: 'News', match: ['/news'] },
  { label: 'Sports', children: sportsLinks, match: ['/sports', '/football', '/cricket', '/npl'] },
  { label: 'Markets', children: marketsLinks, match: ['/markets', '/crypto', '/nepse'] },
  { label: 'Tools', children: [...toolLinks, ...funLinks], match: ['/tools', '/bmi', '/astrology', '/tarot'] },
  { label: 'Information', children: infoLinks, match: ['/emergency'] },
];

/** Colour domain per route prefix (drives --d1/--d2 accents via data-domain). */
export const DOMAINS = [
  ['alert', ['/emergency']],
  ['news', ['/news']],
  ['sports', ['/sports', '/football', '/cricket', '/npl']],
  ['markets', ['/markets', '/crypto', '/nepse']],
  ['nepal', ['/weather', '/where-to-go', '/explore-nepal', '/hidden-gems', '/travel-guide', '/community']],
  ['tools', ['/tools', '/bmi']],
  ['fun', ['/astrology', '/tarot']],
  ['learn', ['/typing', '/learn', '/courses', '/quizzes', '/notes', '/dashboard']],
];
export const domainFor = (path) => DOMAINS.find(([, ps]) => ps.some((p) => path === p || path.startsWith(`${p}/`)))?.[0] || 'learn';
