import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import { currencies } from '../../data/currencies';
import { convert, getRates, getSampleRates, isLiveCurrencyConfigured } from '../../services/currencyService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatDateTime, formatNumber } from '../../utils/format';

const byCode = Object.fromEntries(currencies.map((c) => [c.code, c]));

function CurrencySelect({ id, label, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {currencies.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code} · {c.name}</option>)}
      </select>
    </div>
  );
}

export default function CurrencyConverter() {
  const [prefs, setPrefs] = useLocalStorage('currency:prefs', { amount: '100', from: 'USD', to: 'NPR' });
  const [ratesData, setRatesData] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getRates('USD');
      setRatesData(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const amount = Number(prefs.amount);
  const validAmount = prefs.amount !== '' && Number.isFinite(amount) && amount >= 0;
  const result = useMemo(() => (ratesData && validAmount ? convert(amount, prefs.from, prefs.to, ratesData) : null), [ratesData, validAmount, amount, prefs.from, prefs.to]);
  const unitRate = ratesData ? convert(1, prefs.from, prefs.to, ratesData) : null;
  const inverse = ratesData ? convert(1, prefs.to, prefs.from, ratesData) : null;
  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));
  const digits = (v) => (v != null && Math.abs(v) < 1 ? 4 : 2);

  return (
    <div className="stack">
      {status === 'error' && (
        <Alert type="error" action={(
          <div className="row">
            <button type="button" className="btn btn-sm btn-secondary" onClick={load}><RefreshCw aria-hidden="true" /> Retry</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setRatesData(getSampleRates('USD')); setStatus('ready'); }}>Use sample rates</button>
          </div>
        )}>
          <p><strong>Unable to load exchange rates.</strong> Check your connection or the API settings, then retry.</p>
        </Alert>
      )}
      {ratesData?.source === 'sample' && (
        <Alert type="warning">
          <p><strong>Sample rates, not live.</strong> These approximate figures are for demonstration only. {isLiveCurrencyConfigured() ? 'The live API could not be reached.' : 'Add VITE_CURRENCY_API_URL to your .env file to show real exchange rates.'}</p>
        </Alert>
      )}

      <div className="card">
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="cc-amount">Amount</label>
          <input id="cc-amount" className="input currency-amount" type="number" inputMode="decimal" min="0" step="any"
            value={prefs.amount} onChange={(e) => set({ amount: e.target.value })} aria-invalid={!validAmount} aria-describedby="cc-amount-hint" />
          <span id="cc-amount-hint" className="field-hint">{validAmount ? `${byCode[prefs.from].name}` : 'Enter a positive number.'}</span>
        </div>
        <div className="converter">
          <CurrencySelect id="cc-from" label="From" value={prefs.from} onChange={(v) => set({ from: v })} />
          <button type="button" className="btn btn-secondary btn-icon converter-swap" style={{ alignSelf: 'end' }} onClick={() => set({ from: prefs.to, to: prefs.from })} aria-label="Swap currencies">
            <ArrowLeftRight aria-hidden="true" />
          </button>
          <CurrencySelect id="cc-to" label="To" value={prefs.to} onChange={(v) => set({ to: v })} />
        </div>
      </div>

      <section className="card result-panel" aria-live="polite" aria-labelledby="cc-result">
        <h2 id="cc-result" className="sr-only">Converted amount</h2>
        {status === 'loading' && <div className="row"><Spinner label="Loading exchange rates" /><span className="muted">Loading exchange rates…</span></div>}
        {status !== 'loading' && ratesData && (
          <>
            <span className="muted">{validAmount ? `${formatNumber(amount)} ${prefs.from} =` : ''}</span>
            <div className="result-big">{result != null ? `${formatNumber(result, digits(result))} ${prefs.to}` : '—'}</div>
            <div className="small">
              Exchange rate: 1 {prefs.from} = {formatNumber(unitRate, 4)} {prefs.to} · 1 {prefs.to} = {formatNumber(inverse, 4)} {prefs.from}
            </div>
            <div className="small muted">
              Last updated: {ratesData.source === 'live' ? `${formatDateTime(ratesData.updatedAt)} (live API)` : 'not live — sample data bundled with the app'}
            </div>
          </>
        )}
      </section>

      {ratesData && validAmount && (
        <section className="card table-wrap" aria-labelledby="rt-title">
          <h2 id="rt-title" className="card-title">{formatNumber(amount)} {prefs.from} in other currencies</h2>
          <table className="table rate-table">
            <thead><tr><th scope="col">Currency</th><th scope="col">Amount</th></tr></thead>
            <tbody>
              {currencies.filter((c) => c.code !== prefs.from).map((c) => {
                const v = convert(amount, prefs.from, c.code, ratesData);
                return <tr key={c.code}><td>{c.flag} {c.code} · {c.name}</td><td>{formatNumber(v, digits(v))}</td></tr>;
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
