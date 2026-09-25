import { Link } from 'react-router-dom';
import Delta from '../components/live/Delta';
import DataState from '../components/live/DataState';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import Disclaimer, { FINANCE_DISCLAIMER } from '../components/live/Disclaimer';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getMarkets, formatUsd } from '../services/cryptoService';
import { getNepse, isNepseSession } from '../services/nepseService';
import { REFRESH } from '../services/config';

export function useCrypto() { return useLiveDataRefresh('crypto:markets', getMarkets, { interval: REFRESH.crypto.base }); }
export function useNepse() { return useLiveDataRefresh('nepse', getNepse, { interval: REFRESH.nepse.base, liveInterval: REFRESH.nepse.live, isLive: () => isNepseSession() }); }

export default function Markets() {
  useDocumentTitle('Markets');
  const crypto = useCrypto();
  const nepse = useNepse();
  return (
    <div className="container page" data-domain="markets">
      <header className="page-header">
        <h1>Markets</h1>
        <p>The Nepal Stock Exchange and major cryptocurrencies — each with its source and update time.</p>
      </header>
      <Disclaimer>{FINANCE_DISCLAIMER}</Disclaimer>
      <div className="hub-grid section" style={{ marginTop: 20 }}>
        <section className="card hub-tile" aria-labelledby="m-crypto">
          <h2 id="m-crypto">Crypto</h2>
          <DataState feed={crypto} compact>{(coins) => { const b = coins.find((c) => c.symbol === 'BTC') || coins[0]; return <><span className="price-big">{formatUsd(b.price)}</span><span className="small">{b.name} · 24h <Delta percent={b.change24h} /></span></>; }}</DataState>
          <LiveDataRefresh feed={crypto} compact />
          <Link to="/crypto" className="btn btn-secondary btn-sm">View crypto market</Link>
        </section>
        <section className="card hub-tile" aria-labelledby="m-nepse">
          <h2 id="m-nepse">NEPSE</h2>
          <DataState feed={nepse} compact>{(d) => <><span className="price-big">{d.index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span><span className="small">NEPSE Index <Delta value={d.index.change} percent={d.index.percentChange} /></span></>}</DataState>
          <LiveDataRefresh feed={nepse} compact />
          <Link to="/nepse" className="btn btn-secondary btn-sm">View NEPSE dashboard</Link>
        </section>
      </div>
    </div>
  );
}
