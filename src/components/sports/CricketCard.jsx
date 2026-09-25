import Team from './Team';
import { chaseInfo, isCricketLive, runRate } from '../../services/cricketService';
import { formatLocalDateTime } from '../../services/timezoneService';

/** A cricket match exactly as the provider reports it; derived figures are labelled as calculated. */
export default function CricketCard({ m, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const live = isCricketLive(m);
  const chase = live ? chaseInfo(m) : null;
  const logo = (name) => m.teamInfo.find((t) => t.name === name)?.img;
  return (
    <article className="card cric-card">
      <div className="row-between">
        <span className={`status-pill ${live ? 'live' : m.ended ? 'done' : ''}`}>{live && <span className="live-dot" aria-hidden="true" />}{live ? 'Live' : m.ended ? 'Completed' : 'Upcoming'}</span>
        <span className="chip">{m.matchType ? m.matchType.toUpperCase() : 'Match'}</span>
      </div>
      <H style={{ fontSize: 'var(--fs-md)', margin: 0 }}>{m.name}</H>
      <div className="row" style={{ gap: 12 }}>{m.teams.map((t) => <Team key={t} name={t} logo={logo(t)} />)}</div>
      {m.score.length > 0 && (
        <div style={{ display: 'grid', gap: 6 }}>
          {m.score.map((s) => {
            const rr = runRate(s.r, s.o);
            return (
              <div key={s.inning} className="inn">
                <span>{s.inning}</span>
                <span className="score">{s.r ?? '—'}/{s.w ?? '—'} <small>{s.o == null ? '' : `${s.o} ov`}</small></span>
                {rr != null && <small style={{ gridColumn: '1 / -1' }}>Run rate {rr.toFixed(2)} (calculated)</small>}
              </div>
            );
          })}
        </div>
      )}
      {chase?.rrr != null && (
        <p className="small" style={{ margin: 0 }}>Target {chase.target} · need {chase.need} from {chase.ballsLeft} balls · required rate {chase.rrr.toFixed(2)} <span className="muted">(calculated)</span></p>
      )}
      {m.status && <p className="status-line">{m.status}</p>}
      <p className="src-note">{[m.venue, m.startsAt && formatLocalDateTime(m.startsAt)].filter(Boolean).join(' · ')}</p>
      {m.tossWinner && <p className="src-note">Toss: {m.tossWinner}{m.tossChoice ? ` chose to ${m.tossChoice}` : ''}</p>}
    </article>
  );
}
