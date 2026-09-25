/**
 * Global search over local data. Replace buildIndex() with an API call
 * (e.g. GET /search?q=) when a backend is available; keep the result shape.
 */
import { notes, getCategory } from '../data/notes';
import { courses } from '../data/courses';
import { typingLessons } from '../data/typingLessons';
import { quizCategories, quizQuestions } from '../data/quizQuestions';
import { toolLinks, funLinks } from '../data/navigation';
import { programs, programSemesters } from '../data/programs';
import { newsCategories } from '../data/newsCategories';
import { footballLeagues } from '../data/sportsConfig';
import { weatherCities, destinations } from '../data/nepalPlaces';
import { nationalContacts } from '../data/emergencyContacts';
import { cachedHeadlines } from '../services/newsService';
import { readCache } from '../services/liveCache';

export const SEARCH_GROUPS = ['IT Notes', 'CSIT Notes', 'BCA Notes', 'BIM Notes', 'BBA Notes', 'Courses', 'Lessons', 'Quizzes', 'News', 'Sports', 'Markets', 'Nepal Info', 'Tools', 'Pages'];

const PAGES = [
  { title: 'Typing Challenge', subtitle: 'Timed WPM and accuracy test', to: '/typing', icon: 'Keyboard', keywords: 'typing speed wpm test practice' },
  { title: 'Typing Lessons', subtitle: '10 touch-typing lessons', to: '/typing/lessons', icon: 'Keyboard', keywords: 'typing lessons home row keyboard' },
  { title: 'Student Dashboard', subtitle: 'Your progress, XP and badges', to: '/dashboard', icon: 'LayoutDashboard', keywords: 'dashboard progress stats badges streak xp' },
  { title: 'Profile', subtitle: 'Your name and saved data', to: '/profile', icon: 'LayoutDashboard', keywords: 'profile account settings' },
];

let cache = null;

