import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Heart, MapPin, Mountain, Phone, Globe, Mail, Star, Route, BookmarkPlus } from 'lucide-react';
import GemArt from './GemArt';
import SmartImage from '../media/SmartImage';
import Segmented from '../ui/Segmented';
import Alert from '../ui/Alert';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { circuits, getHiddenGem } from '../../data/hiddenGems';

export const DIFFICULTY = { easy: 'Easy', moderate: 'Moderate', challenging: 'Challenging', strenuous: 'Strenuous' };
export const fmtM = (m) => (m ? `≈ ${m.toLocaleString()} m` : 'Not confirmed');
export const npr = (n) => `Rs ${n.toLocaleString('en-IN')}`;

export function GemHero({ gem, className = '' }) {
  const photo = gem.photos?.[0];
  if (!photo) return <GemArt slug={gem.slug} rank={gem.rank} className={className} />;
  return (<>
    <SmartImage photo={photo} className={`gem-hero-img ${className}`} sizes="(max-width: 700px) 100vw, 50vw" />
    {photo.nearby && <span className="nearby-badge" title="Photo of the surrounding area, not the exact place">Nearby view</span>}
  </>);
}

export function GemCard({ gem }) {
  return (
    <Link to={`/hidden-gems/${gem.slug}`} className="gem-card">
      <div className="gem-card-media"><GemHero gem={gem} /><span className="gem-rank" aria-label={`Number ${gem.rank}`}>{gem.rank}</span></div>
      <div className="gem-card-body">
        <p className="small muted"><MapPin aria-hidden="true" className="inline-ico" /> {gem.district}</p>
        <h3>{gem.name}</h3>
        <p className="small">{gem.tagline}</p>
        <p className="gem-chips">
          {gem.elevationM && <span className="chip"><Mountain aria-hidden="true" /> {fmtM(gem.elevationM)}</span>}
          {gem.difficulty && <span className="chip">{DIFFICULTY[gem.difficulty]}</span>}
        </p>
      </div>
    </Link>
  );
}

/** Heart toggle; needs an account (guests are told why). */
export function SaveGem({ slug }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!user) return;
    api.get('/me/favorites/destinations').then((l) => setSaved(l.some((d) => d.slug === slug))).catch(() => {});
  }, [user, slug]);
  const toggle = async () => {
    if (!user) { setMsg('Sign in to save places.'); return; }
    try { const r = saved ? await api.del(`/me/favorites/destinations/${slug}`) : await api.put(`/me/favorites/destinations/${slug}`); setSaved(r.favorite); setMsg(''); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <span className="gem-save">
      <button type="button" className="btn btn-secondary btn-sm" aria-pressed={saved} onClick={toggle}><Heart aria-hidden="true" fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}</button>
      {msg && <span className="small muted" role="status">{msg} {!user && <Link to="/login">Sign in</Link>}</span>}
    </span>
  );
}

const DAY_OPTS = [3, 5, 7, 14].map((d) => ({ id: d, label: `${d} days` }));
const AUD_OPTS = [{ id: 'domestic', label: 'Travelling from Nepal' }, { id: 'international', label: 'Visiting from abroad' }];

