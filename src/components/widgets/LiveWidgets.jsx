/**
 * Compact live cards used by "Live Today" (home) and the student dashboard.
 * Each uses the same cache keys as the full pages, so data is shared and
 * no widget ever triggers duplicate requests.
 */
import { Link } from 'react-router-dom';
import { useLiveDataRefresh } from '../../hooks/useLiveDataRefresh';
import { isShowingLive } from '../live/LiveDataRefresh';
import DataState from '../live/DataState';
import Delta from '../live/Delta';
import { useNow } from '../../hooks/useNow';
import { useProgress } from '../../context/ProgressContext';
import { REFRESH } from '../../services/config';
import { getNews } from '../../services/newsService';
import { dateRange, getFootballMatches, isMatchLive, matchStatus } from '../../services/sportsService';
import { getCricketMatches, isCricketLive } from '../../services/cricketService';
import { getMetals } from '../../services/goldService';
import { getMarkets, formatUsd } from '../../services/cryptoService';
import { getNepse, isNepseSession } from '../../services/nepseService';
import { describe, getForecast } from '../../services/weatherService';
import { formatLocalTime, formatZonedTime, relativeTime } from '../../services/timezoneService';
import { AD_MONTHS, BS_MONTHS, WEEKDAYS, adToBs } from '../../utils/nepaliDate';
import { readStorage } from '../../utils/storage';
import { getCity } from '../../data/nepalPlaces';
import { getProgram, programSemesters } from '../../data/programs';
import { getSubject } from '../../data/subjects';

export function WidgetShell({ emoji, title, feed, to, linkLabel = 'View more', children, className = 'glass', controls }) {
  useNow(30_000);
  const live = feed && feed.status === 'success' && isShowingLive(feed);
  const when = feed?.meta?.dataAsOf || feed?.updatedAt;
  return (
    <section className={`widget ${className}`} aria-label={title}>
      <div className="widget-head"><h3><span className="emoji" aria-hidden="true">{emoji}</span>{title}</h3>{controls || (live && <span className="live-pill small"><span className="live-dot" aria-hidden="true" />Live</span>)}</div>
      <div className="widget-body">{children}</div>
      <div className="widget-foot">
        <span>{feed ? (feed.status === 'success' && when ? `Updated ${relativeTime(when)}` : feed.status === 'loading' ? 'Loading…' : feed.status === 'error' ? 'Unavailable' : '') : ''}</span>
        {to && <Link to={to}>{linkLabel}<span className="sr-only">: {title}</span></Link>}
      </div>
    </section>
  );
}

export function WeatherWidget(props) {
  const place = readStorage('weather:last', null) || getCity('kathmandu');
  const feed = useLiveDataRefresh(`weather:${place.lat.toFixed(3)},${place.lon.toFixed(3)}`, () => getForecast(place.lat, place.lon), { interval: REFRESH.weather.base });
  return (
    <WidgetShell emoji="🌤" title="Weather" feed={feed} to={`/weather/${place.id}`} {...props}>
      <DataState feed={feed} compact>{(w) => { const c = describe(w.current.code, w.current.isDay); return <>
        <span className="widget-value">{Number.isFinite(w.current.temp) ? `${Math.round(w.current.temp)}°C` : '—'}</span>
        <span className="small">{c.emoji} {c.label} · {place.name}</span>
        <span className="small muted">Rain today {w.days[0]?.rainChance ?? '—'}% · feels {Math.round(w.current.feelsLike)}°</span></>; }}</DataState>
    </WidgetShell>
  );
}

export function NewsWidget(props) {
  const feed = useLiveDataRefresh('news:latest', () => getNews('latest'), { interval: REFRESH.news.base });
  return (
    <WidgetShell emoji="📰" title="Latest News" feed={feed} to="/news" {...props}>
      <DataState feed={feed} compact emptyText="No stories right now.">{(items) => <>
        <a href={items[0].url} target="_blank" rel="noopener noreferrer nofollow" className="clamp2" style={{ color: 'var(--text)', textDecoration: 'none' }}>{items[0].title}</a>
        <span className="small muted">{items[0].source} · {relativeTime(items[0].publishedAt)}</span>
        <ul className="mini-list">{items.slice(1, 3).map((i) => <li key={i.id}><span>{i.title}</span></li>)}</ul></>}</DataState>
    </WidgetShell>
  );
}

