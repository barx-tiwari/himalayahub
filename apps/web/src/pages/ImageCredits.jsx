import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCredits } from '../hooks/useCredits';
import SmartImage from '../components/media/SmartImage';
import { HERO_PHOTO } from '../data/nepalPlaces';
import { useDestinations } from '../context/DestinationsContext';
import { commonsPage } from '../services/imageService';

export default function ImageCredits() {
  useDocumentTitle('Image credits');
  const { destinations, getDestination } = useDestinations();
  const allPhotos = [HERO_PHOTO, ...destinations.flatMap((d) => d.photos.map((p) => ({ ...p, destination: d.id })))]
    .filter((p, i, l) => l.findIndex((q) => (q.file || q.src) === (p.file || p.src)) === i);
  const credits = useCredits(allPhotos);
  return (
    <div className="container page">
      <header className="page-header">
        <h1>Image credits</h1>
        <p>Destination photos come from Wikimedia Commons, which only hosts freely licensed or public-domain media. Authors and licences below are read from Commons; follow each link for the full terms.</p>
      </header>
      <ul className="credit-list">
        {allPhotos.map((p) => { const c = credits[p.file] || {}; const d = p.destination && getDestination(p.destination); return (
          <li key={p.file || p.src}>
            <SmartImage photo={p} sizes="120px" />
            <div>
              <strong>{p.alt}</strong>
              <span className="small">{d ? d.name : 'Home page hero'}</span>
              {p.src ? <span className="small">{p.credit || 'Photo supplied by HimalayaHub'}</span> : <span className="small">Author: {c.artist || 'see file page'} · Licence: {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a> : (c.license || 'see file page')}</span>}
              {p.file && <a className="small" href={c.page || commonsPage(p.file)} target="_blank" rel="noopener noreferrer">{p.file} on Wikimedia Commons</a>}
            </div>
          </li>
        ); })}
      </ul>
      <p className="src-note">Photos are shown resized. No other changes were made. If you are a rights holder and something is wrong, please get in touch through the Contact page.</p>
    </div>
  );
}
