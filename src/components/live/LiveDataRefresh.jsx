import { RefreshCw } from 'lucide-react';
import { useNow } from '../../hooks/useNow';
import { relativeTime, formatLocalDateTime } from '../../services/timezoneService';
import { LIVE_MAX_AGE } from '../../services/config';
import { safeUrl } from '../../utils/safe';

/**
 * Status row shown on every live-data section: Live / Last updated, the
 * source (with link), and a manual refresh button.
 * "Live" only appears when the service marks its data realtime AND the data
 * is fresh AND the last refresh succeeded.
 */
export function isShowingLive(feed) {
  const asOf = feed.meta?.dataAsOf ? new Date(feed.meta.dataAsOf).getTime() : feed.updatedAt;
  return Boolean(feed.meta?.realtime && !feed.fromCache && !feed.error && asOf && Date.now() - asOf < LIVE_MAX_AGE);
}

export default function LiveDataRefresh({ feed, sourceLabel = 'Source', updatedLabel = 'Last updated', compact = false, className = '' }) {
  useNow(30_000); // keep "x minutes ago" current
  const live = feed.status === 'success' && isShowingLive(feed);
  const src = feed.meta?.source;
  const href = safeUrl(feed.meta?.sourceUrl);
  const when = feed.meta?.dataAsOf || feed.updatedAt;

  return (
    <div className={`live-bar ${className}`}>
      <div className="row">
        {live ? (
          <span className="live-pill"><span className="live-dot" aria-hidden="true" />Live</span>
        ) : when ? (
          <span className="live-pill" style={{ fontWeight: 400 }}><span className="stale-dot" aria-hidden="true" />
            <span title={formatLocalDateTime(when)}>{updatedLabel}: {relativeTime(when)}</span>
          </span>
        ) : null}
        {feed.fromCache && <span className="chip chip-warning">Saved copy</span>}
        {src && !compact && (
          <span>{sourceLabel}: {href ? <a href={href} target="_blank" rel="noopener noreferrer">{src}</a> : src}</span>
        )}
      </div>
      <button type="button" className={`btn btn-ghost btn-sm refresh-btn${feed.refreshing ? ' is-spinning' : ''}`}
        onClick={feed.refresh} disabled={feed.refreshing || feed.status === 'idle'} aria-label="Refresh data">
        <RefreshCw aria-hidden="true" /> {!compact && (feed.refreshing ? 'Refreshing…' : 'Refresh')}
      </button>
    </div>
  );
}
