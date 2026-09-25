import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import Segmented from '../components/ui/Segmented';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import Skeleton from '../components/live/Skeleton';
import Disclaimer, { WEATHER_DISCLAIMER } from '../components/live/Disclaimer';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { describe, getForecast, OFFICIAL_WEATHER, searchPlaces, travelAdvice } from '../services/weatherService';
import { REFRESH } from '../services/config';
import { readStorage, writeStorage } from '../utils/storage';
import { getCity, getProvince, provinces, weatherCities, slugify } from '../data/nepalPlaces';
import { useDestinations } from '../context/DestinationsContext';

import { AdviceList } from './WhereToGo';

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const dir = (deg) => (Number.isFinite(deg) ? DIRS[Math.round(deg / 45) % 8] : '');
const hm = (s) => (s ? s.slice(11, 16) : '—');
const r0 = (v, u = '') => (Number.isFinite(v) ? `${Math.round(v)}${u}` : '—');
const dayName = (date, i) => (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }));

/** Resolve /weather/:location — a preset city, a destination, or a searched place passed via query. */
function useLocation() {
  const { location } = useParams();
  const { getDestination } = useDestinations();
  const [q] = useSearchParams();
  return useMemo(() => {
    const saved = readStorage('weather:last', null);
    const id = location || saved?.id || 'kathmandu';
    const city = getCity(id) || getDestination(id);
    if (city) return { id, name: city.name, lat: city.lat, lon: city.lon, province: city.province, district: city.district };
    const lat = Number(q.get('lat')); const lon = Number(q.get('lon'));
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat > 26 && lat < 31 && lon > 79 && lon < 89) return { id, name: q.get('name') || id, lat, lon, district: q.get('district') || '' };
    if (saved && saved.id === id) return saved;
    return null;
  }, [location, q, getDestination]);
}

