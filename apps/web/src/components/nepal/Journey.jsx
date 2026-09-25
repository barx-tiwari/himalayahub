import { Link } from 'react-router-dom';
import SmartImage from '../media/SmartImage';
import { ZONES } from '../../data/nepalPlaces';
import { useDestinations } from '../../context/DestinationsContext';


/** From the Himalayas to the Terai: a left-to-right descent through Nepal's four bands. */
export default function Journey() {
  const { destinations } = useDestinations();
  return (
    <ol className="journey" aria-label="Nepal from the Himalayas to the Terai">
      {ZONES.map((z, i) => (
        <li key={z.id} className={`journey-stop zone-${z.id}`} data-reveal style={{ '--i': i }}>
          <div className="journey-head">
            <span className="journey-step" aria-hidden="true">{i + 1}</span>
            <h3>{z.name}</h3>
            <span className="small">{z.altitude}</span>
          </div>
          <p>{z.blurb}</p>
          <ul className="journey-places">
            {destinations.filter((d) => d.zone === z.id).map((d) => (
              <li key={d.id}><Link to={`/explore-nepal/${d.id}`}><SmartImage photo={d.photos[0]} sizes="64px" /><span>{d.name}</span></Link></li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
