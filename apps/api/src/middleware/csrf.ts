import type { NextFunction, Request, Response } from 'express';
import { safeEqual } from '../auth/tokens.js';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence for cookie-authenticated requests:
 * 1) state-changing requests must come from an allowed Origin (or same-origin Referer), and
 * 2) must echo the readable CSRF cookie in the X-CSRF-Token header (double-submit).
 * Requests without a session cookie (e.g. login/register) only need check 1.
 */
export function csrfProtection(opts: { allowedOrigins: string[]; sessionCookie: string; csrfCookie: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE.has(req.method)) return next();
    const hasSession = Boolean(req.cookies?.[opts.sessionCookie]);
    const url = (req.originalUrl || req.url || '').split('?')[0] || '';
    // Native apps send no Origin and no cookies. Such a request carries no ambient credentials a
    // third-party site could abuse, so CSRF does not apply. Browsers always send Origin on POST.
    if (!hasSession && !req.headers.origin && (req.get('authorization')?.startsWith('Bearer ') || url.startsWith('/api/auth/token'))) return next();
    // Sign in with Apple posts the result back from appleid.apple.com (response_mode=form_post);
    // that callback is protected by its own state + nonce check instead.
    if (url === '/api/auth/apple/callback' && req.headers.origin === 'https://appleid.apple.com') return next();
    const origin = req.headers.origin || (req.headers.referer ? safeOrigin(req.headers.referer) : undefined);
    if (!origin || !opts.allowedOrigins.includes(origin)) {
      return res.status(403).json({ success: false, message: 'Request origin not allowed.', code: 'BAD_ORIGIN' });
    }
    if (hasSession) {
      const cookie = req.cookies?.[opts.csrfCookie];
      const header = req.get('x-csrf-token');
      if (!cookie || !header || !safeEqual(String(cookie), String(header))) {
        return res.status(403).json({ success: false, message: 'Security check failed. Refresh the page and try again.', code: 'CSRF' });
      }
    }
    return next();
  };
}

export function safeOrigin(url: string): string | undefined {
  try { return new URL(url).origin; } catch { return undefined; }
}
