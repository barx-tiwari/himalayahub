import DataState from '../components/live/DataState';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import Delta from '../components/live/Delta';
import Disclaimer, { FINANCE_DISCLAIMER } from '../components/live/Disclaimer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGold } from './Markets';
import { safeUrl } from '../utils/safe';

const rs = (n, d = 0) => (Number.isFinite(n) ? `Rs ${n.toLocaleString(undefined, { maximumFractionDigits: d })}` : '—');
const usd = (n) => (Number.isFinite(n) ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—');
const SrcLink = ({ name, url }) => (safeUrl(url) ? <a href={url} target="_blank" rel="noopener noreferrer">{name}</a> : <span>{name}</span>);

export default function Gold() {
  useDocumentTitle('Gold & Precious Metals');
  const feed = useGold();
  return (
    <div className="container page" data-domain="markets">
      <header className="page-header">
        <h1>Gold &amp; Precious Metals</h1>
        <p>Nepal&apos;s daily gold and silver rates and the international spot price. 1 tola = 11.6638 grams.</p>
      </header>
      <p className="demo-banner" style={{ background: 'var(--warning-soft)' }}>Market data may be delayed.</p>
      <LiveDataRefresh feed={feed} sourceLabel="Market sources" />
      <div style={{ marginTop: 16 }}>
        <DataState feed={feed}>
          {(d) => (
            <div className="stack">
              <section aria-labelledby="np-title">
                <div className="section-title"><h2 id="np-title">Nepal (FENEGOSIDA rate)</h2></div>
                {d.nepal?.error ? <p className="data-state compact" style={{ margin: 0 }}>Nepal rates are currently unavailable.</p> : (
                  <>
                    <div className="metal-grid">
                      <article className="card metal-card"><span className="unit">Fine gold (9999) per tola</span><span className="price-big">{rs(d.nepal.fineGoldTola)}</span><span className="small">Change: <Delta value={d.nepal.change} percent={d.nepal.percentChange} /></span></article>
                      <article className="card metal-card"><span className="unit">Fine gold per gram</span><span className="price-big">{rs(d.nepal.fineGoldGram, 2)}</span><span className="small muted">Calculated from the source&apos;s {d.nepal.gramFrom || 'published rate'}</span></article>
                      <article className="card metal-card"><span className="unit">Tejabi gold per tola</span><span className="price-big">{rs(d.nepal.tejabiGoldTola)}</span>{d.nepal.tejabiGoldTola == null && <span className="small muted">Not published today</span>}</article>
                      <article className="card metal-card"><span className="unit">Silver per tola</span><span className="price-big">{rs(d.nepal.silverTola)}</span><span className="small muted">Per gram: {rs(d.nepal.silverGram, 2)}</span></article>
                    </div>
                    <p className="src-note" style={{ marginTop: 8 }}>Market source: <SrcLink name={d.nepal.source} url={d.nepal.sourceUrl} />. {d.nepal.change == null && 'The source does not publish a daily change figure. '}Jewellers add making charges and VAT, so shop prices are higher.</p>
                  </>
                )}
              </section>
              <section aria-labelledby="intl-title">
                <div className="section-title"><h2 id="intl-title">International spot (USD per troy ounce)</h2></div>
                {d.international?.error ? <p className="data-state compact" style={{ margin: 0 }}>{d.international.error === 'not_configured' ? 'International prices are not connected on this site yet.' : 'International prices are currently unavailable.'}</p> : (
                  <>
                    <div className="metal-grid">
                      {[d.international.gold, d.international.silver].filter(Boolean).map((m) => (
                        <article key={m.name} className="card metal-card"><span className="unit">{m.name}</span><span className="price-big">{usd(m.price)}</span><span className="small"><Delta value={m.change} percent={m.percentChange} /></span>
                          {m.perGram24k && <span className="small muted">24K per gram: {usd(m.perGram24k)}</span>}</article>
                      ))}
                    </div>
                    <p className="src-note" style={{ marginTop: 8 }}>Market source: <SrcLink name={d.international.source} url={d.international.sourceUrl} />.</p>
                  </>
                )}
                {d.reference && d.fx?.sell && (
                  <p className="small" style={{ marginTop: 12 }}>For reference: the international gold price converted at Nepal Rastra Bank&apos;s USD selling rate ({rs(d.fx.sell, 2)}, {d.fx.date}) is about <strong>{rs(d.reference.goldNprPerTola)}</strong> per tola. This excludes import duty, VAT and dealer margins, so it is not the Nepal market price.</p>
                )}
              </section>
            </div>
          )}
        </DataState>
      </div>
      <Disclaimer className="section">{FINANCE_DISCLAIMER}</Disclaimer>
    </div>
  );
}
