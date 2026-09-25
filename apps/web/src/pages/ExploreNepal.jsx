import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import Disclaimer, { WEATHER_DISCLAIMER } from '../components/live/Disclaimer';
import { GemCard } from '../components/gems/GemParts';
import { hiddenGems } from '../data/hiddenGems';
import SmartImage from '../components/media/SmartImage';
import DestinationCard from '../components/nepal/DestinationCard';
import NepalMap from '../components/nepal/NepalMap';
import WhereToGoFinder from '../components/nepal/WhereToGoFinder';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useReveal } from '../hooks/useReveal';
import { useDestinationsWeather } from '../hooks/useDestinationsWeather';
import { ZONES, provinces } from '../data/nepalPlaces';
import { useDestinations } from '../context/DestinationsContext';

export default function ExploreNepal() {
  useDocumentTitle('Explore Nepal');
  const [province, setProvince] = useState('');
  const [zone, setZone] = useState('');
  const feed = useDestinationsWeather();
  const { destinations } = useDestinations();
  const heroPhoto = (destinations.find((d) => d.id === 'pokhara' && d.photos.length > 1)?.photos[1]) || destinations.find((d) => d.photos.length)?.photos[0];
  const ref = useRef(null);
  useReveal(ref, [province, zone]);
  const list = destinations.filter((d) => (!province || d.province === province) && (!zone || d.zone === zone));
  return (
    <div ref={ref} data-domain="nepal">
      <section className="page-hero">
        <SmartImage photo={heroPhoto} priority sizes="100vw" className="page-hero-img" />
        <div className="page-hero-shade" aria-hidden="true" />
        <div className="container page-hero-inner">
          <h1>Explore Nepal</h1>
          <p>{destinations.length} destinations from the Himalayas to the Terai, with live weather, things to do and honest travel notes.</p>
          <div className="hero-actions"><a href="#all" className="btn btn-lg btn-hero">Browse destinations</a><Link to="/where-to-go" className="btn btn-lg btn-hero-ghost">Rank by today’s weather</Link></div>
        </div>
      </section>

      <div className="container page">
        <section className="hs-inner" aria-labelledby="ex-where">
          <h2 id="ex-where" className="hs-h">Where should you go today?</h2>
          <WhereToGoFinder feed={feed} />
        </section>

        <section className="hs-inner ex-gems" aria-labelledby="ex-gems">
          <div className="row-between"><h2 id="ex-gems" className="hs-h">💎 Hidden Gems of Eastern Nepal</h2><Link to="/hidden-gems" className="hs-more">Stories &amp; itineraries →</Link></div>
          <p className="muted">Sacred high lakes, rhododendron ridges and old trading villages in Koshi Province.</p>
          <div className="gem-grid">{hiddenGems.map((g) => <GemCard key={g.slug} gem={g} />)}</div>
        </section>

        <section className="hs-inner" id="all" aria-labelledby="ex-all">
          <div className="row-between"><h2 id="ex-all" className="hs-h">All destinations</h2><LiveDataRefresh feed={feed} sourceLabel="Weather provider" compact /></div>
          <div className="toolbar">
            <div className="field"><label htmlFor="ex-prov">Province</label>
              <select id="ex-prov" className="select" value={province} onChange={(e) => setProvince(e.target.value)}><option value="">All provinces</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div className="field"><label htmlFor="ex-zone">Landscape</label>
              <select id="ex-zone" className="select" value={zone} onChange={(e) => setZone(e.target.value)}><option value="">All landscapes</option>
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></div>
          </div>
          {list.length ? (
            <div className="dest-grid-lg">
              {list.map((d, i) => <div key={d.id} data-reveal style={{ '--i': i % 6 }}><DestinationCard d={d} weather={feed.data?.[d.id]} headingLevel={3} /></div>)}
            </div>
          ) : <p className="data-state">No destinations match those filters yet. <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setProvince(''); setZone(''); }}>Clear filters</button></p>}
        </section>

        <section className="hs-inner" aria-labelledby="ex-map">
          <h2 id="ex-map" className="hs-h">Explore by province</h2>
          <NepalMap feed={feed} />
        </section>

        <Disclaimer className="section">{WEATHER_DISCLAIMER} Travel notes are general and may be out of date; permits, flights and road conditions change.</Disclaimer>
      </div>
    </div>
  );
}