function PlacePicker({ current }) {
  const navigate = useNavigate();
  const { getDestination } = useDestinations();
  const [province, setProvince] = useState(current?.province || '');
  const [district, setDistrict] = useState(current?.district || '');
  const [districtHits, setDistrictHits] = useState([]);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState([]);
  const [searchError, setSearchError] = useState('');
  const timer = useRef(null);

  const go = (p) => {
    const presets = getCity(p.id) || getDestination(p.id);
    if (presets) navigate(`/weather/${p.id}`);
    else navigate(`/weather/${slugify(p.name)}-${p.id.replace(/\D/g, '').slice(-6)}?lat=${p.lat}&lon=${p.lon}&name=${encodeURIComponent(p.name)}&district=${encodeURIComponent(p.district || '')}`);
    setQuery(''); setHits([]);
  };

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.trim().length < 2) { setHits([]); return undefined; }
    timer.current = setTimeout(async () => {
      try { setSearchError(''); setHits(await searchPlaces(query.trim())); } catch { setSearchError('Place search is unavailable right now.'); setHits([]); }
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  useEffect(() => {
    setDistrictHits([]);
    if (!district) return;
    if (weatherCities.some((c) => c.district === district)) return;
    searchPlaces(district).then((r) => setDistrictHits(r.slice(0, 6))).catch(() => setDistrictHits([]));
  }, [district]);

  const districts = province ? getProvince(province).districts : provinces.flatMap((p) => p.districts).sort();
  const cityOptions = [...weatherCities.filter((c) => (!province || c.province === province) && (!district || c.district === district)), ...districtHits];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div className="field"><label htmlFor="wx-prov">Province</label>
          <select id="wx-prov" className="select" value={province} onChange={(e) => { setProvince(e.target.value); setDistrict(''); }}>
            <option value="">All provinces</option>{provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label htmlFor="wx-dist">District</label>
          <select id="wx-dist" className="select" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">All districts</option>{districts.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
        <div className="field"><label htmlFor="wx-city">City</label>
          <select id="wx-city" className="select" value="" onChange={(e) => { const p = cityOptions.find((c) => c.id === e.target.value); if (p) go(p); }}>
            <option value="">{cityOptions.length ? 'Choose a city' : 'No preset city — search below'}</option>
            {cityOptions.map((c) => <option key={c.id} value={c.id}>{c.name}{c.district && !getCity(c.id) ? ` (${c.district})` : ''}</option>)}</select></div>
        <div className="field" style={{ position: 'relative', maxWidth: 320 }}>
          <label htmlFor="wx-search">Search any place in Nepal</label>
          <SearchBar id="wx-search" value={query} onChange={setQuery} label="Search a place in Nepal" placeholder="e.g. Tansen, Jomsom" />
          {hits.length > 0 && (
            <ul className="suggest-list" role="listbox" aria-label="Places">
              {hits.map((h) => <li key={h.id}><button type="button" onClick={() => go(h)}><span>{h.name}</span><span className="small muted">{[h.district, h.province].filter(Boolean).join(', ')}</span></button></li>)}
            </ul>
          )}
          {searchError && <span className="field-hint">{searchError}</span>}
        </div>
      </div>
      <div className="city-chips" aria-label="Quick picks">
        {weatherCities.map((c) => <Link key={c.id} to={`/weather/${c.id}`} className="chip" aria-current={current?.id === c.id ? 'page' : undefined}>{c.name}</Link>)}
      </div>
    </div>
  );
}

function DayDetail({ d, i }) {
  const w = describe(d.code);
  return (
    <div className="wx-details">
      <div className="stat"><span className="stat-label">{dayName(d.date, i)}</span><span className="stat-value">{w.emoji} {w.label}</span></div>
      <div className="stat"><span className="stat-label">High / low</span><span className="stat-value">{r0(d.max, '°')} / {r0(d.min, '°')}</span></div>
      <div className="stat"><span className="stat-label">Rain probability</span><span className="stat-value">{r0(d.rainChance, '%')}</span></div>
      <div className="stat"><span className="stat-label">Rainfall</span><span className="stat-value">{Number.isFinite(d.rainMm) ? `${d.rainMm.toFixed(1)} mm` : '—'}</span></div>
      <div className="stat"><span className="stat-label">Max wind</span><span className="stat-value">{r0(d.windMax, ' km/h')}</span></div>
      <div className="stat"><span className="stat-label">Max UV index</span><span className="stat-value">{Number.isFinite(d.uvMax) ? d.uvMax.toFixed(1) : '—'}</span></div>
      <div className="stat"><span className="stat-label">Sunrise / sunset (NPT)</span><span className="stat-value">{hm(d.sunrise)} / {hm(d.sunset)}</span></div>
    </div>
  );
}

export default function Weather() {
  const place = useLocation();
  useDocumentTitle(place ? `Weather in ${place.name}` : 'Nepal Weather');
  const [view, setView] = useState('today');
  const feed = useLiveDataRefresh(`weather:${place ? `${place.lat.toFixed(3)},${place.lon.toFixed(3)}` : 'none'}`, () => getForecast(place.lat, place.lon), { interval: REFRESH.weather.base, enabled: Boolean(place) });
  useEffect(() => { if (place) writeStorage('weather:last', place); }, [place]);
  const { getDestination } = useDestinations();
  const dest = place ? getDestination(place.id) : undefined;

  return (
    <div className="container page" data-domain="nepal">
      <header className="page-header">
        <h1>Nepal Weather</h1>
        <p>Current conditions and a 7-day forecast for any place in Nepal. Times are Nepal Standard Time.</p>
        <div className="header-actions"><Link to="/where-to-go" className="btn btn-secondary btn-sm">Where should I go?</Link><Link to="/explore-nepal" className="btn btn-secondary btn-sm">Explore Nepal</Link></div>
      </header>
      <PlacePicker current={place} />
      {!place ? <p className="data-state">That location wasn&apos;t recognised. Pick a city above or search for a place.</p> : (
        <>
          <LiveDataRefresh feed={feed} sourceLabel="Weather provider" />
          <div style={{ marginTop: 12 }}>
            <DataState feed={feed} skeleton={<Skeleton block lines={3} label="Loading weather" />}>
              {(w) => {
                const cur = describe(w.current.code, w.current.isDay);
                const advice = travelAdvice(w, dest || {}, view === 'tomorrow' ? 1 : 0);
                return (
                  <div className="stack">
                    <section className="card wx-hero" aria-labelledby="wx-now">
                      <span className="wx-emoji" aria-hidden="true">{cur.emoji}</span>
                      <div>
                        <h2 id="wx-now" style={{ margin: 0, fontSize: 'var(--fs-xl)' }}><MapPin size={18} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> {place.name}</h2>
                        <div className="wx-temp">{r0(w.current.temp, '°C')}</div>
                        <p style={{ margin: 0 }}><strong>{cur.label}</strong> · Feels like {r0(w.current.feelsLike, '°C')}</p>
                        {Number.isFinite(w.elevation) && <p className="src-note">Forecast point elevation ≈ {Math.round(w.elevation)} m</p>}
                      </div>
                    </section>
                    <div className="wx-details">
                      <div className="stat"><span className="stat-label">Humidity</span><span className="stat-value">{r0(w.current.humidity, '%')}</span></div>
                      <div className="stat"><span className="stat-label">Wind</span><span className="stat-value">{r0(w.current.windSpeed, ' km/h')} {dir(w.current.windDir)}</span></div>
                      <div className="stat"><span className="stat-label">Visibility</span><span className="stat-value">{Number.isFinite(w.current.visibility) ? `${(w.current.visibility / 1000).toFixed(1)} km` : '—'}</span></div>
                      <div className="stat"><span className="stat-label">Rain probability (this hour)</span><span className="stat-value">{r0(w.current.rainChance, '%')}</span></div>
                      <div className="stat"><span className="stat-label">UV index (this hour)</span><span className="stat-value">{Number.isFinite(w.current.uv) ? w.current.uv.toFixed(1) : '—'}</span></div>
                      <div className="stat"><span className="stat-label">Sunrise / sunset</span><span className="stat-value">{hm(w.days[0]?.sunrise)} / {hm(w.days[0]?.sunset)}</span></div>
                    </div>
                    <section aria-labelledby="fc-title">
                      <div className="section-title"><h2 id="fc-title">Forecast</h2>
                        <Segmented options={[{ id: 'today', label: 'Today' }, { id: 'tomorrow', label: 'Tomorrow' }, { id: 'week', label: '7 days' }]} value={view} onChange={setView} label="Forecast range" /></div>
                      {view === 'week' ? (
                        <div className="forecast">
                          {w.days.map((d, i) => { const x = describe(d.code); return (
                            <div key={d.date} className={`day${i === 0 ? ' is-today' : ''}`}><strong>{dayName(d.date, i)}</strong><span className="e" aria-hidden="true">{x.emoji}</span><span className="sr-only">{x.label}</span>
                              <span className="hi">{r0(d.max, '°')}</span><span className="lo">{r0(d.min, '°')}</span><span className="rain">💧 {r0(d.rainChance, '%')}</span></div>
                          ); })}
                        </div>
                      ) : w.days[view === 'tomorrow' ? 1 : 0] && <DayDetail d={w.days[view === 'tomorrow' ? 1 : 0]} i={view === 'tomorrow' ? 1 : 0} />}
                    </section>
                    {view !== 'week' && <section aria-labelledby="adv-title"><h2 id="adv-title" className="card-title">Outdoor conditions</h2><AdviceList advice={advice} /></section>}
                  </div>
                );
              }}
            </DataState>
          </div>
          <Disclaimer className="section">{WEATHER_DISCLAIMER} Official forecasts: <a href={OFFICIAL_WEATHER.url} target="_blank" rel="noopener noreferrer">{OFFICIAL_WEATHER.label}</a>. Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo.com</a> (CC BY 4.0).</Disclaimer>
        </>
      )}
    </div>
  );
}
