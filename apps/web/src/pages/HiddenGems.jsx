import { Link } from 'react-router-dom';
import { Compass, Info } from 'lucide-react';
import { GemCard, ItineraryPlanner } from '../components/gems/GemParts';
import { useHiddenGems } from '../hooks/useHiddenGems';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { HIDDEN_GEMS_DISCLAIMER } from '../data/hiddenGems';

export default function HiddenGems() {
  useDocumentTitle('Hidden Gems of Eastern Nepal');
  const { gems } = useHiddenGems();
  return (
    <div className="gems-page" data-domain="nepal">
      <header className="gems-intro">
        <div className="container">
          <p className="eyebrow">Koshi Province</p>
          <h1>Hidden Gems of Eastern Nepal</h1>
          <p className="lead">Sacred high lakes, rhododendron ridges, stone trading villages and a valley below Makalu — ten places most travellers never hear about.</p>
          <p className="small gems-note"><Info aria-hidden="true" className="inline-ico" /> {HIDDEN_GEMS_DISCLAIMER}</p>
        </div>
      </header>
      <div className="container page">
        <section aria-labelledby="gems-list"><h2 id="gems-list" className="sr-only">The ten places</h2>
          <div className="gem-grid">{gems.map((g) => <GemCard key={g.slug} gem={g} />)}</div>
        </section>
        <section className="section" aria-labelledby="gems-itin">
          <h2 id="gems-itin"><Compass aria-hidden="true" className="inline-ico" /> Suggested itineraries</h2>
          <p className="muted">Routes that combine several gems, for 3, 5, 7 or 14 days. Pick where you’re travelling from — international plans include flights and permit time.</p>
          <ItineraryPlanner />
        </section>
        <section className="section card card-flat">
          <h2 className="card-title">Plan with people who’ve been</h2>
          <p className="muted">Ask about trail conditions, jeeps and homestays in the <Link to="/community/c/trekking">Trekking community</Link>. Visiting from abroad? Start with the <Link to="/travel-guide">Travel Nepal guide</Link>.</p>
        </section>
      </div>
    </div>
  );
}
