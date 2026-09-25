/**
 * useLiveDataRefresh — the reusable "LiveDataRefresh" system.
 *
 *   const feed = useLiveDataRefresh('crypto:markets', getMarkets, {
 *     interval: REFRESH.crypto.base,        // normal refresh
 *     liveInterval: 60_000,                 // faster while isLive(data) is true
 *     isLive: (data) => data.some(m => m.live),
 *   });
 *
 * The fetcher must resolve to { data, meta } where meta describes the source:
 *   { source, sourceUrl?, dataAsOf?, realtime?: boolean, demo?: boolean }
 *
 * Behaviour:
 * - Shows the last cached copy instantly (marked fromCache) while refreshing.
 * - Deduplicates identical requests made by several widgets at once.
 * - Pauses while the tab is hidden; refreshes on return if data is stale.
 * - Backs off after failures (1, 2, 4 … minutes, capped at the interval).
 * - Never throws into React: errors are returned so the UI can explain them.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { readCache, writeCache } from '../services/liveCache';

const memory = new Map(); // key -> { data, meta, updatedAt }
const inflight = new Map(); // key -> Promise

function run(key, fetcher) {
  if (inflight.has(key)) return inflight.get(key);
  const p = Promise.resolve()
    .then(fetcher)
    .then((result) => {
      if (!result || typeof result !== 'object' || !('data' in result)) throw new Error('Invalid data returned by service.');
      const entry = { data: result.data, meta: result.meta || {}, updatedAt: Date.now() };
      memory.set(key, entry);
      if (!result.meta?.demo && !result.meta?.noCache) writeCache(key, entry.data, entry.meta);
      return entry;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export function useLiveDataRefresh(key, fetcher, { interval = 10 * 60_000, liveInterval, isLive, enabled = true } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;

  const initial = () => {
    const mem = memory.get(key);
    if (mem) return { data: mem.data, meta: mem.meta, updatedAt: mem.updatedAt, fromCache: false, error: null };
    const cached = readCache(key);
    if (cached) return { data: cached.data, meta: cached.meta, updatedAt: cached.savedAt, fromCache: true, error: null };
    return { data: null, meta: null, updatedAt: null, fromCache: false, error: null };
  };

  const [state, setState] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const failures = useRef(0);
  const timer = useRef(null);
  const mounted = useRef(true);
  const keyRef = useRef(key);

  // Reset when the key changes (e.g. a different location or league).
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      setState(initial());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const nextDelay = useCallback((data) => {
    if (failures.current > 0) return Math.min(interval, 60_000 * 2 ** (failures.current - 1));
    if (liveInterval && data != null && isLiveRef.current?.(data)) return liveInterval;
    return interval;
  }, [interval, liveInterval]);

  const load = useCallback(async ({ force = false } = {}) => {
    if (!enabled) return;
    const thisKey = key;
    const mem = memory.get(thisKey);
    // Another widget refreshed this very recently: reuse its result.
    if (!force && mem && Date.now() - mem.updatedAt < Math.min(interval / 2, 60_000)) {
      setState({ data: mem.data, meta: mem.meta, updatedAt: mem.updatedAt, fromCache: false, error: null });
      return;
    }
    setRefreshing(true);
    try {
      const entry = await run(thisKey, () => fetcherRef.current());
      failures.current = 0;
      if (mounted.current && keyRef.current === thisKey) setState({ data: entry.data, meta: entry.meta, updatedAt: entry.updatedAt, fromCache: false, error: null });
    } catch (error) {
      failures.current += 1;
      if (mounted.current && keyRef.current === thisKey) setState((s) => ({ ...s, error }));
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [enabled, key, interval]);

  // Schedule: first load, then a timer chain. Paused while hidden.
  useEffect(() => {
    mounted.current = true;
    if (!enabled) return undefined;
    let cancelled = false;
    const schedule = (data) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        if (cancelled) return;
        if (document.visibilityState === 'hidden') { schedule(data); return; }
        await load({ force: true });
        if (!cancelled) schedule(memory.get(key)?.data ?? data);
      }, nextDelay(data));
    };
    load().then(() => { if (!cancelled) schedule(memory.get(key)?.data ?? null); });

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const mem = memory.get(key);
      if (!mem || Date.now() - mem.updatedAt > nextDelay(mem.data)) load({ force: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, key, load, nextDelay]);

  useEffect(() => () => { mounted.current = false; }, []);

  const refresh = useCallback(() => { failures.current = 0; return load({ force: true }); }, [load]);

  let status = 'loading';
  if (!enabled) status = 'idle';
  else if (state.data != null) status = 'success';
  else if (state.error) status = 'error';

  return { ...state, status, refreshing, refresh };
}
