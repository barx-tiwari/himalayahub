/**
 * Time zone helpers built on the browser's Intl API, which ships with real
 * IANA time zone data (including daylight saving rules). No API key needed.
 */
export function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getZonedParts(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23', weekday: 'short',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour) % 24, minute: Number(parts.minute), second: Number(parts.second), weekday: parts.weekday,
  };
}

/** Offset from UTC in minutes for a zone at a given instant. */
export function getOffsetMinutes(date, timeZone) {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

export function formatOffset(minutes) {
  const sign = minutes >= 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatZonedTime(date, timeZone, hour12) {
  const opts = { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' };
  // hourCycle h23 avoids "24:00" at midnight in some browsers.
  if (hour12) opts.hour12 = true; else opts.hourCycle = 'h23';
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

export function formatZonedDate(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

/* ------------------------------------------------------------------
   v2 additions: user-local formatting for live data and Nepal market
   hours. All times from APIs are stored as UTC ISO strings and only
   converted for display, in the viewer's own time zone.
   ------------------------------------------------------------------ */

export const userTimeZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
};

/** Short zone label for the viewer, e.g. "GMT+5:45". */
export function userZoneLabel(date = new Date()) {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(date).find((p) => p.type === 'timeZoneName');
    return part?.value || userTimeZone();
  } catch { return userTimeZone(); }
}

function toDate(v) {
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatLocalTime(value, { seconds = false } = {}) {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) });
}

export function formatLocalDate(value, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  const d = toDate(value);
  return d ? d.toLocaleDateString(undefined, opts) : '—';
}

export function formatLocalDateTime(value) {
  const d = toDate(value);
  return d ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

/** "just now", "5 minutes ago", "3 hours ago", "2 days ago" (or "in 4 hours"). */
export function relativeTime(value, now = Date.now()) {
  const d = toDate(value);
  if (!d) return '—';
  const diff = Math.round((d.getTime() - now) / 1000);
  const abs = Math.abs(diff);
  if (abs < 45) return diff <= 0 ? 'just now' : 'in a moment';
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const units = [['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of units) {
    if (abs >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return rtf.format(diff, 'second');
}

/** Local calendar day key (YYYY-MM-DD) in the viewer's zone. */
export function localDayKey(value) {
  const d = toDate(value);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * NEPSE regular trading session: Sunday–Thursday, 11:00–15:00 Nepal time.
 * This is only a schedule check. It does not know about public holidays or
 * unscheduled closures, so the UI labels it "based on regular trading hours".
 */
export function nepseSessionStatus(date = new Date()) {
  const p = getZonedParts(date, 'Asia/Kathmandu');
  const tradingDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(p.weekday);
  const mins = p.hour * 60 + p.minute;
  const open = tradingDay && mins >= 11 * 60 && mins < 15 * 60;
  return { open, tradingDay, label: open ? 'Open (regular hours)' : 'Closed (regular hours)' };
}
