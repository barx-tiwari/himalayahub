/**
 * Central place for live-data configuration.
 *
 * Secret API keys NEVER go in VITE_ variables (those are bundled into the
 * browser JavaScript). Keyed providers are called through the serverless
 * proxy in /api, which reads its keys from server-side env vars.
 */

/** Base URL of the serverless proxy (same origin by default: /api/news, /api/football, …). */
export const LIVE_API_BASE = (import.meta.env.VITE_LIVE_API_BASE || '/api').replace(/\/$/, '');

/**
 * Demo data: only in `npm run dev`, only when VITE_DEMO_DATA=true.
 * Production builds can never show demo data, and every demo item is labelled.
 */
export const DEMO_MODE = Boolean(import.meta.env.DEV) && import.meta.env.VITE_DEMO_DATA === 'true';

/** Refresh intervals in milliseconds. `live` applies while the source reports live events. */
export const REFRESH = {
  news: { base: 10 * 60_000 },
  weather: { base: 30 * 60_000 },
  football: { base: 5 * 60_000, live: 60_000 },
  cricket: { base: 10 * 60_000, live: 2 * 60_000 }, // CricketData free plans have small daily quotas
  crypto: { base: 2 * 60_000 },
  nepse: { base: 30 * 60_000, live: 60_000 }, // `live` = during regular trading hours
  f1: { base: 60 * 60_000 },
};

/** How old data may be before we stop calling it "Live" (ms). */
export const LIVE_MAX_AGE = 5 * 60_000;
