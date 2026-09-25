import Team from './Team';

export default function StandingsTable({ rows, caption }) {
  return (
    <div className="table-wrap">
      <table className="table standings">
        <caption className="sr-only">{caption}</caption>
        <thead><tr><th scope="col">#</th><th scope="col">Team</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GD</th><th scope="col">Pts</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.position}-${r.team.name}`}>
              <td>{r.position}</td><td><Team name={r.team.name} logo={r.team.crest} /></td>
              <td>{r.played ?? '—'}</td><td>{r.won ?? '—'}</td><td>{r.draw ?? '—'}</td><td>{r.lost ?? '—'}</td>
              <td>{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff ?? '—'}</td><td className="pts">{r.points ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
