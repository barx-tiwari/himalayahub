import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Bus, Clock, Landmark, Mountain, Plane, Ruler, Sunrise, Sunset, Tent, Users, Wallet } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Gallery from '../components/media/Gallery';
import { DIFFICULTY, GemHero, ItineraryPlanner, MapBox, SaveGem, StaysPanel, fmtM, npr } from '../components/gems/GemParts';
import { useHiddenGem, useHiddenGems } from '../hooks/useHiddenGems';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { HIDDEN_GEMS_DISCLAIMER } from '../data/hiddenGems';

function Fact({ icon: I, label, children }) {
  return <div className="gem-fact"><I aria-hidden="true" /><span className="small muted">{label}</span><strong>{children}</strong></div>;
}
function Section({ id, title, children }) {
  return <section className="gem-sec" aria-labelledby={id}><h2 id={id}>{title}</h2>{children}</section>;
}
const list = (xs) => (xs?.length ? <ul className="pill-list">{xs.map((x) => <li key={x}>{x}</li>)}</ul> : null);

export default function HiddenGemDetail() {
  const { slug } = useParams();
  const { gem, status } = useHiddenGem(slug);
  const { gems } = useHiddenGems();
  useDocumentTitle(gem ? `${gem.name} — Hidden Gems` : 'Hidden Gems');
  if (status === 'loading') return <div className="container page"><div className="card" role="status" aria-label="Loading"><span className="skeleton title" /><span className="skeleton" /></div></div>;
  if (!gem) return <div className="container page"><Alert type="error" action={<Link to="/hidden-gems" className="btn btn-sm btn-secondary">All hidden gems</Link>}>We couldn’t find that place.</Alert></div>;

  const t = gem.travel || {}; const adv = gem.adventure || {}; const tour = gem.tourism || {};
  const idx = gems.findIndex((g) => g.slug === gem.slug);
  const nextGem = gems[(idx + 1) % gems.length];

  return (
    <article className="gem-detail" data-domain="nepal">
      <header className="gem-head">
        <div className="gem-head-media"><GemHero gem={gem} className="gem-head-art" /></div>
        <div className="container gem-head-text">
          <p className="small"><Link to="/hidden-gems"><ArrowLeft aria-hidden="true" className="inline-ico" /> Hidden Gems of Eastern Nepal</Link></p>
          <p className="eyebrow">No. {gem.rank} · {gem.district}</p>
          <h1>{gem.name}</h1>
          <p className="lead">{gem.tagline}</p>
          <SaveGem slug={gem.slug} />
        </div>
      </header>

      <div className="container page">
        <div className="gem-facts">
          <Fact icon={Mountain} label="Elevation">{fmtM(gem.elevationM)}</Fact>
          <Fact icon={Ruler} label="Difficulty">{DIFFICULTY[gem.difficulty] || '—'}</Fact>
          <Fact icon={Clock} label="Best time">{gem.bestTime || '—'}</Fact>
          <Fact icon={Plane} label="From Kathmandu">{gem.distanceFromKtmKm ? `≈ ${gem.distanceFromKtmKm} km by road` : '—'}</Fact>
        </div>
        <Alert type={gem.needsResearch ? 'warning' : 'info'}>{gem.needsResearch ? 'We have very little verified information about this place yet. ' : ''}{gem.verifiedAt ? `Facts checked by an editor on ${gem.verifiedAt}.` : HIDDEN_GEMS_DISCLAIMER}</Alert>

        {gem.photos?.length > 0 && (
          <section className="gem-sec gem-gallery" aria-labelledby="g-gal"><h2 id="g-gal">Photos</h2><Gallery photos={gem.photos} title={gem.name} /></section>
        )}
        {!gem.photos?.length && <p className="small muted">No verified photo of {gem.name} yet. Have one you took yourself? Share it with us through the <Link to="/contact">Contact page</Link>.</p>}

        <div className="gem-story">
          {(gem.story || []).map((s, i) => (
            <section key={s.heading} className={`gem-chapter${i % 2 ? ' alt' : ''}`}><span className="gem-chapter-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><h2>{s.heading}</h2><p>{s.text}</p></div></section>
          ))}
        </div>

        <div className="gem-cols">
          <div>
            {(gem.culture || gem.history || gem.localCommunities) && <Section id="g-cult" title="Culture and communities">{[gem.history, gem.culture, gem.localCommunities].filter(Boolean).map((p) => <p key={p}>{p}</p>)}</Section>}
            <Section id="g-reach" title="Getting there">
              {t.howToReach && <p>{t.howToReach}</p>}
              <ul className="gem-dl">
                {t.nearestAirport && <li><Plane aria-hidden="true" /><span><strong>Nearest airport</strong> {t.nearestAirport}</span></li>}
                {t.nearestBusStation && <li><Bus aria-hidden="true" /><span><strong>Nearest bus station</strong> {t.nearestBusStation}</span></li>}
                {t.roadConditions && <li><AlertTriangle aria-hidden="true" /><span><strong>Roads</strong> {t.roadConditions}</span></li>}
              </ul>
            </Section>
            {(adv.trekRoutes?.length || adv.hikingRoutes?.length || gem.camping) && (
              <Section id="g-adv" title="Trekking, hiking and camping">
                {[...(adv.trekRoutes || []), ...(adv.hikingRoutes || [])].map((r) => <div key={r.name} className="gem-route"><strong>{r.name}</strong><span className="small muted">{[r.days && `${r.days} day${r.days > 1 ? 's' : ''}`, r.maxElevationM && `max ${fmtM(r.maxElevationM)}`].filter(Boolean).join(' · ')}</span>{r.notes && <p className="small">{r.notes}</p>}</div>)}
                {gem.camping && <p><Tent aria-hidden="true" className="inline-ico" /> {gem.camping}</p>}
              </Section>
            )}
            {(gem.activities?.length || gem.wildlife?.length) && <Section id="g-do" title="What to do and see">{list(gem.activities)}{gem.wildlife?.length > 0 && <><h3 className="small muted">Wildlife</h3>{list(gem.wildlife)}</>}</Section>}
            {(tour.weather || tour.sunrisePoints?.length || tour.sunsetPoints?.length) && (
              <Section id="g-wx" title="Weather, sunrise and sunset">
                {tour.weather && <p>{tour.weather} <Link to={`/weather/${gem.slug}?lat=${gem.lat}&lon=${gem.lon}&name=${encodeURIComponent(gem.name)}`}>Live forecast</Link></p>}
                {tour.sunrisePoints?.length > 0 && <p><Sunrise aria-hidden="true" className="inline-ico" /> Sunrise: {tour.sunrisePoints.join(', ')}</p>}
                {tour.sunsetPoints?.length > 0 && <p><Sunset aria-hidden="true" className="inline-ico" /> Sunset: {tour.sunsetPoints.join(', ')}</p>}
              </Section>
            )}
            {gem.videos?.length > 0 && <Section id="g-vid" title="Videos"><div className="gem-videos">{gem.videos.map((v) => <iframe key={v.youtubeId} title={v.title} loading="lazy" allowFullScreen src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`} />)}</div></Section>}
          </div>
          <aside className="gem-aside">
            <MapBox gem={gem} />
            {gem.costs && (
              <section className="card"><h2 className="card-title"><Wallet aria-hidden="true" className="inline-ico" /> Rough daily budget</h2>
                {gem.costs.domestic && <p><strong>Nepali travellers:</strong> {gem.costs.domestic.perDayNpr.map(npr).join(' – ')} per person/day{gem.costs.domestic.note && <span className="small muted"> — {gem.costs.domestic.note}</span>}</p>}
                {gem.costs.international && <p><strong>International:</strong> US${gem.costs.international.perDayUsd.join(' – ')} per person/day{gem.costs.international.note && <span className="small muted"> — {gem.costs.international.note}</span>}</p>}
                <p className="small muted" style={{ margin: 0 }}>Estimates for budgeting only.</p>
              </section>
            )}
            {gem.permits?.length > 0 && (
              <section className="card"><h2 className="card-title"><Landmark aria-hidden="true" className="inline-ico" /> Permits</h2>
                {gem.permits.map((p) => <p key={p.name}><strong>{p.name}.</strong> {p.note} {p.officialUrl && <a href={p.officialUrl} target="_blank" rel="noopener noreferrer">Official site</a>}</p>)}
                <p className="small" style={{ margin: 0 }}><Link to="/travel-guide#permits">More about permits and TIMS</Link></p>
              </section>
            )}
            {gem.localGuides && <section className="card"><h2 className="card-title"><Users aria-hidden="true" className="inline-ico" /> Local guides</h2><p style={{ margin: 0 }}>{gem.localGuides}</p></section>}
            {gem.safety?.length > 0 && <section className="card"><h2 className="card-title"><AlertTriangle aria-hidden="true" className="inline-ico" /> Safety</h2><ul className="gem-ul">{gem.safety.map((s) => <li key={s}>{s}</li>)}</ul><p className="small" style={{ margin: 0 }}><Link to="/emergency">Emergency numbers</Link></p></section>}
          </aside>
        </div>

        <Section id="g-itin" title="Suggested itineraries"><ItineraryPlanner onlyGem={gem.slug} /></Section>
        <Section id="g-stay" title="Where to stay"><StaysPanel gem={gem} /></Section>

        {nextGem && nextGem.slug !== gem.slug && <p className="gem-next"><Link to={`/hidden-gems/${nextGem.slug}`} className="btn btn-secondary">Next gem: {nextGem.name} →</Link></p>}
      </div>
    </article>
  );
}
