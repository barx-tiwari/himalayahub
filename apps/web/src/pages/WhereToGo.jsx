import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CloudRain, Info } from 'lucide-react';
import Segmented from '../components/ui/Segmented';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import Skeleton from '../components/live/Skeleton';
import Disclaimer, { WEATHER_DISCLAIMER } from '../components/live/Disclaimer';
import { useDestinationsWeather } from '../hooks/useDestinationsWeather';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { describe, OFFICIAL_WEATHER, travelAdvice } from '../services/weatherService';
import { getProvince } from '../data/nepalPlaces';
import { useDestinations } from '../context/DestinationsContext';


const ICON = { good: CheckCircle2, caution: CloudRain, warn: AlertTriangle, info: Info };
const LEVEL = { good: 'Suitable', caution: 'Some concerns', warn: 'May affect travel', info: 'Check conditions' };

export function AdviceList({ advice }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {advice.messages.map((m, i) => {
        const lvl = m.startsWith('This is a trekking') ? 'info' : i === 0 ? advice.level : advice.level === 'good' ? 'info' : advice.level;
        const I = ICON[lvl];
        return <p key={m} className={`advice ${lvl}`} style={{ margin: 0 }}><I aria-hidden="true" /><span>{m}</span></p>;
      })}
    </div>
  );
}

export { useDestinationsWeather };

export default function WhereToGo() {
  useDocumentTitle('Where Should I Go?');
  const [day, setDay] = useState(0);
  const feed = useDestinationsWeather();
  const { destinations } = useDestinations();
  return (
    <div className="container page" data-domain="nepal">
      <header className="page-header">
        <h1>Where Should I Go?</h1>
        <p>Popular destinations ranked by today&apos;s or tomorrow&apos;s forecast — rain probability and amount, temperature, wind, visibility and storms. It&apos;s a starting point, not a safety guarantee.</p>
      </header>
      <div className="row-between" style={{ marginBottom: 12 }}>
        <Segmented options={[{ id: 0, label: 'Today' }, { id: 1, label: 'Tomorrow' }]} value={day} onChange={setDay} label="Day" />
      </div>
      <LiveDataRefresh feed={feed} sourceLabel="Weather provider" />
      <div style={{ marginTop: 12 }}>
        <DataState feed={feed} skeleton={<Skeleton cards={6} label="Loading forecasts" />}>
          {(all) => {
            const ranked = destinations.filter((d) => all[d.id]).map((d) => ({ d, w: all[d.id], a: travelAdvice(all[d.id], d, day) }))
              .sort((x, y) => (y.a.score ?? 0) - (x.a.score ?? 0));
            return (
              <ol className="dest-grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {ranked.map(({ d, w, a }) => {
                  const f = w.days[day]; const x = describe(f?.code);
                  return (
                    <li key={d.id} className="card dest-card">
                      <div className="dest-top">
                        <div><h2 style={{ fontSize: 'var(--fs-lg)' }}>{d.emoji} {d.name}</h2><span className="small muted">{getProvince(d.province)?.name}</span></div>
                        <div className="wx-mini"><b>{Number.isFinite(f?.max) ? `${Math.round(f.max)}°` : '—'}</b><span className="small">{x.emoji} {x.label}</span></div>
                      </div>
                      <div className="row" style={{ gap: 8 }}><span className={`chip ${a.level === 'good' ? 'chip-success' : a.level === 'warn' ? 'chip-accent' : 'chip-warning'}`}>{LEVEL[a.level]}</span>
                        <span className="small muted">Rain {Number.isFinite(f?.rainChance) ? `${f.rainChance}%` : '—'} · Wind {Number.isFinite(f?.windMax) ? `${Math.round(f.windMax)} km/h` : '—'}</span></div>
                      <div className="suit-meter" role="img" aria-label={`Weather suitability ${a.score} out of 100`}><span style={{ width: `${a.score}%` }} /></div>
                      <AdviceList advice={a} />
                      <div className="row" style={{ gap: 8 }}><Link to={`/explore-nepal/${d.id}`} className="btn btn-secondary btn-sm">About {d.name}</Link><Link to={`/weather/${d.id}`} className="btn btn-ghost btn-sm">Full forecast</Link></div>
                    </li>
                  );
                })}
              </ol>
            );
          }}
        </DataState>
      </div>
      <Disclaimer className="section">{WEATHER_DISCLAIMER} For trekking and mountain areas, always check <a href={OFFICIAL_WEATHER.url} target="_blank" rel="noopener noreferrer">{OFFICIAL_WEATHER.label}</a> and local safety information.</Disclaimer>
    </div>
  );
}
