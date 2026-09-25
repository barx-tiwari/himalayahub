import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiError, ok } from '../../lib/http.js';
import { cache } from '../../lib/cache.js';
import { validate } from '../../middleware/validate.js';
import { requirePermission } from '../../middleware/auth.js';
import { audit } from '../../services/audit.js';
import { moderatorAuthorKey } from '../../lib/secrets.js';
import { banBody, moderateBody, resolveReportBody } from './community.schemas.js';

/**
 * Moderation API (permission comments.moderate: MODERATOR, ADMIN, SUPER_ADMIN).
 * Moderators see content, aliases and an opaque `authorKey` (same author ⇒ same key)
 * — never names, emails or user ids. Bans are issued against a piece of content and
 * the server resolves its author. Every action is written to the audit log.
 */
export const adminCommunityRoutes = Router();
adminCommunityRoutes.use(requirePermission('comments.moderate'));

const preview = (s: string) => (s.length > 400 ? `${s.slice(0, 400)}…` : s);

/** GET /api/admin/community/queue — held items + open reports, oldest first. */
adminCommunityRoutes.get('/queue', async (_req, res) => {
  const [posts, comments, reports] = await Promise.all([
    prisma.communityPost.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 100, include: { community: { select: { slug: true, name: true } } } }),
    prisma.communityComment.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 100, include: { post: { select: { id: true, title: true, community: { select: { slug: true, name: true } } } } } }),
    prisma.contentReport.groupBy({ by: ['targetType', 'targetId'], where: { status: 'OPEN' }, _count: { _all: true }, orderBy: { _count: { targetId: 'desc' } }, take: 100 }),
  ]);
  const reasons = await prisma.contentReport.findMany({ where: { status: 'OPEN' }, select: { targetType: true, targetId: true, reason: true, details: true }, take: 1000 });
  const reasonMap = new Map<string, { reason: string; details: string | null }[]>();
  reasons.forEach((r) => { const k = `${r.targetType}:${r.targetId}`; reasonMap.set(k, [...(reasonMap.get(k) || []), { reason: r.reason, details: r.details }]); });
  const count = (t: string, id: string) => reasons.filter((r) => r.targetType === t && r.targetId === id).length;

  const reportedPostIds = reports.filter((r) => r.targetType === 'POST').map((r) => r.targetId);
  const reportedCommentIds = reports.filter((r) => r.targetType === 'COMMENT').map((r) => r.targetId);
  const [rPosts, rComments] = await Promise.all([
    prisma.communityPost.findMany({ where: { id: { in: reportedPostIds } }, include: { community: { select: { slug: true, name: true } } } }),
    prisma.communityComment.findMany({ where: { id: { in: reportedCommentIds } }, include: { post: { select: { id: true, title: true, community: { select: { slug: true, name: true } } } } } }),
  ]);
  const postItem = (p: (typeof posts)[number]) => ({ type: 'POST' as const, id: p.id, community: p.community, alias: p.alias, authorKey: moderatorAuthorKey(p.authorId), title: p.title, body: preview(p.body), linkUrl: p.linkUrl, status: p.status, spamScore: p.spamScore, createdAt: p.createdAt, reports: reasonMap.get(`POST:${p.id}`) || [], reportCount: count('POST', p.id) });
  const commentItem = (c: (typeof comments)[number]) => ({ type: 'COMMENT' as const, id: c.id, postId: c.post.id, postTitle: c.post.title, community: c.post.community, alias: c.alias, authorKey: moderatorAuthorKey(c.authorId), body: preview(c.body), status: c.status, spamScore: c.spamScore, createdAt: c.createdAt, reports: reasonMap.get(`COMMENT:${c.id}`) || [], reportCount: count('COMMENT', c.id) });
  const seen = new Set<string>();
  const items = [...posts.map(postItem), ...comments.map(commentItem), ...rPosts.map(postItem), ...rComments.map(commentItem)]
    .filter((i) => { const k = `${i.type}:${i.id}`; if (seen.has(k)) return false; seen.add(k); return true; });
  return ok(res, { items, counts: { pending: posts.length + comments.length, reported: reports.length } });
});

async function adjustCommentCount(postId: string, delta: number) {
  if (delta) await prisma.communityPost.update({ where: { id: postId }, data: { commentCount: { increment: delta } } });
}

