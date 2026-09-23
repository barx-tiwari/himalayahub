/**
 * Keeps the last good response of each live feed in LocalStorage so pages
 * can show something useful (clearly marked with its age) when an API fails
 * or the device is offline. Only public, non-personal data is cached.
 */
import { readStorage, writeStorage } from '../utils/storage';

import { DEMO_MODE } from './config';

// Demo data never shares a cache with real data.
const PREFIX = DEMO_MODE ? 'live-demo:' : 'live:';
const MAX_AGE = 24 * 60 * 60_000; // never show cached live data older than a day

export function readCache(key) {
  const entry = readStorage(PREFIX + key, null);
  if (!entry || typeof entry !== 'object' || !entry.savedAt) return null;
  if (Date.now() - entry.savedAt > MAX_AGE) return null;
  return entry; // { data, meta, savedAt }
}

export function writeCache(key, data, meta) {
  writeStorage(PREFIX + key, { data, meta, savedAt: Date.now() });
}
