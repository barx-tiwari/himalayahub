import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import Segmented from '../components/ui/Segmented';
import MatchList from '../components/sports/MatchList';
import StandingsTable from '../components/sports/StandingsTable';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { dateRange, getFootballMatches, getStandings, isMatchLive } from '../services/sportsService';
import { REFRESH } from '../services/config';
import { userZoneLabel } from '../services/timezoneService';
import { getLeague, scheduleLeagues, footballLeagues } from '../data/sportsConfig';

const WHEN = [{ id: 'today', label: 'Today' }, { id: 'tomorrow', label: 'Tomorrow' }, { id: 'week', label: 'This week' }, { id: 'recent', label: 'Recent results' }, { id: 'date', label: 'Pick a date' }];

function Standings({ code }) {
  const feed = useLiveDataRefresh(`football:standings:${code}`, () => getStandings(code), { interval: 30 * 60_000 });
  const league = getLeague(code);
  return (
    <section className="card section" aria-labelledby="table-title">
      <div className="row-between"><h2 id="table-title" className="card-title">{league?.name} table</h2></div>
      <LiveDataRefresh feed={feed} compact />
      <div style={{ marginTop: 12 }}>
        <DataState feed={feed} emptyText="No league table is available for this competition (cup stages may not have one).">
          {(rows) => <StandingsTable rows={rows} caption={`${league?.name} standings`} />}
        </DataState>
      </div>
    </section>
  );
}

export default function Football() {
  useDocumentTitle('Football Schedule');
  const [params, setParams] = useSearchParams();
  const league = params.get('league') || 'ALL';
  const when = WHEN.some((w) => w.id === params.get('when')) ? params.get('when') : 'today';
  const date = params.get('date') || new Date().toISOString().slice(0, 10);
  const team = params.get('team') || '';
  const set = (k, v) => { const n = new URLSearchParams(params); if (!v || v === 'ALL') n.delete(k); else n.set(k, v); setParams(n, { replace: true }); };

  const range = dateRange(when, date);
  const key = `football:${league}:${when}:${when === 'date' ? date : ''}`;
  const feed = useLiveDataRefresh(key, () => getFootballMatches({ competition: league, ...range }), {
    interval: REFRESH.football.base, liveInterval: REFRESH.football.live, isLive: (d) => d.some(isMatchLive),
  });
  const filter = (list) => {
    const q = team.trim().toLowerCase();
    const out = q ? list.filter((m) => `${m.home.name} ${m.away.name} ${m.home.short} ${m.away.short}`.toLowerCase().includes(q)) : list;
    return [...out].sort((a, b) => (when === 'recent' ? b.utcDate.localeCompare(a.utcDate) : a.utcDate.localeCompare(b.utcDate)));
  };

  return (
    <div className="container page" data-domain="sports">
      <header className="page-header">
        <h1>Football Schedule</h1>
        <p>Fixtures, live matches and results for Europe&apos;s top leagues. All kick-off times are in your time zone ({userZoneLabel()}).</p>
      </header>
      <div className="toolbar">
        <div className="field">
          <label htmlFor="fb-league">League</label>
          <select id="fb-league" className="select" value={league} onChange={(e) => set('league', e.target.value)}>
            <option value="ALL">All leagues</option>
            {footballLeagues.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fb-team">Team</label>
          <SearchBar id="fb-team" value={team} onChange={(v) => set('team', v)} label="Filter by team" placeholder="e.g. Arsenal" />
        </div>
        {when === 'date' && (
          <div className="field">
            <label htmlFor="fb-date">Date</label>
            <input id="fb-date" type="date" className="input" value={date} onChange={(e) => set('date', e.target.value)} />
          </div>
        )}
      </div>
      <Segmented options={WHEN} value={when} onChange={(v) => set('when', v === 'today' ? '' : v)} label="Date range" />
      {getLeague(league)?.note && <p className="src-note" style={{ marginTop: 8 }}>{getLeague(league).note}</p>}
      <section className="card section" aria-labelledby="fx-title" style={{ marginTop: 16 }}>
        <h2 id="fx-title" className="card-title">{WHEN.find((w) => w.id === when).label} · {league === 'ALL' ? scheduleLeagues.map((l) => l.name).join(', ') : getLeague(league)?.name}</h2>
        <LiveDataRefresh feed={feed} />
        <div style={{ marginTop: 12 }}>
          <DataState feed={feed} emptyText={team ? `No matches for “${team}” in this range.` : 'No matches in this range. Try This week.'}>
            {(matches) => {
              const list = filter(matches);
              return list.length ? <MatchList matches={list} showCompetition={league === 'ALL'} /> : <p className="muted small" style={{ margin: 0 }}>No matches for “{team}” in this range.</p>;
            }}
          </DataState>
        </div>
      </section>
      {league !== 'ALL' && <Standings code={league} />}
    </div>
  );
}