export function FootballWidget(props) {
  const range = dateRange('week');
  const feed = useLiveDataRefresh('football:ALL:week:', () => getFootballMatches({ competition: 'ALL', ...range }), { interval: REFRESH.football.base, liveInterval: REFRESH.football.live, isLive: (d) => d.some(isMatchLive) });
  return (
    <WidgetShell emoji="⚽" title="Football" feed={feed} to="/football" {...props}>
      <DataState feed={feed} compact emptyText="No top-league matches this week.">{(ms) => {
        const list = [...ms.filter(isMatchLive), ...ms.filter((m) => !isMatchLive(m) && new Date(m.utcDate) > new Date())].slice(0, 3);
        return list.length ? <ul className="mini-list">{list.map((m) => <li key={m.id}><span>{m.home.short || m.home.name} v {m.away.short || m.away.name}</span>
          <span className="muted">{isMatchLive(m) ? `${m.score.home ?? 0}–${m.score.away ?? 0} ${matchStatus(m).label}` : formatLocalTime(m.utcDate)}</span></li>)}</ul>
          : <p className="small muted" style={{ margin: 0 }}>No upcoming matches this week.</p>;
      }}</DataState>
    </WidgetShell>
  );
}

export function CricketWidget(props) {
  const feed = useLiveDataRefresh('cricket:current', getCricketMatches, { interval: REFRESH.cricket.base, liveInterval: REFRESH.cricket.live, isLive: (d) => d.some(isCricketLive) });
  return (
    <WidgetShell emoji="🏏" title="Cricket" feed={feed} to="/cricket" {...props}>
      <DataState feed={feed} compact title="Live score temporarily unavailable." emptyText="No matches right now.">{(ms) => {
        const m = ms.find(isCricketLive) || ms.find((x) => !x.started) || ms[0];
        const last = m.score[m.score.length - 1];
        return <>
          <p className="clamp2">{m.teams.join(' v ') || m.name}</p>
          {last ? <span className="widget-value" style={{ fontSize: 'var(--fs-xl)' }}>{last.r}/{last.w} <span className="small muted">({last.o} ov)</span></span> : null}
          <span className="small muted">{isCricketLive(m) ? 'Live · ' : ''}{m.status}</span></>;
      }}</DataState>
    </WidgetShell>
  );
}

export function GoldWidget(props) {
  const feed = useLiveDataRefresh('gold', getMetals, { interval: REFRESH.gold.base });
  return (
    <WidgetShell emoji="💰" title="Gold" feed={feed} to="/gold" {...props}>
      <DataState feed={feed} compact>{(d) => (d.nepal?.fineGoldTola ? <>
        <span className="widget-value">Rs {d.nepal.fineGoldTola.toLocaleString()}</span>
        <span className="small">Fine gold per tola</span>
        {d.nepal.silverTola && <span className="small muted">Silver Rs {d.nepal.silverTola.toLocaleString()} / tola</span>}</>
        : <p className="small muted" style={{ margin: 0 }}>Nepal rate currently unavailable.</p>)}</DataState>
      <span className="src-note">Market data may be delayed.</span>
    </WidgetShell>
  );
}

export function CryptoWidget(props) {
  const feed = useLiveDataRefresh('crypto:markets', getMarkets, { interval: REFRESH.crypto.base });
  return (
    <WidgetShell emoji="₿" title="Crypto" feed={feed} to="/crypto" {...props}>
      <DataState feed={feed} compact>{(coins) => <ul className="mini-list">
        {coins.slice(0, 4).map((c) => <li key={c.id}><span>{c.symbol} {formatUsd(c.price)}</span><Delta percent={c.change24h} /></li>)}</ul>}</DataState>
    </WidgetShell>
  );
}

