import { useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import Segmented from '../ui/Segmented';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import { cities, defaultCityIds } from '../../data/cities';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useNow } from '../../hooks/useNow';
import { formatOffset, formatZonedDate, formatZonedTime, getOffsetMinutes, getZonedParts, isValidTimeZone } from '../../services/timezoneService';

export function AnalogClock({ hour, minute, second, label }) {
  const hA = ((hour % 12) + minute / 60) * 30;
  const mA = (minute + second / 60) * 6;
  const sA = second * 6;
  return (
    <svg className="analog" viewBox="0 0 100 100" role="img" aria-label={label}>
      <circle className="face" cx="50" cy="50" r="46" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} className="tick" x1="50" y1={i % 3 === 0 ? 8 : 10} x2="50" y2="14" strokeWidth={i % 3 === 0 ? 2.5 : 1.5} transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <line className="hand-h" x1="50" y1="50" x2="50" y2="28" strokeWidth="4" transform={`rotate(${hA} 50 50)`} />
      <line className="hand-m" x1="50" y1="50" x2="50" y2="18" strokeWidth="2.5" transform={`rotate(${mA} 50 50)`} />
      <line className="hand-s" x1="50" y1="56" x2="50" y2="15" strokeWidth="1.2" transform={`rotate(${sA} 50 50)`} />
      <circle className="hub" cx="50" cy="50" r="2.6" />
    </svg>
  );
}

function ClockCard({ city, now, hour12, analog, onRemove, localOffset }) {
  let parts; let time; let date; let offset;
  try {
    parts = getZonedParts(now, city.tz);
    time = formatZonedTime(now, city.tz, hour12);
    date = formatZonedDate(now, city.tz);
    offset = getOffsetMinutes(now, city.tz);
  } catch {
    return (
      <article className="card clock-card">
        <h3>{city.name}</h3>
        <Alert type="error"><p>Unable to load timezone information.</p></Alert>
        <button type="button" className="btn btn-ghost btn-icon btn-sm remove" onClick={onRemove} aria-label={`Remove ${city.name}`}><X aria-hidden="true" /></button>
      </article>
    );
  }
  const night = parts.hour < 6 || parts.hour >= 19;
  const [clock, ampm] = hour12 ? time.split(/\s/) : [time, ''];
  const diff = (offset - localOffset) / 60;
  const diffText = diff === 0 ? 'Same as your time' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)}h from you`;
  return (
    <article className={`card clock-card${night ? ' is-night' : ''}`} aria-label={`${city.name}, ${city.country}`}>
      <button type="button" className="btn btn-ghost btn-icon btn-sm remove" onClick={onRemove} aria-label={`Remove ${city.name}`}><X aria-hidden="true" /></button>
      <div>
        <h3>{city.name}</h3>
        <span className="small muted">{city.country}</span>
      </div>
      {analog && <AnalogClock hour={parts.hour} minute={parts.minute} second={parts.second} label={`Analog clock showing ${time}`} />}
      <div className="clock-time" aria-hidden={analog}>{clock}{ampm && <span className="ampm">{ampm}</span>}</div>
      <div className="small">{date} {night ? '🌙' : '☀️'}</div>
      <div className="row small muted" style={{ gap: 8 }}>
        <span className="chip">{formatOffset(offset)}</span><span>{diffText}</span>
      </div>
    </article>
  );
}

export default function WorldClock() {
  const now = useNow(1000);
  const [ids, setIds] = useLocalStorage('worldclock:cities', defaultCityIds);
  const [prefs, setPrefs] = useLocalStorage('worldclock:prefs', { hour12: true, analog: false });
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const supported = useMemo(() => (typeof Intl !== 'undefined' && isValidTimeZone('Asia/Kathmandu')), []);
  const shown = ids.map((id) => cities.find((c) => c.id === id)).filter(Boolean);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cities.filter((c) => !ids.includes(c.id) && `${c.name} ${c.country} ${c.tz}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query, ids]);
  const localOffset = -now.getTimezoneOffset();
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const add = (city) => { setIds((list) => [...list, city.id]); setQuery(''); setActive(0); inputRef.current?.focus(); };
  const onKey = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(suggestions.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter') { e.preventDefault(); add(suggestions[active] || suggestions[0]); }
    if (e.key === 'Escape') setQuery('');
  };

  if (!supported) return <Alert type="error"><p>Unable to load timezone information. Your browser does not support time zones.</p></Alert>;

  return (
    <div className="stack">
      <div className="card row-between">
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <label htmlFor="city-search" className="label">Add a city</label>
          <input id="city-search" ref={inputRef} className="input" style={{ marginTop: 6 }} placeholder="Search cities, e.g. Paris or Doha" value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onKey} autoComplete="off"
            role="combobox" aria-expanded={suggestions.length > 0} aria-controls="city-suggest" aria-autocomplete="list"
            aria-activedescendant={suggestions.length ? `city-opt-${active}` : undefined} />
          {suggestions.length > 0 && (
            <ul id="city-suggest" className="city-suggest" role="listbox">
              {suggestions.map((c, i) => (
                <li key={c.id} role="option" id={`city-opt-${i}`} aria-selected={i === active}>
                  <button type="button" tabIndex={-1} className={i === active ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => add(c)}>
                    <span><Plus size={14} aria-hidden="true" /> {c.name}, {c.country}</span>
                    <span className="small muted">{formatOffset(getOffsetMinutes(now, c.tz))}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && !suggestions.length && <p className="small muted" style={{ margin: '6px 0 0' }}>No more matching cities.</p>}
        </div>
        <div className="row">
          <Segmented label="Clock format" options={[{ id: '12', label: '12h' }, { id: '24', label: '24h' }]} value={prefs.hour12 ? '12' : '24'} onChange={(v) => setPrefs((p) => ({ ...p, hour12: v === '12' }))} />
          <Segmented label="Clock style" options={[{ id: 'digital', label: 'Digital' }, { id: 'analog', label: 'Analog' }]} value={prefs.analog ? 'analog' : 'digital'} onChange={(v) => setPrefs((p) => ({ ...p, analog: v === 'analog' }))} />
        </div>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Your time zone: {localTz} ({formatOffset(localOffset)}). Times use your browser's built-in IANA time zone data and update every second.</p>
      {shown.length ? (
        <div className="clock-grid">
          {shown.map((c) => (
            <ClockCard key={c.id} city={c} now={now} hour12={prefs.hour12} analog={prefs.analog} localOffset={localOffset}
              onRemove={() => setIds((list) => list.filter((x) => x !== c.id))} />
          ))}
        </div>
      ) : (
        <EmptyState title="No cities yet" action={<button type="button" className="btn btn-secondary" onClick={() => setIds(defaultCityIds)}><RotateCcw aria-hidden="true" /> Restore default cities</button>}>
          Search above to add a city.
        </EmptyState>
      )}
    </div>
  );
}
