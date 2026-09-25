import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { ApiError } from '../lib/http.js';

/** Validates and replaces req.body / req.query / req.params. Frontend validation is never trusted. */
export function validate<S extends { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }>(schemas: S) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const part of ['params', 'query', 'body'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const r = schema.safeParse(req[part]);
      if (!r.success) {
        throw ApiError.badRequest('Please check the highlighted fields.', r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
      }
      if (part === 'query') Object.defineProperty(req, 'query', { value: r.data, writable: true }); // Express 5 query is a getter
      else (req as unknown as Record<string, unknown>)[part] = r.data;
    }
    next();
  };
}
export type Infer<T extends ZodTypeAny> = z.infer<T>;
