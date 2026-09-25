import type { Response } from 'express';
import { pageMeta, type PageMeta } from '@himalayahub/shared';

/** Throw this anywhere; the error middleware turns it into the standard JSON envelope. */
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public errors?: { path: string; message: string }[]) {
    super(message);
  }
  static badRequest(msg = 'Invalid request', errors?: { path: string; message: string }[]) { return new ApiError(400, msg, 'BAD_REQUEST', errors); }
  static unauthorized(msg = 'Please sign in to continue.') { return new ApiError(401, msg, 'UNAUTHORIZED'); }
  static forbidden(msg = 'You do not have permission to do that.') { return new ApiError(403, msg, 'FORBIDDEN'); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg, 'NOT_FOUND'); }
  static conflict(msg: string) { return new ApiError(409, msg, 'CONFLICT'); }
  static tooMany(msg = 'Too many requests. Please wait and try again.') { return new ApiError(429, msg, 'RATE_LIMITED'); }
}

export const ok = <T>(res: Response, data: T, message = 'Success', status = 200) => res.status(status).json({ success: true, data, message });
export const created = <T>(res: Response, data: T, message = 'Created') => ok(res, data, message, 201);
export function paginated<T>(res: Response, items: T[], page: number, limit: number, total: number, extra: Record<string, unknown> = {}) {
  const meta: PageMeta & Record<string, unknown> = { ...pageMeta(page, limit, total), ...extra };
  return res.json({ success: true, data: items, meta, message: 'Success' });
}
