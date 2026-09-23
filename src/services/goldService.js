import { requestJSON } from './apiClient';
import { DEMO_MODE, LIVE_API_BASE } from './config';
import { num, isoDate } from '../utils/safe';

export const TOLA_GRAMS = 11.6638;

/** Nepal (FENEGOSIDA) + international (GoldAPI) + NRB USD rate, each part may be unavailable independently. */
export async function getMetals() {
  if (DEMO_MODE) {
    const { demoGold } = await import('./demo/fixtures');
    return { data: demoGold(), meta: { source: 'Demo data', demo: true } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/gold`, { timeoutMs: 15000 });
  const np = body.nepal || {};
  const intl = body.international || {};
  const data = {
    nepal: np.error ? { error: np.error } : {
      fineGoldTola: num(np.fineGoldTola), tejabiGoldTola: num(np.tejabiGoldTola), silverTola: num(np.silverTola),
      fineGoldGram: num(np.fineGoldGram), silverGram: num(np.silverGram), gramFrom: np.gramFrom,
      change: num(np.change), percentChange: num(np.percentChange), publishedAt: isoDate(np.publishedAt), source: np.source, sourceUrl: np.sourceUrl,
    },
    international: intl.error ? { error: intl.error } : intl,
    fx: body.fx?.error ? { error: body.fx.error } : body.fx,
    reference: body.reference || null,
  };
  return { data, meta: { source: [np.source && 'FENEGOSIDA', intl.source, body.fx?.source].filter(Boolean).join(', ') || 'Market sources', dataAsOf: isoDate(body.fetchedAt), realtime: false } };
}
