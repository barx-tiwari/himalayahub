import { useState } from 'react';
import { Link } from 'react-router-dom';
import SmartImage from '../media/SmartImage';
import { EXPERIENCES, getProvince } from '../../data/nepalPlaces';
import { useDestinations } from '../../context/DestinationsContext';

import { describe } from '../../services/weatherService';

function matches(exp, d, w) {
  if (exp.id === 'sunny') return Boolean(w) && [0, 1, 2].includes(w.days[0]?.code) && (w.days[0]?.rainChance ?? 100) < 40;
  if (exp.id === 'cool') return w ? (w.days[0]?.max ?? 99) <= 20 : d.tags.includes('cool');
  return d.tags.includes(exp.id);
}

/** "Where should you go today?" — experience chips filter the real destination data. */
export default function WhereToGoFinder({ feed }) {
  const [sel, setSel] = useState(null);
  const { destinations, featured } = useDestinations();
  const exp = EXPERIENCES.find((e) => e.id === sel);
  const all = feed.data || {};
  const needsLive = exp?.live && exp.id === 'sunny' && feed.status !== 'success';
  const list = exp ? destinations.filter((d) => matches(exp, d, all[d.id])) : featured.slice(0, 5);
  return (
    <div className="finder">
      <div className="chip-tabs finder-chips" role="group" aria-label="Kind of experience">
        {EXPERIENCES.map((e) => (
          <button key={e.id} type="button" aria-pressed={sel === e.id} onClick={() => setSel((s) => (s === e.id ? null : e.id))}>
            <span aria-hidden="true">{e.emoji}</span> {e.label}
          </button>
        ))}
      </div>
      <p className="finder-status" aria-live="polite">
        {!exp ? 'Popular picks — choose an experience to narrow them down.'
          : needsLive ? (feed.status === 'loading' ? 'Checking today’s forecast…' : 'The live forecast is unavailable, so sunny places can’t be picked right now.')
            : `${list.length} ${list.length === 1 ? 'place' : 'places'} for “${exp.label}”${exp.live ? ' based on today’s forecast' : ''}.`}
      </p>
      {!needsLive && (list.length ? (
        <ul className="finder-list">
          {list.map((d) => {
            const w = all[d.id]; const c = w && describe(w.days[0]?.code);
            return (
              <li key={d.id}>
                <Link to={`/explore-nepal/${d.id}`} className="finder-card">
                  <SmartImage photo={d.photos[0]} sizes="(min-width: 900px) 20vw, 60vw" />
                  <span className="finder-body">
                    <strong>{d.name}</strong>
                    <span className="small">{getProvince(d.province)?.name}</span>
                    {w && <span className="small">{c.emoji} {Math.round(w.days[0].max)}° · rain {w.days[0].rainChance ?? '—'}%</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : <p className="muted">No destination matches that today. Try another experience.</p>)}
      <p className="src-note">Suggestions use today’s model forecast and general destination info. Always check local conditions before travelling. <Link to="/where-to-go">See every place ranked by weather</Link>.</p>
    </div>
  );
}
