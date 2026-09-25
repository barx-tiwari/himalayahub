/**
 * Crypto prices from CoinGecko's public API (no key, CORS-enabled).
 * Public endpoint rate limits are modest; the refresh system caches results.
 */
import { requestJSON, ApiError } from './apiClient';
import { DEMO_MODE } from './config';
import { cleanText, safeUrl, num, isoDate, arr } from '../utils/safe';

const URL_ = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h';

export async function getMarkets() {
  if (DEMO_MODE) {
    const { demoCrypto } = await import('./demo/fixtures');
    return { data: demoCrypto(), meta: { source: 'Demo data', demo: true } };
  }
  const raw = await requestJSON(URL_, { timeoutMs: 12000 });
  if (!Array.isArray(raw)) throw new ApiError('Unexpected crypto response.', 200, 'invalid');
  const coins = raw.map((c) => ({
    id: cleanText(c.id, 60), symbol: cleanText(c.symbol, 12).toUpperCase(), name: cleanText(c.name, 60), image: safeUrl(c.image),
    price: num(c.current_price), change24h: num(c.price_change_percentage_24h), high24h: num(c.high_24h), low24h: num(c.low_24h),
    marketCap: num(c.market_cap), volume: num(c.total_volume), sparkline: arr(c.sparkline_in_7d?.price).map(num).filter((v) => v != null),
    lastUpdated: isoDate(c.last_updated),
  })).filter((c) => c.id && c.price != null);
  const newest = coins.reduce((m, c) => (c.lastUpdated && c.lastUpdated > m ? c.lastUpdated : m), '');
  return { data: coins, meta: { source: 'CoinGecko', sourceUrl: 'https://www.coingecko.com/', dataAsOf: newest || null, realtime: Boolean(newest) } };
}

export function formatUsd(n) {
  if (!Number.isFinite(n)) return '—';
  const digits = n >= 1 ? 2 : n >= 0.01 ? 4 : 8;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: n >= 1 ? 2 : 0, maximumFractionDigits: digits })}`;
}
export function compactUsd(n) {
  if (!Number.isFinite(n)) return '—';
  return `$${new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n)}`;
}
