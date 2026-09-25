import { AlertTriangle, PlugZap, RefreshCw, WifiOff } from 'lucide-react';
import Skeleton from './Skeleton';
import { relativeTime } from '../../services/timezoneService';

const REASONS = {
  not_configured: 'This live feed is not connected on this site yet.',
  rate_limited: 'The data provider is limiting requests right now. Please try again in a minute.',
  auth: 'The data provider rejected this site\'s API key. It may have expired.',
  timeout: 'The data provider took too long to respond.',
  network: 'Your device appears to be offline, or the provider could not be reached.',
  invalid: 'The provider returned data in an unexpected format, so it was not shown.',
  upstream: 'The data provider is having problems.',
  http: 'The data provider returned an error.',
};

export function reasonFor(error) {
  return REASONS[error?.kind] || REASONS.http;
}

/**
 * Renders the right thing for a live feed:
 *  loading → skeleton, error without data → message + Retry,
 *  data with a failed refresh → children plus a "saved copy" notice,
 *  empty → emptyText.
 */
export default function DataState({
  feed, children, skeleton, title = 'Data temporarily unavailable.', isEmpty, emptyText = 'Nothing to show right now.', compact = false,
}) {
  if (feed.status === 'loading') return skeleton ?? <Skeleton lines={compact ? 2 : 4} />;

  if (feed.status === 'error') {
    const Icon = feed.error?.kind === 'not_configured' ? PlugZap : feed.error?.kind === 'network' ? WifiOff : AlertTriangle;
    const hint = feed.error?.kind === 'not_configured' && feed.error?.detail?.message;
    return (
      <div className={`data-state${compact ? ' compact' : ''}`} role="status">
        <h3><Icon aria-hidden="true" />{title}</h3>
        {!compact && <p>{reasonFor(feed.error)}</p>}
        {!compact && hint && <p className="small">Site owner: {hint}</p>}
        <button type="button" className="btn btn-secondary btn-sm" onClick={feed.refresh} disabled={feed.refreshing}>
          <RefreshCw aria-hidden="true" /> {feed.refreshing ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    );
  }

  const empty = typeof isEmpty === 'function' ? isEmpty(feed.data) : Array.isArray(feed.data) && feed.data.length === 0;
  return (
    <>
      {feed.meta?.demo && (compact
        ? <span className="chip chip-warning demo-chip" role="note" title="Sample values for layout testing, not real information.">Demo data</span>
        : <p className="demo-banner" role="note">Demo data — sample values for layout testing, not real information.</p>)}
      {feed.error && feed.data != null && (
        <p className="src-note" role="status" style={{ marginBottom: 8 }}>
          Could not refresh ({reasonFor(feed.error).replace(/\.$/, '').toLowerCase()}). Showing the copy from {relativeTime(feed.updatedAt)}.
        </p>
      )}
      {empty ? <p className="muted small" style={{ margin: 0 }}>{emptyText}</p> : children(feed.data, feed.meta)}
    </>
  );
}
