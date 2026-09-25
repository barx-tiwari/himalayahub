import type { NextFunction, Request, Response } from 'express';
import type { Cache } from '../lib/cache.js';

/**
 * Fixed-window limiter on top of the Cache interface (swap in Redis for multi-instance).
 * Sets standard RateLimit headers and Retry-After.
 */
export function rateLimit(opts: { cache: Cache; windowMs: number; max: number; key: (req: Request) => string; name: string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const bucket = Math.floor(Date.now() / opts.windowMs);
    const k = `rl:${opts.name}:${opts.key(req)}:${bucket}`;
    const count = await opts.cache.incr(k, opts.windowMs);
    const resetSec = Math.ceil(((bucket + 1) * opts.windowMs - Date.now()) / 1000);
    res.setHeader('RateLimit-Limit', String(opts.max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, opts.max - count)));
    res.setHeader('RateLimit-Reset', String(resetSec));
    if (count > opts.max) {
      res.setHeader('Retry-After', String(resetSec));
      return res.status(429).json({ success: false, message: 'Too many requests. Please wait and try again.', code: 'RATE_LIMITED' });
    }
    return next();
  };
}
