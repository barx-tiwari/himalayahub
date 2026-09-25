import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, GraduationCap, Keyboard, ListChecks } from 'lucide-react';
import QuizCard from '../components/quiz/QuizCard';
import ProgressBar from '../components/ui/ProgressBar';
import SmartImage from '../components/media/SmartImage';
import DestinationCard from '../components/nepal/DestinationCard';
import WhereToGoFinder from '../components/nepal/WhereToGoFinder';
import Journey from '../components/nepal/Journey';
import NepalMap from '../components/nepal/NepalMap';
import NewsCard from '../components/news/NewsCard';
import DataState from '../components/live/DataState';
import Skeleton from '../components/live/Skeleton';
import AnimatedNumber from '../components/live/AnimatedNumber';
import Delta from '../components/live/Delta';
import { Sparkline } from '../components/live/Charts';
import { WhatsAppSection } from '../components/contact/WhatsApp';
import ContinueLearning from '../components/courses/ContinueLearning';
import { courseProgressPercent } from '../components/courses/CourseCard';
import { WeatherWidget, NewsWidget, NepseWidget, FootballWidget, CricketWidget, CryptoWidget, DateWidget } from '../components/widgets/LiveWidgets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useReveal, prefersReducedMotion } from '../hooks/useReveal';
import { useDestinationsWeather } from '../hooks/useDestinationsWeather';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useProgress } from '../context/ProgressContext';
import { BRAND } from '../data/site';
import { HERO_PHOTO } from '../data/nepalPlaces';
import { useDestinations } from '../context/DestinationsContext';
import { GemHero } from '../components/gems/GemParts';
import { useHiddenGems } from '../hooks/useHiddenGems';
import { toolLinks } from '../data/navigation';
import { quizQuestions } from '../data/quizQuestions';
import { notes } from '../data/notes';
import { subjects } from '../data/subjects';
import { typingLessons } from '../data/typingLessons';
import { courses } from '../data/courses';
import { programs, programSemesters } from '../data/programs';
import { nationalContacts } from '../data/emergencyContacts';
import { REFRESH } from '../services/config';
import { getNews } from '../services/newsService';
import { getMarkets, formatUsd } from '../services/cryptoService';
import { getRates } from '../services/currencyService';
import { describe } from '../services/weatherService';
import { Icon } from '../utils/icons';
import { dateKey } from '../utils/format';
import { seededRandom } from '../utils/random';

const WEATHER_SPOTS = [['kathmandu-valley', 'Kathmandu'], ['pokhara', 'Pokhara'], ['chitwan', 'Chitwan'], ['mustang', 'Mustang'], ['nagarkot', 'Nagarkot']];

/** Storytelling strip: the ten Hidden Gems of Eastern Nepal. */
function HiddenGemsSection() {
  const { gems } = useHiddenGems();
  // Lead with the highest-ranked gem that has a real photo; the rest keep their rank order.
  const lead = gems.find((g) => g.photos?.some((ph) => !ph.nearby)) || gems.find((g) => g.photos?.length) || gems[0];
  const rest = gems.filter((g) => g !== lead);
  if (!lead) return null;
  return (
    <Section id="gems" title="Hidden Gems of Eastern Nepal" lead="Sacred lakes, rhododendron ridges and trading villages few travellers ever reach." className="hs-gems"
      action={<More to="/hidden-gems">Explore all ten</More>}>
      <div className="gems-strip">
        <Link to={`/hidden-gems/${lead.slug}`} className="gems-lead" data-reveal>
          <GemHero gem={lead} />
          <div className="gems-lead-text"><span className="gem-rank">{lead.rank}</span><h3>{lead.name}</h3><p>{lead.tagline}</p><span className="small">{lead.district} · read the story →</span></div>
        </Link>
        <ol className="gems-mini">
          {rest.slice(0, 9).map((g) => (
            <li key={g.slug}><Link to={`/hidden-gems/${g.slug}`}>
              <span className="gems-thumb"><GemHero gem={g} /><span className="gem-rank">{g.rank}</span></span>
              <span><strong>{g.name}</strong><small>{g.district}</small></span></Link></li>
          ))}
        </ol>
      </div>
      <p className="small muted gems-cta">Itineraries for 3, 5, 7 and 14 days — for Nepali and international travellers. <Link to="/hidden-gems#gems-itin">Plan a trip</Link></p>
    </Section>
  );
}

