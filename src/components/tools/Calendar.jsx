import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Segmented from '../ui/Segmented';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  AD_MAX, AD_MIN, AD_MONTHS, BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTHS, BS_MONTHS_NP, VERIFIED_UNTIL_BS,
  WEEKDAYS, WEEKDAYS_NP_SHORT, WEEKDAYS_SHORT, adToBs, bsToAd, formatAdLong, formatBsLong, formatBsNepali,
  getAdMonthDays, getBsMonthDays, toNepaliDigits, todayAd,
} from '../../utils/nepaliDate';
import { eventsForAdDay, eventsForBsDay } from '../../data/festivals';

const MODES = [{ id: 'bs', label: 'Nepali Calendar' }, { id: 'ad', label: 'English Calendar' }];
const DAY = 86400000;

const safeBs = (ad) => { try { return adToBs(ad.year, ad.month, ad.day); } catch { return null; } };
const sameDay = (a, b) => a && b && a.year === b.year && a.month === b.month && a.day === b.day;
function addDays(ad, n) {
  const d = new Date(Date.UTC(ad.year, ad.month - 1, ad.day) + n * DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), weekday: d.getUTCDay() };
}
function inRange(ad) {
  const v = ad.year * 10000 + ad.month * 100 + ad.day;
  return v >= AD_MIN.year * 10000 + AD_MIN.month * 100 + AD_MIN.day && v <= AD_MAX.year * 10000 + AD_MAX.month * 100 + AD_MAX.day;
}
function viewFor(mode, ad) {
  if (mode === 'ad') return { year: ad.year, month: ad.month };
  const bs = adToBs(ad.year, ad.month, ad.day);
  return { year: bs.year, month: bs.month };
}
function eventsFor(ad, bs) {
  return [...(bs ? eventsForBsDay(bs.month, bs.day) : []), ...eventsForAdDay(ad.month, ad.day)];
}

/**
 * Dual Nepali (BS) / English (AD) month calendar.
 * All conversion goes through utils/nepaliDate.js, so a library or API can be
 * swapped in there without touching this component.
 */
