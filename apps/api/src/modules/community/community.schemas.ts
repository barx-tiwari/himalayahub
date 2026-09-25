import { z } from 'zod';

const text = (min: number, max: number) => z.string().trim().min(min, `Please write at least ${min} characters.`).max(max, `Keep it under ${max} characters.`);

export const listPostsQuery = z.object({
  sort: z.enum(['hot', 'new', 'top']).default('hot'),
  period: z.enum(['day', 'week', 'month', 'all']).default('week'),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createPostBody = z.object({
  title: text(6, 180),
  body: text(1, 10_000),
  linkUrl: z.string().trim().url('Enter a full link starting with https://').max(500)
    .refine((u) => /^https?:\/\//i.test(u), 'Only http(s) links are allowed.').optional().or(z.literal('').transform(() => undefined)),
});
export const editPostBody = z.object({ body: text(1, 10_000) });

export const createCommentBody = z.object({ body: text(1, 5_000), parentId: z.string().max(40).optional() });
export const voteBody = z.object({ value: z.union([z.literal(1), z.literal(0), z.literal(-1)]) });

export const reportBody = z.object({
  targetType: z.enum(['POST', 'COMMENT']),
  targetId: z.string().min(1).max(40),
  reason: z.enum(['SPAM', 'HARASSMENT', 'HATE', 'MISINFORMATION', 'PERSONAL_INFO', 'ILLEGAL', 'OTHER']),
  details: z.string().trim().max(1000).optional(),
});

export const moderateBody = z.object({
  action: z.enum(['approve', 'remove', 'restore', 'lock', 'unlock', 'pin', 'unpin']),
  reason: z.string().trim().max(300).optional(),
});
export const resolveReportBody = z.object({ status: z.enum(['ACTIONED', 'DISMISSED']), resolution: z.string().trim().max(300).optional() });
export const banBody = z.object({
  // Moderators ban by content, never by seeing a user id: the server resolves the author.
  targetType: z.enum(['POST', 'COMMENT']),
  targetId: z.string().min(1).max(40),
  communityOnly: z.boolean().default(true),
  days: z.number().int().min(1).max(3650).nullable().default(7), // null = permanent
  reason: z.string().trim().min(3).max(300),
});
