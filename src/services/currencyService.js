import { requestJSON } from './apiClient';
import { SAMPLE_RATES_USD } from '../data/currencies';

const API_URL = import.meta.env.VITE_CURRENCY_API_URL || '';

export const isLiveCurrencyConfigured = () => Boolean(API_URL);

/**
 * Returns { rates, base, source: 'live' | 'sample', updatedAt }.
 * rates are "units of currency per 1 base".
 * Throws if a live API is configured but cannot be reached; the UI then shows
 * an error and lets the user choose the clearly labelled sample data instead.
 */
export async function getRates(base = 'USD') {
  if (!API_URL) return getSampleRates(base);

  const url = API_URL.replace('{base}', encodeURIComponent(base));
  const data = await requestJSON(url);
  const rates = data.rates || data.conversion_rates;
  if (!rates || typeof rates !== 'object') throw new Error('Unexpected response from the exchange-rate API.');
  const updatedAt = data.time_last_update_utc || data.date || (data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString());
  return { rates: { ...rates, [base]: 1 }, base, source: 'live', updatedAt };
}

export function getSampleRates(base = 'USD') {
  const perUsd = SAMPLE_RATES_USD;
  const baseValue = perUsd[base];
  const rates = Object.fromEntries(Object.entries(perUsd).map(([code, v]) => [code, v / baseValue]));
  return { rates, base, source: 'sample', updatedAt: null };
}

export function convert(amount, from, to, ratesData) {
  const { rates } = ratesData;
  if (!(from in rates) || !(to in rates)) return null;
  // rates are per 1 base: amount(from) -> base -> to
  return (amount / rates[from]) * rates[to];
}