function buildIndex() {
  const items = [];
  notes.forEach((n) => items.push({
    group: 'IT Notes', title: n.title, subtitle: `${getCategory(n.category)?.name ?? ''} · ${n.summary}`,
    to: `/notes/${n.id}`, icon: getCategory(n.category)?.icon || 'FileText',
    text: `${n.title} ${n.summary} ${(n.tags || []).join(' ')} ${n.category}`,
  }));
  courses.forEach((c) => {
    items.push({
      group: 'Courses', title: c.title, subtitle: `${c.difficulty} · ${c.instructor}`, to: `/courses/${c.id}`, icon: c.icon,
      text: `${c.title} ${c.description} ${c.lessons.map((l) => l.title).join(' ')} ${c.quizCategory}`,
    });
    c.lessons.forEach((l) => items.push({
      group: 'Lessons', title: l.title, subtitle: `Course lesson · ${c.title}`, to: `/courses/${c.id}?lesson=${l.id}`, icon: 'GraduationCap',
      text: `${l.title} ${c.title} ${l.content.slice(0, 400)}`,
    }));
  });
  typingLessons.forEach((l, i) => items.push({
    group: 'Lessons', title: `Typing ${i + 1}: ${l.title}`, subtitle: l.summary, to: `/typing/lessons/${l.id}`, icon: 'Keyboard',
    text: `${l.title} ${l.summary} typing lesson`,
  }));
  quizCategories.forEach((q) => {
    const qs = quizQuestions.filter((x) => x.category === q.id);
    items.push({
      group: 'Quizzes', title: `${q.name} Quiz`, subtitle: `${qs.length} questions`, to: `/quizzes/${q.id}`, icon: q.icon,
      text: `${q.name} quiz questions mcq ${qs.map((x) => `${x.question} ${x.options.join(' ')}`).join(' ')}`,
    });
  });
  programs.forEach((p) => programSemesters(p).forEach((sem) => sem.subjects.forEach((x) => items.push({
    group: `${p.name.replace('BSc ', '')} Notes`, title: x.title, subtitle: `${p.name} · semester ${sem.semester} · ${x.overview}`, to: `/notes/${p.id}/${x.id}`, icon: x.icon,
    text: `${x.title} ${x.short} ${x.overview} ${x.tags.join(' ')} ${x.definitions.map((d) => d.term).join(' ')} ${x.notes.map((n) => n.heading).join(' ')} ${p.name} ${p.id} notes semester`,
  }))));
  newsCategories.forEach((c) => items.push({ group: 'News', title: `${c.label} News`, subtitle: 'Live headlines with sources', to: c.id === 'latest' ? '/news' : `/news/${c.id}`, icon: 'Newspaper', text: `${c.label} news headlines ${c.id}` }));
  [
    { title: 'Sports Center', subtitle: 'Football, cricket, NPL and F1', to: '/sports', icon: 'Trophy', text: 'sports scores f1 formula basketball tennis' },
    { title: 'Football Schedule', subtitle: 'Fixtures, results and tables in your time zone', to: '/football', icon: 'CircleDot', text: 'football soccer fixtures schedule results table' },
    { title: 'Cricket Center', subtitle: 'Live, upcoming and completed matches', to: '/cricket', icon: 'Target', text: 'cricket live score t20 odi test' },
    { title: 'Nepal Premier League (NPL)', subtitle: 'Live score or next match countdown', to: '/npl', icon: 'Flag', text: 'npl nepal premier league cricket live score' },
  ].forEach((x) => items.push({ group: 'Sports', ...x }));
  footballLeagues.forEach((l) => items.push({ group: 'Sports', title: l.name, subtitle: 'Football fixtures and results', to: `/football?league=${l.code}&when=week`, icon: 'CircleDot', text: `${l.name} ${l.code} football league fixtures table` }));
  [
    { title: 'Markets overview', subtitle: 'Gold, crypto and NEPSE', to: '/markets', icon: 'LineChart', text: 'markets finance prices' },
    { title: 'Gold & Silver prices', subtitle: 'Nepal per tola and international spot', to: '/gold', icon: 'Coins', text: 'gold silver price tola rate nepal fenegosida' },
    { title: 'Crypto market', subtitle: 'Top 50 coins, 24h change and charts', to: '/crypto', icon: 'Bitcoin', text: 'crypto bitcoin btc ethereum eth bnb solana xrp usdt' },
    { title: 'NEPSE', subtitle: 'Nepal Stock Exchange dashboard', to: '/nepse', icon: 'BarChart3', text: 'nepse share market stock index nepal' },
  ].forEach((x) => items.push({ group: 'Markets', ...x }));
  [
    { title: 'Emergency Help', subtitle: 'Police 100 · Fire 101 · Ambulance 102', to: '/emergency', icon: 'Siren', text: 'emergency police fire ambulance hospital helpline number sos disaster' },
    { title: 'Nepal Weather', subtitle: 'Forecast for any place in Nepal', to: '/weather', icon: 'CloudSun', text: 'weather forecast rain temperature' },
    { title: 'Where should I go?', subtitle: 'Destinations ranked by forecast', to: '/where-to-go', icon: 'Compass', text: 'travel destination recommendation weather trip' },
    { title: 'Explore Nepal', subtitle: 'Destinations, activities and weather', to: '/explore-nepal', icon: 'Mountain', text: 'explore nepal tourism places travel' },
  ].forEach((x) => items.push({ group: 'Nepal Info', ...x }));
  weatherCities.forEach((c) => items.push({ group: 'Nepal Info', title: `Weather in ${c.name}`, subtitle: `${c.district} district`, to: `/weather/${c.id}`, icon: 'CloudSun', text: `${c.name} ${c.district} weather forecast` }));
  destinations.forEach((d) => items.push({ group: 'Nepal Info', title: d.name, subtitle: d.knownFor, to: `/explore-nepal/${d.id}`, icon: 'Mountain', text: `${d.name} ${d.tagline} ${d.tags.join(' ')} ${d.knownFor} ${d.activities.join(' ')} travel destination` }));
  nationalContacts.filter((c) => c.number).forEach((c) => items.push({ group: 'Nepal Info', title: `${c.service}: ${c.number}`, subtitle: `${c.category} · ${c.availability}`, to: '/emergency', icon: 'Siren', text: `${c.service} ${c.category} ${c.number} emergency helpline` }));
  funLinks.forEach((t) => items.push({ group: 'Pages', title: t.label, subtitle: t.desc, to: t.to, icon: t.icon, text: `${t.label} ${t.desc}` }));
  toolLinks.forEach((t) => items.push({ group: 'Tools', title: t.label, subtitle: t.desc, to: t.to, icon: t.icon, text: `${t.label} ${t.desc} tool nepali bs ad` }));
  PAGES.forEach((p) => items.push({ group: 'Pages', ...p, text: `${p.title} ${p.subtitle} ${p.keywords}` }));
  return items.map(prep);
}
const prep = (it) => ({ ...it, hay: it.text.toLowerCase(), titleLower: it.title.toLowerCase() });

/** Live items already cached on this device (headlines, coins) — no extra requests. */
function liveItems() {
  const out = cachedHeadlines().slice(0, 150).map((h) => ({ group: 'News', title: h.title, subtitle: `${h.source} · headline`, href: h.url, icon: 'Newspaper', text: `${h.title} ${h.description}` }));
  (readCache('crypto:markets')?.data || []).forEach((c) => out.push({ group: 'Markets', title: `${c.name} (${c.symbol})`, subtitle: 'Cryptocurrency', to: '/crypto', icon: 'Bitcoin', text: `${c.name} ${c.symbol} crypto price` }));
  return out.map(prep);
}

/** Returns [{ group, items: [...] }] ordered by SEARCH_GROUPS. */
export function searchAll(query, { perGroup = 6 } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (!cache) cache = buildIndex();
  const terms = q.split(/\s+/);
  const scored = [];
  [...cache, ...liveItems()].forEach((it) => {
    if (!terms.every((t) => it.hay.includes(t) || it.titleLower.includes(t))) return;
    let score = 1;
    if (it.titleLower === q) score += 10;
    else if (it.titleLower.startsWith(q)) score += 6;
    else if (it.titleLower.includes(q)) score += 4;
    scored.push({ ...it, score });
  });
  scored.sort((a, b) => b.score - a.score);
  return SEARCH_GROUPS.map((group) => ({
    group,
    items: scored.filter((s) => s.group === group).slice(0, perGroup),
  })).filter((g) => g.items.length);
}
