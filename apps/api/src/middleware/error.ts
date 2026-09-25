import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/http.js';
import { logger } from '../lib/logger.js';
import { recordLog } from '../services/systemLog.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Endpoint not found.', code: 'NOT_FOUND' });
}

/** Last middleware: consistent envelope, no stack traces or internals leaked to clients. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.status >= 500) logger.error(err.message, { requestId: req.requestId, path: req.path });
    return res.status(err.status).json({ success: false, message: err.message, code: err.code, ...(err.errors ? { errors: err.errors } : {}) });
  }
  const e = err as { type?: string; status?: number; code?: string; message?: string };
  if (e?.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Malformed JSON body.', code: 'BAD_JSON' });
  if (e?.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Request body is too large.', code: 'TOO_LARGE' });
  if (e?.code === 'P2002') return res.status(409).json({ success: false, message: 'That value is already in use.', code: 'CONFLICT' });
  if (e?.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found.', code: 'NOT_FOUND' });
  logger.error('Unhandled error', { requestId: req.requestId, path: req.path, method: req.method, error: e?.message });
  void recordLog('ERROR', 'api', e?.message || 'Unhandled error', { path: req.path, method: req.method }, req.requestId);
  return res.status(500).json({ success: false, message: 'Something went wrong on our side. Please try again.', code: 'INTERNAL' });
}
