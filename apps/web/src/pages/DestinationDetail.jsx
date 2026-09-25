import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowRight, CalendarRange, Clock, CloudSun, Compass, MapPin, Mountain, ShieldAlert } from 'lucide-react';
import NotFound from './NotFound';
import SmartImage from '../components/media/SmartImage';
import Gallery from '../components/media/Gallery';
import { getHiddenGem } from '../data/hiddenGems';
import DestinationCard from '../components/nepal/DestinationCard';
import TravelSuggestion from '../components/nepal/TravelSuggestion';
import DataState from '../components/live/DataState';
import Skeleton from '../components/live/Skeleton';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import Disclaimer, { WEATHER_DISCLAIMER } from '../components/live/Disclaimer';
import { WhatsAppSection } from '../components/contact/WhatsApp';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useReveal } from '../hooks/useReveal';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { REFRESH } from '../services/config';
import { describe, getForecast } from '../services/weatherService';
import { ZONES, getProvince } from '../data/nepalPlaces';
import { useDestinations } from '../context/DestinationsContext';
import { api } from '../api/client';
import { PageLoader } from '../components/ui/Spinner';

function MapBlock({ d }) {
  const [show, setShow] = useState(false);
  const pad = d.mountain ? 0.12 : 0.06;
  const bbox = [d.lon - pad, d.lat - pad * 0.7, d.lon + pad, d.lat + pad * 0.7].map((v) => v.toFixed(4)).join(',');
  const osm = `https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lon}#map=12/${d.lat}/${d.lon}`;
  return (
    <div className="map-block">
      {show ? (
        <iframe title={`Map of ${d.name}`} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${d.lat},${d.lon}`} />
      ) : (
        <button type="button" className="map-placeholder" onClick={() => setShow(true)}>
          <MapPin aria-hidden="true" /><strong>Show map</strong><span className="small">Loads OpenStreetMap only when you ask, to keep the page fast.</span>
        </button>
      )}
      <p className="src-note">Approximate location {d.lat.toFixed(3)}°N, {d.lon.toFixed(3)}°E · <a href={osm} target="_blank" rel="noopener noreferrer">Open in OpenStreetMap</a> · Map data © OpenStreetMap contributors</p>
    </div>
  );
}

function Forecast({ d }) {
  const feed = useLiveDataRefresh(`weather:${d.lat.toFixed(3)},${d.lon.toFixed(3)}`, () => getForecast(d.lat, d.lon), { interval: REFRESH.weather.base });
  return (
    <>
      <LiveDataRefresh feed={feed} sourceLabel="Weather provider" compact />
      <DataState feed={feed} skeleton={<Skeleton lines={4} label="Loading forecast" />}>{(w) => (
        <>
          <TravelSuggestion weather={w} dest={d} />
          <div className="forecast" aria-label="7-day forecast" style={{ marginTop: 16 }}>
            {w.days.map((f, i) => { const x = describe(f.code); return (
              <div key={f.date} className={`day${i === 0 ? ' is-today' : ''}`}>
                <span>{i === 0 ? 'Today' : new Date(`${f.date}T12:00`).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span className="e" aria-hidden="true">{x.emoji}</span><span className="sr-only">{x.label}</span>
                <span className="hi">{Math.round(f.max)}°</span><span className="lo">{Math.round(f.min)}°</span>
                <span className="rain">{f.rainChance ?? '—'}%</span>
              </div>
            ); })}
          </div>
        </>
      )}</DataState>
    </>
  );
}

export default function DestinationDetail() {
  const gemSlug = useParams().destination;
  if (getHiddenGem(gemSlug)) return <Navigate to={`/hidden-gems/${gemSlug}`} replace />;
  return <DestinationDetailInner />;
}

function DestinationDetailInner() {
  const { destination } = useParams();
  const [params] = useSearchParams();
  const wantsPreview = params.get('preview') === '1';
  const { getDestination, status } = useDestinations();
  const fromList = wantsPreview ? undefined : getDestination(destination);
  // Not in the loaded list (new, beyond the first page, or a draft preview for staff): ask the API directly.
  const [single, setSingle] = useState({ slug: null, data: null, done: false });
  useEffect(() => {
    if (fromList || (status === 'loading' && !wantsPreview)) return undefined;
    let alive = true;
    setSingle({ slug: destination, data: null, done: false });
    api.get(`/destinations/${encodeURIComponent(destination)}${wantsPreview ? '?preview=1' : ''}`)
      .then((data) => alive && setSingle({ slug: destination, data: { tags: [], activities: [], nearbyAttractions: [], tips: [], safety: [], nearby: [], photos: [], ...data }, done: true }))
      .catch(() => alive && setSingle({ slug: destination, data: null, done: true }));
    return () => { alive = false; };
  }, [destination, fromList, status, wantsPreview]);
  const d = fromList || (single.slug === destination ? single.data : null);
  const waiting = !d && (status === 'loading' || !(single.slug === destination && single.done));
  useDocumentTitle(d ? `${d.name}, Nepal` : 'Destination not found');
  const ref = useRef(null);
  useReveal(ref, [destination]);
  if (waiting) return <PageLoader />;
  if (!d) return <NotFound />;
  const province = getProvince(d.province);
  const zone = ZONES.find((z) => z.id === d.zone);
  const nearby = d.nearby.map((id) => getDestination(id)).filter(Boolean);
  const goNearby = (e) => { e.preventDefault(); document.getElementById('nearby')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <article ref={ref} data-domain="nepal" className="dest-page">
      {d.preview && <p className="preview-banner" role="status">Preview — this is how the page will look. {d.status !== 'PUBLISHED' ? `It isn’t public yet (${String(d.status).toLowerCase()}).` : ''}</p>}
      <header className="page-hero dest-hero">
        <SmartImage photo={d.photos[0]} priority sizes="100vw" className="page-hero-img" />
        <div className="page-hero-shade" aria-hidden="true" />
        <div className="container page-hero-inner">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/explore-nepal">Explore Nepal</Link> <span aria-hidden="true">/</span> <span aria-current="page">{d.name}</span></nav>
          <p className="dest-hero-where"><MapPin aria-hidden="true" /> {province?.name}</p>
          <h1>{d.name}</h1>
          <p>{d.tagline}</p>
          <div className="hero-actions">
            <a href="#weather" className="btn btn-lg btn-hero"><CloudSun aria-hidden="true" /> Check current weather</a>
            <a href="#nearby" onClick={goNearby} className="btn btn-lg btn-hero-ghost"><Compass aria-hidden="true" /> Explore nearby</a>
          </div>
        </div>
      </header>

      <div className="container page">
        <dl className="facts" data-reveal>
          <div><dt><MapPin aria-hidden="true" /> Province</dt><dd>{province?.name}</dd></div>
          <div><dt><Mountain aria-hidden="true" /> Landscape</dt><dd>{zone?.name} <span className="small muted">({zone?.altitude.toLowerCase()})</span></dd></div>
          <div><dt><Clock aria-hidden="true" /> Typical trip</dt><dd>{d.duration}</dd></div>
          <div><dt><CalendarRange aria-hidden="true" /> Best known for</dt><dd>{d.knownFor}</dd></div>
        </dl>

        <div className="dest-layout">
          <div className="dest-main">
            <section aria-labelledby="gal"><h2 id="gal" className="hs-h">Explore the place</h2><Gallery photos={d.photos} title={d.name} /></section>

            <section aria-labelledby="todo" data-reveal><h2 id="todo" className="hs-h">Things to do</h2>
              <ul className="pill-list">{d.activities.map((a) => <li key={a}>{a}</li>)}</ul></section>

            <section aria-labelledby="near-a" data-reveal><h2 id="near-a" className="hs-h">Nearby attractions</h2>
              <ul className="check-list">{d.nearbyAttractions.map((a) => <li key={a}>{a}</li>)}</ul></section>

            <section aria-labelledby="when" data-reveal><h2 id="when" className="hs-h">Best time to visit</h2><p>{d.bestTime}</p></section>

            <section aria-labelledby="tips" data-reveal className="two-col">
              <div><h2 id="tips" className="hs-h">Travel tips</h2><ul className="check-list">{d.tips.map((t) => <li key={t}>{t}</li>)}<li>Getting there: {d.travel}</li></ul></div>
              <div className="safety-box"><h2 className="hs-h"><ShieldAlert aria-hidden="true" /> Safety information</h2>
                <ul>{d.safety.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="small">In an emergency call Police <a href="tel:100">100</a> or Ambulance <a href="tel:102">102</a>. <Link to="/emergency">All emergency numbers</Link>.</p>
                {d.mountain && <p className="small">Mountain area: conditions change fast. Check official weather and local safety information before trekking.</p>}
              </div>
            </section>

            <section aria-labelledby="map" data-reveal><h2 id="map" className="hs-h">Map</h2><MapBlock d={d} /></section>
          </div>

          <aside className="dest-side" id="weather" aria-labelledby="wx-h">
            <div className="side-card">
              <h2 id="wx-h" className="hs-h">Weather forecast</h2>
              <Forecast d={d} />
              <Link to={`/weather/${d.id}`} className="hs-more small">Hourly details and more <ArrowRight aria-hidden="true" /></Link>
            </div>
          </aside>
        </div>

        {nearby.length > 0 && (
          <section id="nearby" className="hs-inner" aria-labelledby="nb-h">
            <h2 id="nb-h" className="hs-h">Nearby destinations</h2>
            <div className="dest-grid-lg">{nearby.map((n) => <DestinationCard key={n.id} d={n} />)}</div>
          </section>
        )}

        <Disclaimer className="section">{WEATHER_DISCLAIMER} Travel information here is general guidance, not a guarantee. Permits, prices, routes and flights change — confirm with official sources and registered local operators.</Disclaimer>
      </div>
      <WhatsAppSection title={`Planning a trip to ${d.name}?`} />
    </article>
  );
}
