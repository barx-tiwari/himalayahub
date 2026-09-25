import { useMemo, useState } from 'react';
import { ArrowLeftRight, CalendarDays } from 'lucide-react';
import Segmented from '../ui/Segmented';
import Alert from '../ui/Alert';
import {
  AD_MAX, AD_MIN, AD_MONTHS, BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTHS, VERIFIED_UNTIL_BS, WEEKDAYS, WEEKDAYS_NP,
  adToBs, bsToAd, formatAdLong, formatBsLong, formatBsNepali, formatIso, toNepaliDigits, todayAd,
} from '../../utils/nepaliDate';

const DIRECTIONS = [{ id: 'ad2bs', label: 'English → Nepali' }, { id: 'bs2ad', label: 'Nepali → English' }];

export default function DateConverter() {
  const [dir, setDir] = useState('ad2bs');
  const [input, setInput] = useState(() => { const t = todayAd(); return { year: String(t.year), month: t.month, day: String(t.day) }; });

  const result = useMemo(() => {
    const y = Number(input.year); const m = Number(input.month); const d = Number(input.day);
    if (!input.year || !input.day) return { error: 'Enter a day, month and year.' };
    if (!Number.isInteger(y) || !Number.isInteger(d)) return { error: 'Day and year must be whole numbers.' };
    try {
      if (dir === 'ad2bs') {
        const bs = adToBs(y, m, d);
        return { ad: { year: y, month: m, day: d }, bs, weekday: bs.weekday };
      }
      if (y < BS_MIN_YEAR || y > BS_MAX_YEAR) return { error: `Nepali year must be between ${BS_MIN_YEAR} and ${BS_MAX_YEAR}.` };
      const ad = bsToAd(y, m, d);
      return { ad, bs: { year: y, month: m, day: d }, weekday: ad.weekday };
    } catch (err) {
      return { error: err.message || 'Something went wrong. Please try again.' };
    }
  }, [dir, input]);

  const swap = () => {
    if (result.error) { setDir((d) => (d === 'ad2bs' ? 'bs2ad' : 'ad2bs')); return; }
    const target = dir === 'ad2bs' ? result.bs : result.ad;
    setDir(dir === 'ad2bs' ? 'bs2ad' : 'ad2bs');
    setInput({ year: String(target.year), month: target.month, day: String(target.day) });
  };
  const setToday = () => {
    const t = todayAd();
    const v = dir === 'ad2bs' ? t : adToBs(t.year, t.month, t.day);
    setInput({ year: String(v.year), month: v.month, day: String(v.day) });
  };
  const changeDir = (d) => {
    if (d === dir) return;
    swap();
  };

  const isAd = dir === 'ad2bs';
  const months = isAd ? AD_MONTHS : BS_MONTHS;
  const beyondVerified = result.bs && result.bs.year > VERIFIED_UNTIL_BS;

  return (
    <div className="stack">
      <div className="row-between">
        <Segmented label="Conversion direction" options={DIRECTIONS} value={dir} onChange={changeDir} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={setToday}><CalendarDays aria-hidden="true" /> Use today</button>
      </div>
      <div className="converter">
        <section className="card" aria-labelledby="from-title">
          <h2 id="from-title" className="card-title">{isAd ? 'Gregorian Date (AD)' : 'Bikram Sambat Date (BS)'}</h2>
          <div className="date-inputs">
            <div className="field">
              <label htmlFor="dc-day">Day</label>
              <input id="dc-day" className="input" type="number" inputMode="numeric" min="1" max="32" value={input.day}
                onChange={(e) => setInput((s) => ({ ...s, day: e.target.value }))} aria-invalid={Boolean(result.error)} />
            </div>
            <div className="field">
              <label htmlFor="dc-month">Month</label>
              <select id="dc-month" className="select" value={input.month} onChange={(e) => setInput((s) => ({ ...s, month: Number(e.target.value) }))}>
                {months.map((m, i) => <option key={m} value={i + 1}>{String(i + 1).padStart(2, '0')} · {m}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="dc-year">Year</label>
              <input id="dc-year" className="input" type="number" inputMode="numeric" value={input.year}
                min={isAd ? AD_MIN.year : BS_MIN_YEAR} max={isAd ? AD_MAX.year : BS_MAX_YEAR}
                onChange={(e) => setInput((s) => ({ ...s, year: e.target.value }))} aria-invalid={Boolean(result.error)} />
            </div>
          </div>
          <p className="field-hint" style={{ marginTop: 10, marginBottom: 0 }}>
            Supported range: {isAd ? `${formatAdLong(AD_MIN)} – ${formatAdLong(AD_MAX)}` : `${BS_MIN_YEAR} – ${BS_MAX_YEAR} BS`}
          </p>
        </section>

        <button type="button" className="btn btn-secondary btn-icon converter-swap" onClick={swap} aria-label="Swap conversion direction"><ArrowLeftRight aria-hidden="true" /></button>

        <section className="card result-panel" aria-labelledby="to-title" aria-live="polite">
          <h2 id="to-title" className="card-title">{isAd ? 'Bikram Sambat Date (BS)' : 'Gregorian Date (AD)'}</h2>
          {result.error ? <Alert type="error"><p>{result.error}</p></Alert> : (
            <>
              <div className="result-big">{isAd ? formatBsLong(result.bs) : formatAdLong(result.ad)}</div>
              <div className="result-iso">{isAd ? formatIso(result.bs) : formatIso(result.ad)}</div>
              {isAd && <div className="np" style={{ fontSize: 'var(--fs-lg)' }}>{formatBsNepali(result.bs)}, {WEEKDAYS_NP[result.weekday]}</div>}
              <div className="small muted">{WEEKDAYS[result.weekday]}</div>
            </>
          )}
        </section>
      </div>

      {!result.error && (
        <div className="card card-flat">
          <p style={{ margin: 0 }} className="result-iso">
            {formatIso(isAd ? result.ad : result.bs)} {isAd ? 'AD' : 'BS'} &nbsp;↓&nbsp; {formatIso(isAd ? result.bs : result.ad)} {isAd ? 'BS' : 'AD'}
            <span className="np" style={{ marginLeft: 12 }}>({toNepaliDigits(formatIso(result.bs))})</span>
          </p>
        </div>
      )}
      {beyondVerified && (
        <Alert type="warning"><p>BS month lengths after {VERIFIED_UNTIL_BS} are projected and may change when the official calendar is published.</p></Alert>
      )}
    </div>
  );
}
