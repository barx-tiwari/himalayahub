import { useState } from 'react';
import { Link } from 'react-router-dom';
import { destinations, provinces, weatherCities, getProvince } from '../../data/nepalPlaces';
import { nationalContacts } from '../../data/emergencyContacts';
import { describe } from '../../services/weatherService';

/*
 * Lightweight schematic (plain SVG, no map library). Places are plotted from
 * real coordinates; the background bands only suggest the Himalaya / Hill /
 * Terai belts. No national border is drawn — this is not an official map.
 */
const W = 820; const H = 400;
const LON0 = 79.9; const LON1 = 88.4; const LAT0 = 26.0; const LAT1 = 30.6;
const x = (lon) => ((lon - LON0) / (LON1 - LON0)) * W;
const y = (lat) => ((LAT1 - lat) / (LAT1 - LAT0)) * H;
const line = (pts) => pts.map(([lo, la]) => `${x(lo).toFixed(1)},${y(la).toFixed(1)}`);
const N = [[79.9, 30.45], [88.4, 28.15]];
const M = [[79.9, 29.22], [88.4, 27.28]];
const T = [[79.9, 28.82], [84, 27.95], [86, 27.4], [88.4, 26.72]];
const S = [[79.9, 28.22], [88.4, 26.08]];
const band = (top, bottom) => `M${line(top).join(' L')} L${line([...bottom].reverse()).join(' L')} Z`;

const COLORS = { koshi: '#2f8fd4', madhesh: '#d9640a', bagmati: '#7045d8', gandaki: '#0a8fb0', lumbini: '#178a55', karnali: '#a8780a', sudurpashchim: '#cf2f6a' };
const KEY = ['police', 'ambulance', 'fire', 'disaster'];

export default function NepalMap({ feed }) {
  const [prov, setProv] = useState('bagmati');
  const p = getProvince(prov);
  const places = destinations.filter((d) => d.province === prov);
  const cities = weatherCities.filter((c) => c.province === prov);
  const w = feed?.data || {};
  const firstWx = places.find((d) => w[d.id]);
  return (
    <div className="nmap">
      <div className="chip-tabs" role="group" aria-label="Choose a province">
        {provinces.map((pr) => (
          <button key={pr.id} type="button" aria-pressed={prov === pr.id} onClick={() => setProv(pr.id)}>
            <span className="nmap-swatch" style={{ background: COLORS[pr.id] }} aria-hidden="true" />{pr.name.replace(' Province', '')}
          </button>
        ))}
      </div>
      <div className="nmap-layout">
        <figure className="nmap-figure">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Schematic of Nepal showing destinations; ${p.name} highlighted`}>
            <path className="band-himalaya" d={band(N, M)} />
            <path className="band-hill" d={band(M, T)} />
            <path className="band-terai" d={band(T, S)} />
            <text className="band-label" x={x(80.3)} y={y(30.0)}>Himalaya</text>
            <text className="band-label" x={x(80.3)} y={y(29.05)}>Hills</text>
            <text className="band-label" x={x(80.3)} y={y(28.45)}>Terai</text>
            {weatherCities.map((c) => (
              <circle key={c.id} cx={x(c.lon)} cy={y(c.lat)} r={c.province === prov ? 4 : 2.5} className={`nmap-city${c.province === prov ? ' on' : ''}`} />
            ))}
            {destinations.map((d) => {
              const on = d.province === prov;
              return (
                <Link key={d.id} to={`/explore-nepal/${d.id}`} aria-label={`${d.name}, ${getProvince(d.province)?.name}`}>
                  <g className={`nmap-dest${on ? ' on' : ''}`} transform={`translate(${x(d.lon).toFixed(1)} ${y(d.lat).toFixed(1)})`}>
                    <circle r={on ? 9 : 6} fill={COLORS[d.province]} />
                    <title>{d.name}</title>
                    <text y={-14} textAnchor="middle">{d.name}</text>
                  </g>
                </Link>
              );
            })}
          </svg>
          <figcaption className="src-note">Schematic only — positions are approximate and this is not an official map. Large dots are destinations; small dots are cities.</figcaption>
        </figure>
        <div className="nmap-panel" aria-live="polite">
          <h3>{p.name}</h3>
          <div>
            <h4>Popular places</h4>
            {places.length ? <ul>{places.map((d) => <li key={d.id}><Link to={`/explore-nepal/${d.id}`}>{d.name}</Link>{w[d.id] && <span className="muted small"> · {describe(w[d.id].current.code).emoji} {Math.round(w[d.id].current.temp)}°C</span>}</li>)}</ul>
              : <p className="small muted">No featured destinations here yet.</p>}
          </div>
          <div>
            <h4>Major cities</h4>
            {cities.length ? <ul className="inline-list">{cities.map((c) => <li key={c.id}><Link to={`/weather/${c.id}`}>{c.name}</Link></li>)}</ul> : <p className="small muted">See the weather page to search any town.</p>}
          </div>
          <div>
            <h4>Weather</h4>
            <p className="small">{firstWx ? <>Now in {firstWx.name}: {describe(w[firstWx.id].current.code, w[firstWx.id].current.isDay).label}, {Math.round(w[firstWx.id].current.temp)}°C. </> : null}<Link to={`/weather/${cities[0]?.id || places[0]?.id || ''}`}>Open the forecast</Link></p>
          </div>
          <div>
            <h4>Emergency</h4>
            <ul className="inline-list">{KEY.map((k) => { const c = nationalContacts.find((n) => n.id === k); return c && <li key={k}><a href={`tel:${c.number}`}>{c.category === 'Disaster Management' ? 'Disaster' : c.category} {c.number}</a></li>; })}</ul>
            <p className="src-note">National numbers work across Nepal. <Link to="/emergency">More help</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
