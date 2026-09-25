/**
 * Cache layer behind a small interface so Redis can replace the in-memory
 * store later without touching callers. Only public data is cached here.
 */
export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, ttlMs: number): Promise<number>;
}

export class MemoryCache implements Cache {
  private store = new Map<string, { v: unknown; exp: number }>();
  constructor(private maxEntries = 5000, private now: () => number = Date.now) {}
  async get<T>(key: string) {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.exp <= this.now()) { this.store.delete(key); return undefined; }
    return e.v as T;
  }
  async set<T>(key: string, value: T, ttlMs: number) {
    if (!this.store.has(key) && this.store.size >= this.maxEntries) this.store.delete(this.store.keys().next().value as string); // evict oldest
    this.store.set(key, { v: value, exp: this.now() + ttlMs });
  }
  async del(key: string) { this.store.delete(key); }
  async incr(key: string, ttlMs: number) {
    const e = this.store.get(key);
    const live = e && e.exp > this.now();
    const next = (live ? (e.v as number) : 0) + 1;
    this.store.set(key, { v: next, exp: live ? e.exp : this.now() + ttlMs });
    return next;
  }
}

/** Read-through helper with in-flight de-duplication (one upstream call per key at a time). */
const inflight = new Map<string, Promise<unknown>>();
export async function cached<T>(cache: Cache, key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== undefined) return hit;
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = load().then(async (v) => { await cache.set(key, v, ttlMs); return v; }).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export const cache: Cache = new MemoryCache();
