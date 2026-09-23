import CricketCard from '../components/sports/CricketCard';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNow } from '../hooks/useNow';
import { chaseInfo, getNpl, runRate } from '../services/cricketService';
import { REFRESH } from '../services/config';
import { formatLocalDate, formatLocalTime, userZoneLabel } from '../services/timezoneService';

function Countdown({ to }) {
  const now = useNow(1000);
  const ms = new Date(to).getTime() - now.getTime();
  if (!(ms > 0)) return <p className="small muted">Scheduled start time has passed. Waiting for the provider to report the match as live.</p>;
  const parts = [['days', 86_400_000], ['hours', 3_600_000], ['minutes', 60_000], ['seconds', 1000]];
  let rest = ms;
  return (
    <div className="countdown" role="timer" aria-live="off">
      {parts.map(([label, size]) => { const v = Math.floor(rest / size); rest -= v * size; return <div key={label}><b>{v}</b><span>{label}</span></div>; })}
    </div>
  );
}

function LiveMatch({ m }) {
  const last = m.score[m.score.length - 1];
  const chase = chaseInfo(m);
  return (
    <section className="card npl-live" aria-labelledby={`live-${m.id}`}>
      <div className="row-between"><span className="status-pill live"><span className="live-dot" aria-hidden="true" />Live</span><span className="small muted">{m.venue}</span></div>
      <h2 id={`live-${m.id}`} style={{ margin: 0 }}>{m.teams.join(' vs ')}</h2>
      {last && <p style={{ margin: 0 }}>Batting now: <strong>{last.inning.replace(/\s+Inning.*$/i, '')}</strong></p>}
      <div className="npl-score">
        {last && <>
          <div className="stat"><span className="stat-label">Runs / wickets</span><span className="stat-value">{last.r ?? '—'}/{last.w ?? '—'}</span></div>
          <div className="stat"><span className="stat-label">Overs</span><span className="stat-value">{last.o ?? '—'}</span></div>
          <div className="stat"><span className="stat-label">Run rate (calculated)</span><span className="stat-value">{runRate(last.r, last.o)?.toFixed(2) ?? '—'}</span></div>
        </>}
        {chase && <>
          <div className="stat"><span className="stat-label">Target</span><span className="stat-value">{chase.target}</span></div>
          <div className="stat"><span className="stat-label">Required rate (calculated)</span><span className="stat-value">{chase.rrr?.toFixed(2) ?? '—'}</span></div>
        </>}
      </div>
      {m.score.length > 1 && <p className="small muted" style={{ margin: 0 }}>{m.score.map((s) => `${s.inning}: ${s.r}/${s.w} (${s.o} ov)`).join(' · ')}</p>}
      {m.status && <p className="status-line" style={{ margin: 0, fontWeight: 700 }}>{m.status}</p>}
      <p className="src-note">{m.tossWinner ? `Toss: ${m.tossWinner}${m.tossChoice ? ` chose to ${m.tossChoice}` : ''}` : 'Toss information not provided.'}</p>
    </section>
  );
}

export default function NPL() {
  useDocumentTitle('Nepal Premier League');
  const feed = useLiveDataRefresh('cricket:npl', getNpl, {
    interval: REFRESH.cricket.base, liveInterval: REFRESH.cricket.live, isLive: (d) => d.live.length > 0,
  });
  return (
    <div className="container page" data-domain="sports">
      <header className="page-header">
        <h1>Nepal Premier League (NPL)</h1>
        <p>When an NPL match is live, the score appears here automatically. Between matches you&apos;ll see the next fixture. Times are in your time zone ({userZoneLabel()}).</p>
      </header>
      <LiveDataRefresh feed={feed} />
      <div style={{ marginTop: 16 }}>
        <DataState feed={feed} title="Live score temporarily unavailable." isEmpty={(d) => !d.series}
          emptyText="No Nepal Premier League season is listed by the data provider yet. This page will update automatically when the season appears.">
          {(d) => (
            <div className="stack">
              <p className="small muted" style={{ margin: 0 }}>Season: <strong>{d.series.name}</strong>{d.series.startDate ? ` (${d.series.startDate} – ${d.series.endDate || '?'})` : ''}</p>
              {d.live.map((m) => <LiveMatch key={m.id} m={m} />)}
              {!d.live.length && (d.upcoming[0] ? (
                <section className="card" aria-labelledby="next-title">
                  <h2 id="next-title" className="card-title">Next NPL Match</h2>
                  <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, margin: '0 0 4px' }}>{d.upcoming[0].teams.join(' vs ') || d.upcoming[0].name}</p>
                  <p className="muted" style={{ marginBottom: 12 }}>{formatLocalDate(d.upcoming[0].startsAt, { weekday: 'long', month: 'long', day: 'numeric' })} · {formatLocalTime(d.upcoming[0].startsAt)}{d.upcoming[0].venue ? ` · ${d.upcoming[0].venue}` : ''}</p>
                  {d.upcoming[0].startsAt && <Countdown to={d.upcoming[0].startsAt} />}
                </section>
              ) : <p className="muted">No upcoming NPL fixtures are listed right now.</p>)}
              {d.upcoming.length > (d.live.length ? 0 : 1) && (
                <section aria-label="Upcoming fixtures"><div className="section-title"><h2>Upcoming fixtures</h2></div>
                  <div className="cric-grid">{d.upcoming.slice(d.live.length ? 0 : 1, 7).map((m) => <CricketCard key={m.id} m={m} />)}</div></section>
              )}
              {d.completed.length > 0 && (
                <section aria-label="Results"><div className="section-title"><h2>Results</h2></div>
                  <div className="cric-grid">{d.completed.slice(0, 6).map((m) => <CricketCard key={m.id} m={m} />)}</div></section>
              )}
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
}