function Section({ id, title, lead, children, action, className = '', tone }) {
  return (
    <section className={`hs ${className}`} aria-labelledby={`${id}-t`} data-tone={tone}>
      <div className="container">
        <header className="hs-head" data-reveal>
          <div><h2 id={`${id}-t`}>{title}</h2>{lead && <p>{lead}</p>}</div>
          {action}
        </header>
        {children}
      </div>
    </section>
  );
}
const More = ({ to, children }) => <Link to={to} className="hs-more">{children} <ArrowRight aria-hidden="true" /></Link>;

function Hero() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const yv = Math.min(window.scrollY, 900); ref.current?.style.setProperty('--py', String(yv)); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="home-hero" ref={ref} aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="false"><SmartImage photo={HERO_PHOTO} priority sizes="100vw" className="hero-img" /></div>
      <div className="hero-sky" aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      <span className="decor-cloud hero-cloud-a" aria-hidden="true" /><span className="decor-cloud hero-cloud-b" aria-hidden="true" /><span className="hero-hex" aria-hidden="true" />
      <svg className="hero-ridge r1" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true"><path d="M0 220 L0 150 L140 96 L260 132 L420 60 L560 118 L700 84 L860 140 L1010 70 L1180 126 L1320 92 L1440 120 L1440 220 Z" /></svg>
      <svg className="hero-ridge r2" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 160 L0 118 L180 90 L340 122 L520 84 L700 118 L880 92 L1060 126 L1240 96 L1440 116 L1440 160 Z" /></svg>
      <div className="container hero-content">
        <p className="hero-brand">{BRAND.wordmark}</p>
        <p className="hero-tagline">{BRAND.tagline}</p>
        <h1 id="hero-title">One place to learn, <span className="hero-accent">explore Nepal</span> and stay connected with the world.</h1>
        <p className="hero-desc">Explore beautiful destinations, learn technology, practice your skills, follow live news and sports, check weather and markets, and access useful everyday tools.</p>
        <div className="hero-actions">
          <Link to="/explore-nepal" className="btn btn-lg btn-hero">Explore Nepal <ArrowRight aria-hidden="true" /></Link>
          <Link to="/learn" className="btn btn-lg btn-hero-ghost">Start learning <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
      <p className="hero-credit">Mount Everest and Nuptse · <Link to="/image-credits">photo credit</Link></p>
    </section>
  );
}

function Ticker() {
  const feed = useLiveDataRefresh('news:latest', () => getNews('latest'), { interval: REFRESH.news.base });
  const items = Array.isArray(feed.data) ? feed.data.slice(0, 8) : [];
  if (!items.length) return null;
  const row = items.map((i) => <a key={i.id} href={i.url} target="_blank" rel="noopener noreferrer nofollow">{i.title} <small>{i.source}</small></a>);
  return (
    <div className="ticker" aria-label="Latest headlines">
      <span className="ticker-label">Headlines</span>
      <div className="ticker-track"><div className="ticker-run">{row}</div><div className="ticker-run" aria-hidden="true">{row}</div></div>
    </div>
  );
}

function DailyQuestion() {
  const { state, answerDaily } = useProgress();
  const today = dateKey();
  const question = useMemo(() => { const r = seededRandom(`daily-q-${today}`); return quizQuestions[Math.floor(r() * quizQuestions.length)]; }, [today]);
  const done = state.dailyQuestion?.date === today ? state.dailyQuestion : null;
  return (
    <div className="daily-q">
      <div className="row-between"><h3>Daily IT question</h3><span className="chip chip-primary">+10 XP</span></div>
      <QuizCard question={question} headingLevel={4} selected={done?.choice} revealed={Boolean(done)} onSelect={(i) => answerDaily(i, i === question.answer)} />
      {done && <p className="small muted" style={{ margin: '10px 0 0' }}>Come back tomorrow for a new question.</p>}
    </div>
  );
}

function MarketCrypto() {
  const feed = useLiveDataRefresh('crypto:markets', getMarkets, { interval: REFRESH.crypto.base });
  return (
    <article className="mkt-card">
      <h3><span aria-hidden="true">₿</span> Crypto</h3>
      <DataState feed={feed} compact>{(coins) => {
        const btc = coins[0];
        return <>
          <div className="mkt-value">{btc.symbol} {formatUsd(btc.price)}</div>
          <Delta percent={btc.change24h} />
          {btc.sparkline?.length > 2 && <div className="mkt-chart"><Sparkline values={btc.sparkline} width={220} height={48} label={`${btc.name} price over 7 days`} /></div>}
          <ul className="mini-list">{coins.slice(1, 3).map((c) => <li key={c.id}><span>{c.symbol} {formatUsd(c.price)}</span><Delta percent={c.change24h} /></li>)}</ul>
        </>;
      }}</DataState>
      <Link to="/crypto" className="hs-more small">View details <ArrowRight aria-hidden="true" /></Link>
    </article>
  );
}

