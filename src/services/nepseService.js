import { requestJSON } from './apiClient';
import { DEMO_MODE, LIVE_API_BASE } from './config';
import { isoDate } from '../utils/safe';
import { nepseSessionStatus } from './timezoneService';

export async function getNepse() {
  if (DEMO_MODE) {
    const { demoNepse } = await import('./demo/fixtures');
    return { data: demoNepse(), meta: { source: 'Demo data', demo: true } };
  }
  const body = await requestJSON(`${LIVE_API_BASE}/nepse`);
  const asOf = isoDate(body.asOf) || isoDate(body.fetchedAt);
  const open = body.marketStatus === 'OPEN' || (!body.marketStatus && nepseSessionStatus().open);
  return { data: body, meta: { source: body.source, sourceUrl: body.sourceUrl, dataAsOf: asOf, realtime: open } };
}

export const isNepseSession = () => nepseSessionStatus().open;
