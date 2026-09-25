import { useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import DataState from '../components/live/DataState';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import Delta from '../components/live/Delta';
import { Sparkline } from '../components/live/Charts';
import Disclaimer, { FINANCE_DISCLAIMER } from '../components/live/Disclaimer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCrypto } from './Markets';
import { compactUsd, formatUsd } from '../services/cryptoService';

const SORTS = { marketCap: 'Market cap', price: 'Price', change24h: '24h change' };

function Coin({ c }) {
  const [ok, setOk] = useState(Boolean(c.image));
  return <span className="coin">{ok ? <img src={c.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setOk(false)} /> : <span className="fallback-logo" aria-hidden="true">{c.symbol.slice(0, 2)}</span>}<span><strong>{c.name}</strong> <span className="muted small">{c.symbol}</span></span></span>;
}

export default function Crypto() {
  useDocumentTitle('Crypto Market');
  const feed = useCrypto();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'marketCap', dir: 'desc' });
  const toggle = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  const view = useMemo(() => {
    const list = (feed.data || []).filter((c) => `${c.name} ${c.symbol}`.toLowerCase().includes(q.trim().toLowerCase()));
    return [...list].sort((a, b) => ((a[sort.key] ?? -Infinity) - (b[sort.key] ?? -Infinity)) * (sort.dir === 'asc' ? 1 : -1));
  }, [feed.data, q, sort]);
  const SortTh = ({ k, children }) => (
    <th scope="col" aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="sort-btn" onClick={() => toggle(k)}>{children}<ArrowDownUp aria-hidden="true" /></button>
    </th>
  );
  return (
    <div className="container page" data-domain="markets">
      <header className="page-header">
        <h1>Crypto Market</h1>
        <p>Top 50 cryptocurrencies by market capitalisation, priced in US dollars, with 7-day mini charts.</p>
      </header>
      <Disclaimer>Cryptocurrency prices are volatile and this information is for informational purposes only. It is not a recommendation to buy or sell.</Disclaimer>
      <div className="toolbar" style={{ marginTop: 16 }}>
        <div className="field" style={{ maxWidth: 320 }}><label htmlFor="cq">Search crypto</label><SearchBar id="cq" value={q} onChange={setQ} label="Search crypto" placeholder="Bitcoin, ETH…" /></div>
        <div className="field"><label htmlFor="cs">Sort by</label>
          <select id="cs" className="select" value={sort.key} onChange={(e) => setSort({ key: e.target.value, dir: 'desc' })}>{Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      </div>
      <LiveDataRefresh feed={feed} sourceLabel="Market source" />
      <div className="card" style={{ marginTop: 12, padding: 0 }}>
        <DataState feed={feed}>
          {() => (view.length ? (
            <div className="table-wrap">
              <table className="table crypto-table">
                <caption className="sr-only">Cryptocurrency prices</caption>
                <thead><tr><th scope="col">#</th><th scope="col">Coin</th><SortTh k="price">Price</SortTh><SortTh k="change24h">24h</SortTh><th scope="col">24h high</th><th scope="col">24h low</th><SortTh k="marketCap">Market cap</SortTh><th scope="col">Volume (24h)</th><th scope="col">7 days</th></tr></thead>
                <tbody>
                  {view.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td><td><Coin c={c} /></td><td>{formatUsd(c.price)}</td><td><Delta percent={c.change24h} /></td>
                      <td>{formatUsd(c.high24h)}</td><td>{formatUsd(c.low24h)}</td><td>{compactUsd(c.marketCap)}</td><td>{compactUsd(c.volume)}</td>
                      <td className="spark-cell"><Sparkline values={c.sparkline} label={`${c.name} 7-day trend`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="muted" style={{ padding: 16, margin: 0 }}>No coins match “{q}”.</p>)}
        </DataState>
      </div>
      <Disclaimer className="section">{FINANCE_DISCLAIMER}</Disclaimer>
    </div>
  );
}
