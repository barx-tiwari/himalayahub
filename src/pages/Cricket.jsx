import { useState } from 'react';
import { Link } from 'react-router-dom';
import CricketCard from '../components/sports/CricketCard';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import Skeleton from '../components/live/Skeleton';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { classify, getCricketMatches, isCricketLive } from '../services/cricketService';
import { REFRESH } from '../services/config';
import { cricketCategories } from '../data/sportsConfig';

export default function Cricket() {
  useDocumentTitle('Cricket');
  const [cat, setCat] = useState('all');
  const feed = useLiveDataRefresh('cricket:current', getCricketMatches, {
    interval: REFRESH.cricket.base, liveInterval: REFRESH.cricket.live, isLive: (d) => d.some(isCricketLive),
  });
  return (
    <div className="container page" data-domain="sports">
      <header className="page-header">
        <h1>Cricket Center</h1>
        <p>Live, upcoming and completed matches with scores, overs and wickets as reported by the data provider.</p>
        <div className="header-actions"><Link className="btn btn-domain" to="/npl">Nepal Premier League</Link></div>
      </header>
      <div className="chip-tabs" role="group" aria-label="Cricket categories" style={{ marginBottom: 12 }}>
        {cricketCategories.map((c) => <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
      </div>
      <LiveDataRefresh feed={feed} />
      <div style={{ marginTop: 16 }}>
        <DataState feed={feed} title="Live score temporarily unavailable." skeleton={<Skeleton cards={3} label="Loading matches" />} emptyText="No matches reported right now.">
          {(matches) => {
            const list = cat === 'all' ? matches : matches.filter((m) => classify(m).has(cat));
            const groups = [
              ['Live matches', list.filter(isCricketLive)],
              ['Upcoming matches', list.filter((m) => !m.started)],
              ['Completed matches', list.filter((m) => m.ended)],
            ];
            if (!list.length) return <p className="muted">No {cricketCategories.find((c) => c.id === cat).label} matches in the current feed.</p>;
            return groups.map(([title, ms]) => ms.length > 0 && (
              <section key={title} className="section" aria-label={title} style={{ marginTop: 20 }}>
                <div className="section-title"><h2>{title}</h2><span className="small muted">{ms.length}</span></div>
                <div className="cric-grid">{ms.map((m) => <CricketCard key={m.id} m={m} />)}</div>
              </section>
            ));
          }}
        </DataState>
      </div>
      <p className="src-note" style={{ marginTop: 16 }}>Categories are assigned from the provider&apos;s match type and series name. Run rates and required rates are calculated from the provider&apos;s scores.</p>
    </div>
  );
}