function MarketCurrency() {
  const feed = useLiveDataRefresh('currency:USD', async () => { const r = await getRates('USD'); return { data: r, meta: r.source === 'live' ? { source: 'Exchange-rate API', dataAsOf: r.updatedAt } : { source: 'Sample rates', demo: true } }; }, { interval: 60 * 60_000 });
  return (
    <article className="mkt-card">
      <h3><span aria-hidden="true">💱</span> Currency</h3>
      <DataState feed={feed} compact isEmpty={() => false}>{(r) => <>
        <div className="mkt-value">1 USD = Rs {r.rates.NPR?.toFixed(2)}</div>
        <ul className="mini-list">{['INR', 'EUR', 'GBP'].filter((c) => r.rates[c]).map((c) => <li key={c}><span>1 {c}</span><span>Rs {(r.rates.NPR / r.rates[c]).toFixed(2)}</span></li>)}</ul>
        {r.source !== 'live' && <span className="src-note">Sample rates — connect a live API in settings for real rates.</span>}
      </>}</DataState>
      <Link to="/tools/currency" className="hs-more small">Currency converter <ArrowRight aria-hidden="true" /></Link>
    </article>
  );
}

export default function Home() {
  useDocumentTitle('');
  const rootRef = useRef(null);
  useReveal(rootRef, []);
  const { state, derived } = useProgress();
  const wx = useDestinationsWeather();
  const { destinations, featured } = useDestinations();
  // Featured destinations (set in the CMS) lead the mosaic; others top it up to six tiles.
  const discover = [...featured, ...destinations.filter((d) => !d.featured)].slice(0, 6);
  const news = useLiveDataRefresh('news:latest', () => getNews('latest'), { interval: REFRESH.news.base });
  const dailyBest = state.typingResults.filter((r) => r.daily && dateKey(new Date(r.date)) === dateKey()).reduce((m, r) => Math.max(m, r.wpm), 0);
  const tinProps = { linkLabel: 'View details →', className: 'tin-card' };

  return (
    <div className="home" ref={rootRef}>
      <Hero />

      <Section id="discover" title="Discover Nepal" lead="Places that make Nepal unforgettable." className="hs-discover"
        action={<More to="/explore-nepal">View all destinations</More>}>
        <div className="discover-grid">
          {discover.map((d, i) => {
            const id = d.id;
            return <div key={id} className={`dg-${i}`} data-reveal style={{ '--i': i }}>
              <DestinationCard d={d} weather={wx.data?.[id]} size={i === 0 ? 'xl' : 'md'} sizes={i === 0 ? '(min-width: 900px) 60vw, 100vw' : '(min-width: 900px) 30vw, (min-width: 640px) 50vw, 100vw'} />
            </div>;
          })}
        </div>
      </Section>

      <HiddenGemsSection />

      <Section id="today" title="Today in Nepal" lead="Weather, headlines, markets and matches — each card shows when it was last updated." className="hs-today" tone="panel">
        <Ticker />
        <div className="tin-grid">
          <WeatherWidget {...tinProps} /><NewsWidget {...tinProps} /><NepseWidget {...tinProps} />
          <FootballWidget {...tinProps} /><CricketWidget {...tinProps} /><CryptoWidget {...tinProps} /><DateWidget {...tinProps} />
        </div>
      </Section>

      <Section id="where" title="Where should you go today?" lead="Tell us what kind of experience you want." className="hs-where">
        <WhereToGoFinder feed={wx} />
      </Section>

      <Section id="journey" title="From the Himalayas to the Terai" lead="Nepal drops from over 8,000 m to under 100 m in roughly 150 km. Here is the journey, band by band." className="hs-journey">
        <Journey />
      </Section>

      <Section id="learn" title="Learn without limits" lead="Courses, typing practice, revision notes and quizzes — your progress is saved on this device." className="hs-learn" tone="panel">
        <div className="learn-tiles">
          {[
            { to: '/courses', icon: GraduationCap, n: courses.length, label: 'Guided courses', desc: 'Short lessons with practice and quizzes.' },
            { to: '/typing', icon: Keyboard, n: typingLessons.length, label: 'Typing lessons', desc: 'Touch typing from home row to symbols.' },
            { to: '/notes', icon: BookOpen, n: notes.length + subjects.length, label: 'Topics with notes', desc: 'IT notes plus CSIT, BCA, BIM and BBA subjects.' },
            { to: '/quizzes', icon: ListChecks, n: quizQuestions.length + subjects.reduce((s, x) => s + x.mcqs.length, 0), label: 'Practice questions', desc: 'Test yourself by topic.' },
          ].map((t, i) => (
            <Link key={t.to} to={t.to} className="learn-tile" data-reveal style={{ '--i': i }}>
              <t.icon aria-hidden="true" />
              <span className="learn-n"><AnimatedNumber value={t.n} /></span>
              <strong>{t.label}</strong>
              <span className="small">{t.desc}</span>
              <span className="learn-go" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <div className="course-strip">
          {courses.slice(0, 3).map((c) => {
            const pct = courseProgressPercent(c, state.courseProgress);
            return (
              <Link key={c.id} to={`/courses/${c.id}`} className="course-mini">
                <span className="icon-tile" style={{ background: c.color, color: '#fff' }}><Icon name={c.icon} /></span>
                <span className="course-mini-body"><strong>{c.title}</strong><span className="small muted">{c.difficulty} · {c.duration}</span>
                  <ProgressBar value={pct} label={pct ? `${pct}% complete` : 'Not started'} /></span>
                <ArrowRight className="course-arrow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
        <ContinueLearning limit={3} />
      </Section>

      <Section id="typing" title="How fast can you type?" lead="One 60-second text, the same for everyone today." className="hs-typing">
        <div className="typing-split">
          <div className="typing-panel" data-reveal>
            <p className="typing-sample" aria-hidden="true"><span className="t-done">Practice makes progress. Keep</span><span className="t-caret" /><span> your eyes on the screen and your fingers on the home row.</span></p>
            <div className="typing-stats">
              <div><span className="stat-label">Your best</span><span className="stat-value">{derived.bestWpm ? `${derived.bestWpm} WPM` : '—'}</span></div>
              <div><span className="stat-label">Today</span><span className="stat-value">{dailyBest ? `${dailyBest} WPM` : 'Not yet'}</span></div>
              <div><span className="stat-label">Accuracy</span><span className="stat-value">{derived.avgAccuracy != null ? `${derived.avgAccuracy}%` : '—'}</span></div>
            </div>
            <div className="row">
              <Link to="/typing?daily=1" className="btn btn-lg btn-hero">{dailyBest ? 'Beat your score' : 'Take today’s challenge'} <ArrowRight aria-hidden="true" /></Link>
              <Link to="/typing/lessons" className="btn btn-lg btn-secondary">Typing lessons</Link>
            </div>
          </div>
          <DailyQuestion />
        </div>
      </Section>

      <Section id="weather" title="Today’s weather" lead="Current conditions at popular places, with a travel suggestion." className="hs-weather" tone="panel"
        action={<More to="/weather">Full forecasts</More>}>
        <DataState feed={wx} skeleton={<Skeleton cards={5} label="Loading weather" />} isEmpty={() => false}>{(all) => (
          <div className="wx-row">
            {WEATHER_SPOTS.map(([id, label]) => {
              const w = all[id]; if (!w) return null;
              const c = describe(w.current.code, w.current.isDay);
              return (
                <Link key={id} to={`/explore-nepal/${id}`} className="wx-card">
                  <span className="wx-card-emoji" aria-hidden="true">{c.emoji}</span>
                  <strong>{label}</strong>
                  <span className="wx-card-temp">{Math.round(w.current.temp)}°C</span>
                  <span className="small">{c.label}</span>
                  <span className="small muted">Rain {w.current.rainChance ?? w.days[0]?.rainChance ?? '—'}% · {Math.round(w.days[0].max)}°/{Math.round(w.days[0].min)}°</span>
                </Link>
              );
            })}
          </div>
        )}</DataState>
        <p className="src-note" style={{ marginTop: 12 }}>Weather data by Open-Meteo.com. Forecasts change — check official local advisories before travelling.</p>
      </Section>

      <Section id="explore-map" title="Explore Nepal" lead="Pick a province to see places, cities, weather and emergency numbers." className="hs-map">
        <NepalMap feed={wx} />
      </Section>

      <Section id="news" title="What’s happening?" lead="Nepal and world headlines, linked to the original publishers." className="hs-news" tone="panel" action={<More to="/news">All news</More>}>
        <DataState feed={news} skeleton={<Skeleton cards={4} label="Loading news" />} emptyText="No stories right now.">{(items) => (
          <div className="home-news">
            <NewsCard item={items[0]} lead />
            <div className="home-news-side">{items.slice(1, 4).map((i) => <NewsCard key={i.id} item={i} />)}</div>
          </div>
        )}</DataState>
      </Section>

      <Section id="sports" title="Sports live" lead="Football fixtures, cricket scores and the Nepal Premier League." className="hs-sports" action={<More to="/sports">Sports center</More>}>
        <div className="sport-grid">
          <FootballWidget className="sport-card" linkLabel="All fixtures →" />
          <CricketWidget className="sport-card" linkLabel="Live cricket →" />
          <Link to="/npl" className="sport-card npl-tile">
            <span className="npl-badge" aria-hidden="true">🏏</span>
            <strong>Nepal Premier League</strong>
            <span className="small">Live score during matches, countdown to the next one.</span>
            <span className="hs-more small">Open NPL <ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </Section>

      <Section id="markets" title="Market pulse" lead="NEPSE, crypto and currency. May be delayed; not financial advice." className="hs-markets" tone="panel" action={<More to="/markets">Markets</More>}>
        <div className="mkt-grid">
          <NepseWidget className="mkt-card" linkLabel="View details →" />
          <MarketCrypto />
          <MarketCurrency />
        </div>
      </Section>

      <Section id="academic" title="Academic hub" lead="Semester-wise notes for Nepal’s popular IT and business programmes." className="hs-academic">
        <div className="acad-grid">
          {programs.map((p, i) => (
            <Link key={p.id} to={`/notes/${p.id}`} className="acad-card" data-reveal style={{ '--i': i }}>
              <strong>{p.name}</strong>
              <span className="small">{p.blurb}</span>
              <span className="small muted">{programSemesters(p).reduce((n, s) => n + s.subjects.length, 0)} subjects</span>
            </Link>
          ))}
          <Link to="/notes" className="acad-card" data-reveal style={{ '--i': programs.length }}>
            <strong>IT Notes</strong><span className="small">Exam-ready notes on networking, databases, programming and more.</span><span className="small muted">{notes.length} topics</span>
          </Link>
        </div>
      </Section>

      <Section id="tools" title="Useful tools" lead="Everyday utilities that work offline once loaded." className="hs-tools" tone="panel">
        <div className="tool-row">
          {toolLinks.map((t) => (
            <Link key={t.to} to={t.to} className="tool-tile"><Icon name={t.icon} /><strong>{t.label}</strong><span className="small">{t.desc}</span></Link>
          ))}
        </div>
      </Section>

      <Section id="sos" title="Nepal emergency help" lead="Tap a number to call. National short codes work across Nepal." className="hs-sos" action={<More to="/emergency">All emergency contacts</More>}>
        <div className="sos-grid">
          {['police', 'ambulance', 'fire', 'hello-sarkar'].map((id) => {
            const c = nationalContacts.find((x) => x.id === id);
            return c && (
              <a key={id} href={`tel:${c.number}`} className="sos-card">
                <span className="sos-num">{c.number}</span>
                <strong>{id === 'hello-sarkar' ? 'Government help' : c.service}</strong>
                <span className="small">{id === 'hello-sarkar' ? 'Hello Sarkar complaints line — not for emergencies.' : c.note}</span>
              </a>
            );
          })}
        </div>
      </Section>

      <WhatsAppSection />

      <section className="final-cta" aria-labelledby="cta-t">
        <div className="container final-inner">
          <h2 id="cta-t">{BRAND.name}</h2>
          <p className="final-tag">{BRAND.tagline}</p>
          <p>{BRAND.secondary}</p>
          <div className="hero-actions">
            <Link to="/explore-nepal" className="btn btn-lg btn-hero"><Compass aria-hidden="true" /> Explore Nepal</Link>
            <Link to="/learn" className="btn btn-lg btn-hero-ghost">Start learning <ArrowRight aria-hidden="true" /></Link>
          </div>
          {state.profile && <p className="small">Welcome back, {state.profile.name}. <Link to="/dashboard">Open your dashboard</Link>.</p>}
          <p className="src-note">{destinations.length} destinations · {courses.length} courses · live data with sources</p>
        </div>
      </section>
    </div>
  );
}