export function NepseWidget(props) {
  const feed = useLiveDataRefresh('nepse', getNepse, { interval: REFRESH.nepse.base, liveInterval: REFRESH.nepse.live, isLive: () => isNepseSession() });
  return (
    <WidgetShell emoji="📈" title="NEPSE" feed={feed} to="/nepse" {...props}>
      <DataState feed={feed} compact>{(d) => <>
        <span className="widget-value">{d.index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        <Delta value={d.index.change} percent={d.index.percentChange} />
        <span className="small muted">{isNepseSession() ? 'Regular trading hours' : 'Outside regular trading hours'}</span></>}</DataState>
    </WidgetShell>
  );
}

export function DateWidget(props) {
  const now = useNow(60_000);
  let bs = null;
  try { bs = adToBs(now.getFullYear(), now.getMonth() + 1, now.getDate()); } catch { bs = null; }
  return (
    <WidgetShell emoji="📅" title="Date" to="/tools/calendar" linkLabel="Calendar" {...props}>
      <span className="widget-value">{now.getDate()} {AD_MONTHS[now.getMonth()]}</span>
      <span className="small">{WEEKDAYS[now.getDay()]}, {now.getFullYear()} AD</span>
      {bs && <span className="small muted np">{BS_MONTHS[bs.month - 1]} {bs.day}, {bs.year} BS</span>}
    </WidgetShell>
  );
}

const CLOCKS = [['Kathmandu', 'Asia/Kathmandu'], ['London', 'Europe/London'], ['New York', 'America/New_York'], ['Sydney', 'Australia/Sydney']];
export function ClockWidget(props) {
  const now = useNow(1000);
  return (
    <WidgetShell emoji="🕐" title="World Time" to="/tools/world-clock" linkLabel="World clock" {...props}>
      <ul className="mini-list">{CLOCKS.map(([n, tz]) => <li key={tz}><span>{n}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatZonedTime(now, tz, false).slice(0, 5)}</span></li>)}</ul>
    </WidgetShell>
  );
}

export function StreakWidget({ kind, ...props }) {
  const { state, derived } = useProgress();
  const typingDays = new Set(state.typingResults.map((r) => r.date?.slice(0, 10))).size;
  return kind === 'typing' ? (
    <WidgetShell emoji="⌨️" title="Typing streak" to="/typing" linkLabel="Practise" {...props}>
      <span className="widget-value">{derived.bestWpm ? `${derived.bestWpm} WPM` : '—'}</span>
      <span className="small">Best speed · {state.typingResults.length} tests on {typingDays} day{typingDays === 1 ? '' : 's'}</span>
    </WidgetShell>
  ) : (
    <WidgetShell emoji="🔥" title="Learning streak" to="/courses" linkLabel="Keep going" {...props}>
      <span className="widget-value">{derived.streak} day{derived.streak === 1 ? '' : 's'}</span>
      <span className="small">{derived.lessonsCompleted} lessons · {state.xp} XP</span>
    </WidgetShell>
  );
}

export function RecommendedNotesWidget(props) {
  const recent = readStorage('notes:recentSubjects', []);
  const last = recent[0] && getProgram(recent[0].p);
  let picks = [];
  if (last) {
    const sems = programSemesters(last);
    const cur = sems.find((s) => s.subjects.some((x) => x.id === recent[0].s));
    picks = (cur ? cur.subjects : sems[0].subjects).filter((x) => !recent.some((r) => r.s === x.id)).slice(0, 3).map((x) => ({ to: `/notes/${last.id}/${x.id}`, title: x.title }));
  }
  if (!picks.length) picks = ['dbms', 'networks', 'dsa'].map((id) => ({ to: `/notes/csit/${id}`, title: getSubject(id).title }));
  return (
    <WidgetShell emoji="📚" title="Recommended notes" to={last ? `/notes/${last.id}` : '/notes/csit'} linkLabel="All notes" {...props}>
      <ul className="mini-list">{picks.map((p) => <li key={p.to}><Link to={p.to}>{p.title}</Link></li>)}</ul>
      <span className="src-note">{last ? `Based on your ${last.name} reading.` : 'Popular starting points.'}</span>
    </WidgetShell>
  );
}


/** Dashboard registry (id → component). Order here is the default order. */
export const DASHBOARD_WIDGETS = [
  { id: 'date', label: 'Today\'s date', C: DateWidget },
  { id: 'weather', label: 'Weather', C: WeatherWidget },
  { id: 'typing', label: 'Typing streak', C: (p) => <StreakWidget kind="typing" {...p} /> },
  { id: 'learning', label: 'Learning streak', C: (p) => <StreakWidget kind="learning" {...p} /> },
  { id: 'news', label: 'Latest news', C: NewsWidget },
  { id: 'football', label: 'Upcoming football', C: FootballWidget },
  { id: 'cricket', label: 'Cricket', C: CricketWidget },
  { id: 'nepse', label: 'NEPSE summary', C: NepseWidget },
  { id: 'gold', label: 'Gold price', C: GoldWidget },
  { id: 'crypto', label: 'Crypto summary', C: CryptoWidget },
  { id: 'notes', label: 'Recommended notes', C: RecommendedNotesWidget },
  { id: 'clock', label: 'World time', C: ClockWidget },
];
