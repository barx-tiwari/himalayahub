/** The JSON envelope every endpoint returns. */
export interface ApiSuccess<T> { success: true; data: T; message?: string; meta?: PageMeta & Record<string, unknown> }
export interface ApiFailure { success: false; message: string; code?: string; errors?: { path: string; message: string }[] }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PageMeta { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

export const PAGE_DEFAULT = 20;
export const PAGE_MAX = 100;

/** Parses ?page=&limit= safely: clamps, never throws, never returns huge pages. */
export function parsePage(q: { page?: unknown; limit?: unknown }, defaults = { limit: PAGE_DEFAULT }) {
  const n = (v: unknown, d: number) => { const x = Number.parseInt(String(v ?? ''), 10); return Number.isFinite(x) ? x : d; };
  const page = Math.max(1, n(q.page, 1));
  const limit = Math.min(PAGE_MAX, Math.max(1, n(q.limit, defaults.limit)));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function pageMeta(page: number, limit: number, total: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
