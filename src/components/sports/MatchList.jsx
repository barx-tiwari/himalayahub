import Team from './Team';
import { matchStatus } from '../../services/sportsService';
import { formatLocalDate, formatLocalTime } from '../../services/timezoneService';

function Score({ m }) {
  if (m.score.home == null || m.score.away == null) return <span className="muted">vs</span>;
  return <span className="score">{m.score.home} – {m.score.away}</span>;
}
function Status({ m }) {
  const s = matchStatus(m);
  return <span className={`status-pill ${s.tone}`}>{s.tone === 'live' && <span className="live-dot" aria-hidden="true" />}{s.label}</span>;
}

/** Football fixtures/results: a table on wide screens, cards on phones. */
export default function MatchList({ matches, showCompetition = true }) {
  return (
    <>
      <div className="table-wrap match-table-wrap">
        <table className="table match-table">
          <caption className="sr-only">Football matches</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Home team</th><th scope="col" className="col-score">Score</th><th scope="col">Away team</th>{showCompetition && <th scope="col">Competition</th>}<th scope="col">Status</th></tr></thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{formatLocalDate(m.utcDate)}</td>
                <td>{formatLocalTime(m.utcDate)}</td>
                <td><Team name={m.home.name} logo={m.home.crest} /></td>
                <td className="col-score"><Score m={m} /></td>
                <td><Team name={m.away.name} logo={m.away.crest} /></td>
                {showCompetition && <td>{m.competition.name}</td>}
                <td><Status m={m} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="match-cards" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {matches.map((m) => (
          <li key={m.id} className="match-card">
            <div className="when"><span>{formatLocalDate(m.utcDate)} · {formatLocalTime(m.utcDate)}</span>{showCompetition && <span>{m.competition.name}</span>}</div>
            <div className="teams">
              <Team name={m.home.name} logo={m.home.crest} /><span className="score">{m.score.home ?? ''}</span>
              <Team name={m.away.name} logo={m.away.crest} /><span className="score">{m.score.away ?? ''}</span>
            </div>
            <div><Status m={m} /></div>
          </li>
        ))}
      </ul>
    </>
  );
}
