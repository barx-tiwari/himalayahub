import { Router, type Request } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ok, created, paginated } from '../../lib/http.js';
import { cache, cached } from '../../lib/cache.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import * as svc from './community.service.js';
import { createCommentBody, createPostBody, editPostBody, listPostsQuery, reportBody, voteBody } from './community.schemas.js';

/**
 * Public community API. Anyone (including guests) can read; taking part needs a
 * verified account. Responses never include user ids, emails or names — only aliases.
 */
export const communityRoutes = Router();
const byUser = (req: Request) => req.user?.id || req.ip || 'anon';
const postLimit = rateLimit({ cache, name: 'cm-post', windowMs: 3_600_000, max: 5, key: byUser });
const commentLimit = rateLimit({ cache, name: 'cm-comment', windowMs: 3_600_000, max: 40, key: byUser });
const voteLimit = rateLimit({ cache, name: 'cm-vote', windowMs: 60_000, max: 90, key: byUser });
const reportLimit = rateLimit({ cache, name: 'cm-report', windowMs: 86_400_000, max: 25, key: byUser });
type ListQ = { sort: 'hot' | 'new' | 'top'; period: 'day' | 'week' | 'month' | 'all'; q?: string; page: number; limit: number };

communityRoutes.get('/communities', async (_req, res) => {
  const list = await cached(cache, 'cm:list', 60_000, async () => {
    const rows = await prisma.community.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    const counts = await prisma.communityPost.groupBy({ by: ['communityId'], where: { status: 'VISIBLE' }, _count: { _all: true } });
    const byId = new Map(counts.map((c) => [c.communityId, c._count._all]));
    return rows.map((c) => ({ slug: c.slug, name: c.name, description: c.description, icon: c.icon, rules: c.rules ?? [], postCount: byId.get(c.id) ?? 0 }));
  });
  return ok(res, list);
});

communityRoutes.get('/trending', async (_req, res) => ok(res, await cached(cache, 'cm:trending', 60_000, svc.trending)));

/** All communities (home feed) — also the search endpoint via ?q= */
communityRoutes.get('/posts', validate({ query: listPostsQuery }), async (req, res) => {
  const q = req.query as unknown as ListQ;
  const { items, total } = await svc.listPosts({ ...q, viewerId: req.user?.id });
  res.setHeader('Cache-Control', 'no-store');
  return paginated(res, items, q.page, q.limit, total);
});

communityRoutes.get('/c/:slug', async (req, res) => {
  const c = await svc.getCommunity(String(req.params.slug));
  return ok(res, { slug: c.slug, name: c.name, description: c.description, icon: c.icon, rules: c.rules ?? [] });
});

communityRoutes.get('/c/:slug/posts', validate({ query: listPostsQuery }), async (req, res) => {
  const c = await svc.getCommunity(String(req.params.slug));
  const q = req.query as unknown as ListQ;
  const { items, total } = await svc.listPosts({ ...q, communityId: c.id, viewerId: req.user?.id });
  res.setHeader('Cache-Control', 'no-store');
  return paginated(res, items, q.page, q.limit, total);
});

communityRoutes.post('/c/:slug/posts', requireAuth, postLimit, validate({ body: createPostBody }), async (req, res) => {
  const c = await svc.getCommunity(String(req.params.slug));
  const r = await svc.createPost(req.user!, c.id, req.body);
  return created(res, r, r.held ? 'Thanks! Your post is waiting for a quick moderator check.' : 'Posted.');
});

communityRoutes.get('/posts/:id', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return ok(res, await svc.getPost(String(req.params.id), req.user?.id));
});
communityRoutes.patch('/posts/:id', requireAuth, validate({ body: editPostBody }), async (req, res) => { await svc.editPost(req.user!, String(req.params.id), req.body.body); return ok(res, null, 'Updated.'); });
communityRoutes.delete('/posts/:id', requireAuth, async (req, res) => { await svc.deletePost(req.user!, String(req.params.id)); return ok(res, null, 'Deleted.'); });

communityRoutes.post('/posts/:id/comments', requireAuth, commentLimit, validate({ body: createCommentBody }), async (req, res) => {
  const r = await svc.createComment(req.user!, String(req.params.id), req.body);
  return created(res, r, r.held ? 'Your comment is waiting for a quick moderator check.' : 'Comment added.');
});
communityRoutes.delete('/comments/:id', requireAuth, async (req, res) => { await svc.deleteComment(req.user!, String(req.params.id)); return ok(res, null, 'Deleted.'); });

communityRoutes.post('/posts/:id/vote', requireAuth, voteLimit, validate({ body: voteBody }), async (req, res) => ok(res, await svc.vote(req.user!, 'POST', String(req.params.id), req.body.value)));
communityRoutes.post('/comments/:id/vote', requireAuth, voteLimit, validate({ body: voteBody }), async (req, res) => ok(res, await svc.vote(req.user!, 'COMMENT', String(req.params.id), req.body.value)));

communityRoutes.post('/reports', requireAuth, reportLimit, validate({ body: reportBody }), async (req, res) => {
  const r = await svc.report(req.user!, req.body);
  return created(res, r, r.alreadyReported ? 'You already reported this — thank you.' : 'Thanks. A moderator will review it.');
});
