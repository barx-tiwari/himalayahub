import { useState } from 'react';
import { Link } from 'react-router-dom';
import MatchList from '../components/sports/MatchList';
import CricketCard from '../components/sports/CricketCard';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { dateRange, getF1, getFootballMatches, isMatchLive } from '../services/sportsService';
import { getCricketMatches, isCricketLive } from '../services/cricketService';
import { getNews } from '../services/newsService';
import { REFRESH } from '../services/config';
import { formatLocalDateTime, relativeTime } from '../services/timezoneService';
import { sportsTabs } from '../data/sportsConfig';

const KEYWORDS = { basketball: /basketball|\bnba\b|euroleague/i, tennis: /tennis|wimbledon|atp|wta|grand slam|us open|french open|australian open/i, other: /olympic|athletics|golf|rugby|boxing|cycling|volleyball|kabaddi|hockey|swimming|badminton/i };

function F1Panel() {
  const feed = useLiveDataRefresh('f1', getF1, { interval: REFRESH.f1.base });
  return (
    <section className="card" aria-labelledby="f1-title">
      <h2 id="f1-title" className="card-title">Formula 1</h2>
      <LiveDataRefresh feed={feed} />
      <div style={{ marginTop: 12 }}>
        <DataState feed={feed} isEmpty={(d) => !d.next && !d.last && !d.standings.length}>
          {(d) => (
            <div className="grid grid-2">
              <div>
                {d.next && <><h3 style={{ fontSize: 'var(--fs-md)' }}>Next race</h3>
                  <p style={{ margin: 0 }}><strong>{d.next.name}</strong> (round {d.next.round})</p>
                  <p className="small muted">{d.next.circuit}, {d.next.locality}, {d.next.country}<br />{d.next.timeKnown ? formatLocalDateTime(d.next.startsAt) : `${d.next.startsAt?.slice(0, 10)} (time not announced)`}</p></>}
                {d.last && <><h3 style={{ fontSize: 'var(--fs-md)' }}>Last race: {d.last.name}</h3>
                  <ol className="small" style={{ paddingLeft: 18 }}>{d.last.results.slice(0, 5).map((r) => <li key={r.position}>{r.driver} <span className="muted">({r.team}) {r.status}</span></li>)}</ol></>}
              </div>
              {d.standings.length > 0 && (
                <div className="table-wrap"><table className="table"><caption className="sr-only">Drivers standings</caption>
                  <thead><tr><th scope="col">#</th><th scope="col">Driver</th><th scope="col">Team</th><th scope="col">Pts</th></tr></thead>
                  <tbody>{d.standings.map((r) => <tr key={r.position}><td>{r.position}</td><td>{r.driver}</td><td>{r.team}</td><td>{r.points}</td></tr>)}</tbody></table></div>
              )}
            </div>
          )}
        </DataState>
      </div>
    </section>
  );
}

function HeadlinesFor({ sport, label }) {
  const feed = useLiveDataRefresh('news:sports', () => getNews('sports'), { interval: REFRESH.news.base });
  return (
    <section className="card" aria-labelledby="sport-news">
      <h2 id="sport-news" className="card-title">{label} headlines</h2>
      <p className="small muted">Live scores for {label.toLowerCase()} aren&apos;t connected yet. These are the latest related headlines from our news sources.</p>
      <DataState feed={feed} compact>
        {(items) => {
          const list = items.filter((i) => KEYWORDS[sport].test(`${i.title} ${i.description}`));
          return list.length ? (
            <ul className="news-list">{list.slice(0, 8).map((it) => <li key={it.id}><a href={it.url} target="_blank" rel="noopener noreferrer nofollow"><span />
              <span>{it.title}<small>{it.source} · {relativeTime(it.publishedAt)}</small></span></a></li>)}</ul>
          ) : <p className="muted small" style={{ margin: 0 }}>No {label.toLowerCase()} stories in the current sports feed.</p>;
        }}
      </DataState>
    </section>
  );
}

function Overview() {
  const range = dateRange('today');
  const fb = useLiveDataRefresh('football:ALL:today:', () => getFootballMatches({ competition: 'ALL', ...range }), { interval: REFRESH.football.base, liveInterval: REFRESH.football.live, isLive: (d) => d.some(isMatchLive) });
  const cr = useLiveDataRefresh('cricket:current', getCricketMatches, { interval: REFRESH.cricket.base, liveInterval: REFRESH.cricket.live, isLive: (d) => d.some(isCricketLive) });
  return (
    <div className="stack">
      <section className="card" aria-labelledby="fb-today">
        <div className="row-between"><h2 id="fb-today" className="card-title">Football today</h2><Link to="/football" className="small">Full schedule</Link></div>
        <LiveDataRefresh feed={fb} compact />
        <div style={{ marginTop: 10 }}><DataState feed={fb} emptyText="No top-league matches today.">{(m) => <MatchList matches={m.slice(0, 8)} />}</DataState></div>
      </section>
      <section aria-labelledby="cr-now">
        <div className="section-title"><h2 id="cr-now">Cricket now</h2><Link to="/cricket" className="small">Cricket Center</Link></div>
        <DataState feed={cr} title="Live score temporarily unavailable." emptyText="No matches reported right now.">
          {(ms) => <div className="cric-grid">{[...ms.filter(isCricketLive), ...ms.filter((m) => !isCricketLive(m))].slice(0, 3).map((m) => <CricketCard key={m.id} m={m} />)}</div>}
        </DataState>
      </section>
      <F1Panel />
    </div>
  );
}

export default function Sports() {
  useDocumentTitle('Sports');
  const [tab, setTab] = useState('overview');
  return (
    <div className="container page" data-domain="sports">
      <header className="page-header">
        <h1>Sports Center</h1>
        <p>Football, cricket, the NPL and Formula 1 from dedicated sports-data providers. Scores are never estimated.</p>
      </header>
      <nav className="chip-tabs" aria-label="Sports" style={{ marginBottom: 16 }}>
        <button type="button" aria-pressed={tab === 'overview'} onClick={() => setTab('overview')}>Overview</button>
        {sportsTabs.map((t) => (t.to ? <Link key={t.id} to={t.to}>{t.label}</Link>
          : <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>))}
      </nav>
      {tab === 'overview' && <Overview />}
      {tab === 'f1' && <F1Panel />}
      {['basketball', 'tennis', 'other'].includes(tab) && <HeadlinesFor sport={tab} label={sportsTabs.find((t) => t.id === tab).label} />}
    </div>
  );
}