export default function Calendar() {
  const today = useMemo(() => todayAd(), []);
  const [mode, setMode] = useLocalStorage('calendar:mode', 'bs');
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState(() => viewFor(mode, today));
  const gridRef = useRef(null);
  const focusAfter = useRef(false);

  const changeMode = (m) => { setMode(m); setView(viewFor(m, selected)); };

  const cells = useMemo(() => {
    const list = [];
    if (mode === 'bs') {
      const first = bsToAd(view.year, view.month, 1);
      const days = getBsMonthDays(view.year, view.month);
      for (let i = 0; i < days; i += 1) {
        const ad = addDays(first, i);
        list.push({ ad, bs: { year: view.year, month: view.month, day: i + 1 }, main: toNepaliDigits(i + 1), alt: ad.day === 1 ? `${AD_MONTHS[ad.month - 1].slice(0, 3)} 1` : ad.day });
      }
      return { lead: first.weekday, list };
    }
    const days = getAdMonthDays(view.year, view.month);
    for (let d = 1; d <= days; d += 1) {
      const ad = { year: view.year, month: view.month, day: d, weekday: new Date(Date.UTC(view.year, view.month - 1, d)).getUTCDay() };
      const bs = safeBs(ad);
      list.push({ ad, bs, main: d, alt: bs ? (bs.day === 1 ? `${BS_MONTHS[bs.month - 1].slice(0, 3)} 1` : bs.day) : '' });
    }
    return { lead: new Date(Date.UTC(view.year, view.month - 1, 1)).getUTCDay(), list };
  }, [mode, view]);

  const canPrev = mode === 'bs' ? !(view.year === BS_MIN_YEAR && view.month === 1) : (view.year * 12 + view.month) > (AD_MIN.year * 12 + AD_MIN.month);
  const canNext = mode === 'bs' ? !(view.year === BS_MAX_YEAR && view.month === 12) : (view.year * 12 + view.month) < (AD_MAX.year * 12 + AD_MAX.month);
  const shift = (n) => setView((v) => {
    let m = v.month + n; let y = v.year;
    if (m < 1) { m = 12; y -= 1; } if (m > 12) { m = 1; y += 1; }
    return { year: y, month: m };
  });
  const goToday = () => { setSelected(today); setView(viewFor(mode, today)); };

  const select = (ad) => {
    if (!inRange(ad) || !safeBs(ad)) return;
    setSelected(ad);
    setView(viewFor(mode, ad));
  };

  const onGridKey = (e) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (moves[e.key] != null) {
      e.preventDefault();
      focusAfter.current = true;
      select(addDays(selected, moves[e.key]));
    }
    if (e.key === 'Home') { e.preventDefault(); focusAfter.current = true; select(cells.list[0].ad); }
    if (e.key === 'End') { e.preventDefault(); focusAfter.current = true; select(cells.list[cells.list.length - 1].ad); }
  };
  useEffect(() => {
    if (focusAfter.current) { focusAfter.current = false; gridRef.current?.querySelector('[aria-pressed="true"]')?.focus(); }
  }, [selected, view]);

  const selectedBs = safeBs(selected);
  const selectedEvents = eventsFor(selected, selectedBs);
  const monthEvents = cells.list.flatMap((c) => eventsFor(c.ad, c.bs).map((ev) => ({ ...ev, c })));

  const firstCell = cells.list[0];
  const lastCell = cells.list[cells.list.length - 1];
  const title = mode === 'bs' ? `${BS_MONTHS[view.month - 1]} ${view.year}` : `${AD_MONTHS[view.month - 1]} ${view.year}`;
  const subtitle = mode === 'bs'
    ? `${BS_MONTHS_NP[view.month - 1]} ${toNepaliDigits(view.year)} · ${AD_MONTHS[firstCell.ad.month - 1]} – ${AD_MONTHS[lastCell.ad.month - 1]} ${lastCell.ad.year}`
    : firstCell.bs && lastCell.bs ? `${BS_MONTHS[firstCell.bs.month - 1]} – ${BS_MONTHS[lastCell.bs.month - 1]} ${lastCell.bs.year} BS` : '';

  const years = mode === 'bs'
    ? Array.from({ length: BS_MAX_YEAR - BS_MIN_YEAR + 1 }, (_, i) => BS_MIN_YEAR + i)
    : Array.from({ length: AD_MAX.year - AD_MIN.year + 1 }, (_, i) => AD_MIN.year + i);
  const monthNames = mode === 'bs' ? BS_MONTHS : AD_MONTHS;

  return (
    <div className="cal-layout">
      <section className="card" aria-labelledby="cal-title">
        <div className="cal-head">
          <h2 className="cal-title" id="cal-title" aria-live="polite">{title}<small className={mode === 'bs' ? 'np' : ''}>{subtitle}</small></h2>
          <Segmented label="Calendar type" options={MODES} value={mode} onChange={changeMode} />
        </div>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div className="row">
            <button type="button" className="btn btn-secondary btn-icon" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month"><ChevronLeft aria-hidden="true" /></button>
            <button type="button" className="btn btn-secondary" onClick={goToday}>Today</button>
            <button type="button" className="btn btn-secondary btn-icon" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month"><ChevronRight aria-hidden="true" /></button>
          </div>
          <div className="row">
            <label className="sr-only" htmlFor="cal-month">Month</label>
            <select id="cal-month" className="select" style={{ width: 'auto' }} value={view.month} onChange={(e) => setView((v) => ({ ...v, month: Number(e.target.value) }))}>
              {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <label className="sr-only" htmlFor="cal-year">Year</label>
            <select id="cal-year" className="select" style={{ width: 'auto' }} value={view.year}
              onChange={(e) => {
                const y = Number(e.target.value);
                setView((v) => {
                  if (mode === 'ad' && y === AD_MIN.year && v.month < AD_MIN.month) return { year: y, month: AD_MIN.month };
                  if (mode === 'ad' && y === AD_MAX.year && v.month > AD_MAX.month) return { year: y, month: AD_MAX.month };
                  return { ...v, year: y };
                });
              }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="cal-grid" aria-label="Days of the month" ref={gridRef} onKeyDown={onGridKey}>
          {WEEKDAYS_SHORT.map((d, i) => (
            <div key={d} aria-hidden="true" className={`cal-dow${i === 6 ? ' sat' : ''}`} aria-label={WEEKDAYS[i]}>
              {mode === 'bs' ? <span className="np">{WEEKDAYS_NP_SHORT[i]}</span> : d}
            </div>
          ))}
          {Array.from({ length: cells.lead }, (_, i) => <div key={`b${i}`} className="cal-blank" aria-hidden="true" />)}
          {cells.list.map((c) => {
            const isSel = sameDay(c.ad, selected);
            const evs = eventsFor(c.ad, c.bs);
            const usable = c.bs && inRange(c.ad);
            const cls = ['cal-cell', mode === 'bs' && 'bs-main', c.ad.weekday === 6 && 'sat', sameDay(c.ad, today) && 'is-today', isSel && 'is-selected'].filter(Boolean).join(' ');
            const label = `${formatAdLong(c.ad)}${c.bs ? `, ${formatBsLong(c.bs)} BS` : ''}, ${WEEKDAYS[c.ad.weekday]}${evs.length ? `, ${evs.map((e) => e.name).join(', ')}` : ''}${sameDay(c.ad, today) ? ', today' : ''}`;
            return (
              <button key={`${c.ad.year}-${c.ad.month}-${c.ad.day}`} type="button" className={cls} aria-pressed={isSel} aria-label={label}
                tabIndex={isSel ? 0 : -1} onClick={() => select(c.ad)} disabled={!usable}>
                <span className="d-main">{c.main}</span>
                <span className="d-alt">{c.alt}</span>
                {evs.length > 0 && <span className="dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
          Use arrow keys to move between days. Saturday (public holiday in Nepal) is shown in red. BS data verified up to {VERIFIED_UNTIL_BS} BS.
        </p>
      </section>

      <aside className="stack" aria-label="Selected date details">
        <div className="card">
          <h2 className="card-title">Selected date</h2>
          <div className="date-pair">
            <div className="dp">
              <span className="small muted">Gregorian (AD)</span>
              <strong>{formatAdLong(selected)}</strong>
              <span className="small">{WEEKDAYS[selected.weekday ?? new Date(Date.UTC(selected.year, selected.month - 1, selected.day)).getUTCDay()]}</span>
            </div>
            {selectedBs && (
              <div className="dp">
                <span className="small muted">Bikram Sambat (BS)</span>
                <strong>{formatBsLong(selectedBs)}</strong>
                <span className="np-line">{formatBsNepali(selectedBs)}</span>
              </div>
            )}
          </div>
          {selectedEvents.length > 0 && (
            <ul className="event-list" style={{ marginTop: 12 }}>
              {selectedEvents.map((e) => <li key={e.name}><span className="chip chip-accent">{e.holiday ? 'Holiday' : 'Observance'}</span>{e.name}</li>)}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="card-title">Festivals &amp; holidays this month</h2>
          {monthEvents.length ? (
            <ul className="event-list">
              {monthEvents.map((e) => (
                <li key={`${e.name}-${e.c.ad.day}`}>
                  <span className="ev-date">{mode === 'bs' ? `${BS_MONTHS[e.c.bs.month - 1].slice(0, 3)} ${e.c.bs.day}` : `${AD_MONTHS[e.c.ad.month - 1].slice(0, 3)} ${e.c.ad.day}`}</span>
                  <span>{e.name}{e.holiday && <span className="sr-only"> (public holiday)</span>}</span>
                </li>
              ))}
            </ul>
          ) : <p className="small muted" style={{ margin: 0 }}>No fixed-date observances this month.</p>}
          <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Lunar festivals such as Dashain, Tihar, Holi and Teej change date every year and are not shown. Connect an official calendar API in <code>src/data/festivals.js</code> to add them.
          </p>
        </div>
      </aside>
    </div>
  );
}
