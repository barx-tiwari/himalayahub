import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import SmartImage from '../media/SmartImage';
import { getProvince } from '../../data/nepalPlaces';
import { describe } from '../../services/weatherService';

/** Large image card: hover zooms the photo, lifts the card and reveals "Explore". */
export default function DestinationCard({ d, weather, size = 'md', sizes = '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw', headingLevel = 3, showTagline = true }) {
  const H = `h${headingLevel}`;
  const c = weather ? describe(weather.current.code, weather.current.isDay) : null;
  return (
    <Link to={d.hiddenGem ? `/hidden-gems/${d.id}` : `/explore-nepal/${d.id}`} className={`dest-tile size-${size}${d.hiddenGem ? ' is-gem' : ''}`}>
      {d.hiddenGem && <span className="dest-gem-badge">💎 Hidden gem</span>}
      {d.photos?.[0]?.nearby && <span className="nearby-badge">Nearby view</span>}
      <SmartImage photo={d.photos[0]} sizes={sizes} className="dest-tile-img" />
      <span className="dest-tile-shade" aria-hidden="true" />
      {weather && Number.isFinite(weather.current.temp) && (
        <span className="dest-tile-wx" title={c.label}><span aria-hidden="true">{c.emoji}</span> {Math.round(weather.current.temp)}°C<span className="sr-only"> now, {c.label}</span></span>
      )}
      <span className="dest-tile-body">
        <span className="dest-tile-where"><MapPin aria-hidden="true" />{getProvince(d.province)?.name}</span>
        <H className="dest-tile-name">{d.name}</H>
        {showTagline && <span className="dest-tile-tag">{d.tagline}</span>}
        <span className="dest-tile-cta" aria-hidden="true">Explore →</span>
      </span>
    </Link>
  );
}
