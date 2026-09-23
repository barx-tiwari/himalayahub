import DataState from '../components/live/DataState';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import Delta from '../components/live/Delta';
import { LineChart } from '../components/live/Charts';
import Disclaimer, { FINANCE_DISCLAIMER } from '../components/live/Disclaimer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNepse } from './Markets';
import { formatLocalDateTime, nepseSessionStatus } from '../services/timezoneService';

const n = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: d }) : '—');
const compact = (v) => (Number.isFinite(v) ? new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(v) : '—');

function StockTable({ title, rows, kind }) {
  return (
    <section className="card" aria-labelledby={`t-${kind}`}>
      <h2 id={`t-${kind}`} className="card-title">{title}</h2>
      {rows.length ? (
        <div className="table-wrap"><table className="table"><caption className="sr-only">{title}</caption>
          <thead><tr><th scope="col">Symbol</th><th scope="col">LTP</th><th scope="col">{kind === 'traded' ? 'Turnover' : 'Change'}</th></tr></thead>
          <tbody>{rows.map((s) => <tr key={s.symbol}><td><strong>{s.symbol}</strong>{s.name && <><br /><span className="small muted">{s.name}</span></>}</td><td>{n(s.ltp)}</td>
            <td>{kind === 'traded' ? `Rs ${compact(s.turnover)}` : <Delta value={s.change} percent={s.percentChange} />}</td></tr>)}</tbody></table></div>
      ) : <p className="small muted" style={{ margin: 0 }}>Not provided by the data source.</p>}
    </section>
  );
}

export default function Nepse() {
  useDocumentTitle('NEPSE');
  const feed = useNepse();
  const session = nepseSessionStatus();
  return (
    <div className="container page" data-domain="markets">
      <header className="page-header">
        <h1>Nepal Stock Exchange (NEPSE)</h1>
        <p>Index, turnover, top movers and sectors from the connected market-data provider. Regular trading hours are Sunday–Thursday, 11:00–15:00 Nepal time.</p>
      </header>
      <Disclaimer>{FINANCE_DISCLAIMER} HimalayaHub does not tell anyone which shares to buy or sell.</Disclaimer>
      <div style={{ marginTop: 16 }}><LiveDataRefresh feed={feed} sourceLabel="Market source" /></div>
      <div style={{ marginTop: 12 }}>
        <DataState feed={feed}>
          {(d) => (
            <div className="stack">
              <section className="card index-hero" aria-labelledby="idx-title">
                <div>
                  <h2 id="idx-title" className="stat-label" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-sm)', margin: 0 }}>NEPSE Index</h2>
                  <div className="price-big">{n(d.index.value)}</div>
                  <Delta value={d.index.change} percent={d.index.percentChange} />
                  <p className="src-note" style={{ marginTop: 8 }}>Last Updated: {d.asOf ? formatLocalDateTime(d.asOf) : 'not provided'} · Market status: {d.marketStatus || `${session.label}, based on regular trading hours`}</p>
                </div>
                <div className="kv-grid">
                  <div className="stat"><span className="stat-label">Turnover</span><span className="stat-value">Rs {compact(d.turnover)}</span></div>
                  <div className="stat"><span className="stat-label">Volume</span><span className="stat-value">{compact(d.volume)}</span></div>
                  <div className="stat"><span className="stat-label">Transactions</span><span className="stat-value">{n(d.transactions, 0)}</span></div>
                </div>
              </section>
              {d.history?.length > 1 && (
                <section className="card" aria-labelledby="hist-title"><h2 id="hist-title" className="card-title">Index history</h2>
                  <LineChart points={d.history.map((h) => ({ label: h.date.slice(5), value: h.value }))} title="NEPSE index history" format={(v) => v.toFixed(0)} /></section>
              )}
              <div className="grid grid-3">
                <StockTable title="Top gainers" rows={d.gainers || []} kind="gainers" />
                <StockTable title="Top losers" rows={d.losers || []} kind="losers" />
                <StockTable title="Most traded" rows={d.mostTraded || []} kind="traded" />
              </div>
              <section className="card" aria-labelledby="sec-title">
                <h2 id="sec-title" className="card-title">Sectors</h2>
                {d.sectors?.length ? (
                  <div className="table-wrap"><table className="table"><caption className="sr-only">Sector indices</caption>
                    <thead><tr><th scope="col">Sector</th><th scope="col">Index</th><th scope="col">Change</th></tr></thead>
                    <tbody>{d.sectors.map((s) => <tr key={s.name}><td>{s.name}</td><td>{n(s.value)}</td><td><Delta value={s.change} percent={s.percentChange} /></td></tr>)}</tbody></table></div>
                ) : <p className="small muted" style={{ margin: 0 }}>Not provided by the data source.</p>}
              </section>
            </div>
          )}
        </DataState>
      </div>
      <p className="src-note section">There is no official public NEPSE API. This dashboard shows data only from a provider the site owner has connected; see README → NEPSE.</p>
    </div>
  );
}