/** POST /api/admin/community/:type/:id/moderate — approve | remove | restore | lock | unlock | pin | unpin */
adminCommunityRoutes.post('/:type/:id/moderate', validate({ body: moderateBody }), async (req, res) => {
  const type = String(req.params.type).toUpperCase(); const id = String(req.params.id);
  const { action, reason } = req.body as { action: string; reason?: string };
  if (type === 'POST') {
    const p = await prisma.communityPost.findUnique({ where: { id } });
    if (!p || p.status === 'DELETED') throw ApiError.notFound();
    const data: Record<string, unknown> = {};
    if (action === 'approve' || action === 'restore') Object.assign(data, { status: 'VISIBLE', removedReason: null });
    else if (action === 'remove') Object.assign(data, { status: 'REMOVED', removedReason: reason ?? null, isPinned: false });
    else if (action === 'lock' || action === 'unlock') data.isLocked = action === 'lock';
    else if (action === 'pin' || action === 'unpin') { if (p.status !== 'VISIBLE' && action === 'pin') throw ApiError.badRequest('Only visible posts can be pinned.'); data.isPinned = action === 'pin'; }
    await prisma.communityPost.update({ where: { id }, data });
  } else if (type === 'COMMENT') {
    const c = await prisma.communityComment.findUnique({ where: { id } });
    if (!c || c.status === 'DELETED') throw ApiError.notFound();
    if (!['approve', 'restore', 'remove'].includes(action)) throw ApiError.badRequest('Comments can only be approved, restored or removed.');
    const next = action === 'remove' ? 'REMOVED' : 'VISIBLE';
    await prisma.communityComment.update({ where: { id }, data: { status: next, removedReason: action === 'remove' ? reason ?? null : null } });
    await adjustCommentCount(c.postId, c.status === 'VISIBLE' && next !== 'VISIBLE' ? -1 : c.status !== 'VISIBLE' && next === 'VISIBLE' ? 1 : 0);
  } else throw ApiError.badRequest('Unknown content type.');
  // Acting on an item closes its open reports.
  if (['approve', 'remove', 'restore'].includes(action)) {
    await prisma.contentReport.updateMany({ where: { targetType: type as 'POST' | 'COMMENT', targetId: id, status: 'OPEN' }, data: { status: action === 'remove' ? 'ACTIONED' : 'DISMISSED', resolvedById: req.user!.id, resolvedAt: new Date(), resolution: reason ?? action } });
  }
  await cache.del('cm:trending');
  await audit(req, `COMMUNITY_${action.toUpperCase()}`, `community.${type.toLowerCase()}`, id, { reason: reason ? 'provided' : undefined });
  return ok(res, null, 'Done.');
});

/** Resolve all open reports on an item without changing it. */
adminCommunityRoutes.post('/reports/:type/:id/resolve', validate({ body: resolveReportBody }), async (req, res) => {
  const type = String(req.params.type).toUpperCase() as 'POST' | 'COMMENT';
  const n = await prisma.contentReport.updateMany({ where: { targetType: type, targetId: String(req.params.id), status: 'OPEN' }, data: { status: req.body.status, resolution: req.body.resolution, resolvedById: req.user!.id, resolvedAt: new Date() } });
  await audit(req, 'COMMUNITY_REPORTS_RESOLVED', `community.${type.toLowerCase()}`, String(req.params.id), { status: req.body.status, count: n.count });
  return ok(res, { resolved: n.count });
});

/** Ban the author of a post/comment (identity stays hidden from the moderator). */
adminCommunityRoutes.post('/bans', validate({ body: banBody }), async (req, res) => {
  const b = req.body as { targetType: 'POST' | 'COMMENT'; targetId: string; communityOnly: boolean; days: number | null; reason: string };
  const target = b.targetType === 'POST'
    ? await prisma.communityPost.findUnique({ where: { id: b.targetId }, select: { authorId: true, communityId: true } })
    : await prisma.communityComment.findUnique({ where: { id: b.targetId }, select: { authorId: true, post: { select: { communityId: true } } } });
  if (!target) throw ApiError.notFound();
  const communityId = 'communityId' in target ? target.communityId : target.post.communityId;
  if (target.authorId === req.user!.id) throw ApiError.badRequest('You can’t ban yourself.');
  const author = await prisma.user.findUnique({ where: { id: target.authorId }, select: { role: true } });
  if (author && ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(author.role) && req.user!.role !== 'SUPER_ADMIN') throw ApiError.forbidden('Staff accounts can only be restricted by a super admin.');
  const ban = await prisma.communityBan.create({
    data: { userId: target.authorId, communityId: b.communityOnly ? communityId : null, reason: b.reason, expiresAt: b.days ? new Date(Date.now() + b.days * 86_400_000) : null, createdById: req.user!.id },
  });
  await audit(req, 'COMMUNITY_BAN', 'community.ban', ban.id, { scope: b.communityOnly ? 'community' : 'site', days: b.days });
  return ok(res, { id: ban.id, authorKey: moderatorAuthorKey(target.authorId), expiresAt: ban.expiresAt }, 'Author restricted.');
});