/** 3/5/7/14-day suggested itineraries for domestic and international travellers. */
export function ItineraryPlanner({ onlyGem }) {
  const { user } = useAuth();
  const pool = useMemo(() => (onlyGem ? circuits.filter((c) => c.gems.includes(onlyGem)) : circuits), [onlyGem]);
  const available = DAY_OPTS.filter((d) => pool.some((c) => c.days === d.id));
  const [days, setDays] = useState(available[0]?.id ?? 3);
  const [aud, setAud] = useState('domestic');
  const [msg, setMsg] = useState('');
  if (!available.length) return <p className="muted">No suggested itinerary includes this place yet — see the travel notes above.</p>;
  const matches = pool.filter((c) => c.days === days);
  const plan = matches.find((c) => c.audience === aud) || matches.find((c) => c.audience === 'both') || matches[0];
  const save = async () => {
    try { await api.post('/me/trips', { title: plan.title, days: plan.days, destinations: plan.gems, itinerary: plan.plan.map((p) => ({ day: p.day, title: p.title, stops: [] })) }); setMsg('Saved to your trips.'); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="itin">
      <div className="itin-controls">
        <Segmented options={available} value={days} onChange={setDays} label="Trip length" />
        <Segmented options={AUD_OPTS} value={aud} onChange={setAud} label="Traveller" />
      </div>
      <div className="card itin-card">
        <h3>{plan.title}</h3>
        <p className="small muted">Starts from {plan.startFrom}{plan.audience !== 'both' && plan.audience !== aud ? ` · written for ${plan.audience} travellers` : ''}
          {' · '}Places: {plan.gems.map((s) => getHiddenGem(s)?.name || s).join(', ')}</p>
        {aud === 'international' && <Alert type="info">Foreign visitors: check permits (see the Travel Nepal guide) and keep a spare day for domestic-flight delays.</Alert>}
        <ol className="itin-days">{plan.plan.map((p) => <li key={p.day}><span className="itin-day">Day {p.day}</span><div><strong>{p.title}</strong>{p.detail && <p className="small muted">{p.detail}</p>}</div></li>)}</ol>
        <div className="cm-row">
          {user ? <button type="button" className="btn btn-secondary btn-sm" onClick={save}><BookmarkPlus aria-hidden="true" /> Save this trip</button> : <Link to="/login" className="small">Sign in to save trips</Link>}
          {msg && <span className="small muted" role="status">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

const STAY_TYPES = [{ id: '', label: 'All' }, { id: 'HOTEL', label: 'Hotels' }, { id: 'HOMESTAY', label: 'Homestays' }, { id: 'RESORT', label: 'Resorts' }, { id: 'LODGE', label: 'Lodges' }, { id: 'CAMPING', label: 'Camping' }];

/** Verified stays from our editors + optional live Google Places results (never mixed up). */
export function StaysPanel({ gem }) {
  const [type, setType] = useState('');
  const [data, setData] = useState({ status: 'loading', items: [], googleEnabled: false });
  const [google, setGoogle] = useState({ status: 'idle', items: [] });
  useEffect(() => {
    let live = true; setData((d) => ({ ...d, status: 'loading' }));
    api.get(`/destinations/${gem.slug}/stays${type ? `?type=${type}` : ''}`).then((r) => live && setData({ status: 'ready', ...r })).catch((e) => live && setData({ status: 'error', items: [], error: e }));
    return () => { live = false; };
  }, [gem.slug, type]);
  const loadGoogle = async () => {
    setGoogle({ status: 'loading', items: [] });
    try { const r = await api.get(`/places/nearby?lat=${gem.lat}&lon=${gem.lon}&radius=15000&type=${type || 'ALL'}`); setGoogle({ status: 'ready', items: r.items }); }
    catch (e) { setGoogle({ status: 'error', items: [], error: e }); }
  };
  return (
    <div className="stays">
      <Segmented options={STAY_TYPES} value={type} onChange={setType} label="Type of stay" className="seg-scroll" />
      {data.status === 'loading' && <p className="muted" role="status">Loading stays…</p>}
      {data.status === 'error' && <p className="muted">Stay listings are unavailable offline.</p>}
      {data.status === 'ready' && !data.items.length && <p className="muted">No verified listings here yet. Our editors only list places after checking their details. In remote areas, most stays are simple teahouses and homestays found on arrival.</p>}
      <ul className="stay-list">{data.items.map((s) => (
        <li key={s.id} className="card stay">
          <p className="small muted"><BedDouble aria-hidden="true" className="inline-ico" /> {s.type.toLowerCase()}{s.distanceKm != null && ` · ${s.distanceKm} km away`}{s.priceRangeNpr && ` · ${s.priceRangeNpr.filter(Boolean).map(npr).join(' – ')}`}</p>
          <h4>{s.name}</h4>
          {s.description && <p className="small">{s.description}</p>}
          {s.amenities.length > 0 && <p className="gem-chips">{s.amenities.slice(0, 8).map((a) => <span key={a} className="chip">{a}</span>)}</p>}
          <p className="stay-contact small">
            {s.phone && <a href={`tel:${s.phone.replace(/\s/g, '')}`}><Phone aria-hidden="true" className="inline-ico" /> {s.phone}</a>}
            {s.email && <a href={`mailto:${s.email}`}><Mail aria-hidden="true" className="inline-ico" /> Email</a>}
            {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer"><Globe aria-hidden="true" className="inline-ico" /> Website</a>}
            {s.mapsUrl && <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" className="inline-ico" /> Google Maps</a>}
          </p>
          {s.verifiedAt && <p className="small muted">Details checked {new Date(s.verifiedAt).toLocaleDateString()}</p>}
        </li>
      ))}</ul>
      {data.googleEnabled && (
        <div className="stays-google">
          {google.status === 'idle' && <button type="button" className="btn btn-secondary btn-sm" onClick={loadGoogle}>Show nearby places from Google</button>}
          {google.status === 'loading' && <p className="muted" role="status">Asking Google…</p>}
          {google.status === 'error' && <p className="muted">{google.error?.message}</p>}
          {google.status === 'ready' && (<>
            <p className="small muted">{google.items.length ? 'Unverified listings from Google Maps — check details directly with the property.' : 'Google has no listings within 15 km.'}</p>
            <ul className="stay-list">{google.items.map((p) => (
              <li key={p.placeId} className="card stay"><h4>{p.name}</h4>
                <p className="small muted">{p.address}{p.distanceKm != null && ` · ${p.distanceKm} km`}</p>
                {p.rating != null && <p className="small"><Star aria-hidden="true" className="inline-ico" /> {p.rating.toFixed(1)} ({p.ratingCount} Google reviews)</p>}
                {p.mapsUrl && <a className="small" href={p.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>}
              </li>))}</ul>
            <p className="google-attrib small">Listings and ratings © Google</p>
          </>)}
        </div>
      )}
    </div>
  );
}

export function MapBox({ gem }) {
  const d = gem.coordsApprox ? 0.12 : 0.05;
  const bbox = [gem.lon - d, gem.lat - d, gem.lon + d, gem.lat + d].map((n) => n.toFixed(4)).join(',');
  return (
    <figure className="gem-map">
      <iframe title={`Map of ${gem.name}`} loading="lazy" referrerPolicy="no-referrer" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${gem.lat},${gem.lon}`} />
      <figcaption className="small muted">
        {gem.coordsApprox ? 'Approximate location. ' : ''}<a href={`https://www.google.com/maps/search/?api=1&query=${gem.lat},${gem.lon}`} target="_blank" rel="noopener noreferrer"><Route aria-hidden="true" className="inline-ico" /> Directions in Google Maps</a>
        {' · '}Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
      </figcaption>
    </figure>
  );
}
