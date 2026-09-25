import type { Prisma, VoteTarget } from '@prisma/client';
import type { SessionUser } from '../../auth/session.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/http.js';
import { aliasSecret } from '../../lib/secrets.js';
import { aliasFor, applyVote, buildTree, fingerprint, hotRank, MAX_COMMENT_DEPTH, spamScore } from './community.logic.js';

/** Reports from this many different people hide an item until a moderator reviews it. */
export const AUTO_HIDE_REPORTS = 3;

export async function getCommunity(slug: string) {
  const c = await prisma.community.findFirst({ where: { slug, isActive: true } });
  if (!c) throw ApiError.notFound('Community not found.');
  return c;
}

/** Posting requires a signed-in account with a confirmed email ("Verified user") and no active ban. */
export async function assertCanParticipate(user: SessionUser | undefined, communityId: string) {
  if (!user) throw ApiError.unauthorized('Sign in to take part. You can read everything as a guest.');
  if (!user.emailVerifiedAt) throw new ApiError(403, 'Please confirm your email address before posting.', 'EMAIL_NOT_VERIFIED');
  const now = new Date();
  const ban = await prisma.communityBan.findFirst({
    where: { userId: user.id, liftedAt: null, OR: [{ communityId: null }, { communityId }], AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }] },
    orderBy: { createdAt: 'desc' },
  });
  if (ban) throw new ApiError(403, ban.expiresAt ? `You can’t post here until ${ban.expiresAt.toISOString().slice(0, 10)}.` : 'You can’t post in this community.', 'BANNED');
}

async function spamCheck(user: SessionUser, title: string | undefined, body: string, linkUrl: string | null | undefined, kind: 'post' | 'comment') {
  const hourAgo = new Date(Date.now() - 3_600_000);
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { createdAt: true } });
  const recent = kind === 'post'
    ? await prisma.communityPost.findMany({ where: { authorId: user.id, createdAt: { gt: new Date(Date.now() - 86_400_000) } }, select: { body: true, createdAt: true }, take: 50 })
    : await prisma.communityComment.findMany({ where: { authorId: user.id, createdAt: { gt: new Date(Date.now() - 86_400_000) } }, select: { body: true, createdAt: true }, take: 100 });
  const fp = fingerprint(body);
  return spamScore({
    title, body, linkUrl,
    accountAgeHours: account ? (Date.now() - account.createdAt.getTime()) / 3_600_000 : 0,
    emailVerified: Boolean(user.emailVerifiedAt),
    recentPostsLastHour: recent.filter((r) => r.createdAt > hourAgo).length,
    duplicateOfRecent: fp.length > 20 && recent.some((r) => fingerprint(r.body) === fp),
  });
}

// ─────────────────────────── DTOs (never expose authorId) ───────────────────────────

type PostRow = Prisma.CommunityPostGetPayload<{ include: { community: { select: { slug: true; name: true; icon: true } } } }>;
export function toPublicPost(p: PostRow, viewerId?: string, myVote = 0, full = false) {
  const hidden = p.status === 'REMOVED' || p.status === 'DELETED';
  return {
    id: p.id, community: p.community, alias: hidden ? null : p.alias,
    title: p.status === 'DELETED' ? '[deleted]' : p.status === 'REMOVED' ? '[removed by a moderator]' : p.title,
    body: hidden ? '' : full ? p.body : p.body.slice(0, 280),
    truncated: !full && !hidden && p.body.length > 280,
    linkUrl: hidden ? null : p.linkUrl, score: p.score, commentCount: p.commentCount,
    status: p.status, isLocked: p.isLocked, isPinned: p.isPinned,
    createdAt: p.createdAt, editedAt: p.editedAt,
    isMine: Boolean(viewerId && viewerId === p.authorId), myVote,
  };
}

type CommentRow = { id: string; parentId: string | null; authorId: string; alias: string; body: string; depth: number; score: number; status: string; createdAt: Date; editedAt: Date | null };
export function toPublicComment(c: CommentRow, viewerId: string | undefined, opId: string, myVote = 0) {
  const hidden = c.status !== 'VISIBLE';
  return {
    id: c.id, parentId: c.parentId, depth: c.depth,
    alias: hidden ? null : c.alias, isOp: !hidden && c.authorId === opId,
    body: c.status === 'DELETED' ? '[deleted]' : c.status === 'REMOVED' ? '[removed by a moderator]' : c.status === 'PENDING' ? '[awaiting review]' : c.body,
    score: c.score, status: c.status, createdAt: c.createdAt, editedAt: c.editedAt,
    isMine: Boolean(viewerId && viewerId === c.authorId), myVote,
  };
}

async function myVotes(userId: string | undefined, targetType: VoteTarget, ids: string[]) {
  if (!userId || !ids.length) return new Map<string, number>();
  const rows = await prisma.communityVote.findMany({ where: { userId, targetType, targetId: { in: ids } }, select: { targetId: true, value: true } });
  return new Map(rows.map((r) => [r.targetId, r.value]));
}

// ─────────────────────────────────── Posts ───────────────────────────────────

const PERIOD_MS = { day: 86_400_000, week: 7 * 86_400_000, month: 30 * 86_400_000, all: 0 } as const;
const postInclude = { community: { select: { slug: true, name: true, icon: true } } } as const;

export async function listPosts(opts: { communityId?: string; sort: 'hot' | 'new' | 'top'; period: keyof typeof PERIOD_MS; q?: string; page: number; limit: number; viewerId?: string }) {
  const where: Prisma.CommunityPostWhereInput = {
    status: 'VISIBLE',
    ...(opts.communityId ? { communityId: opts.communityId } : { community: { isActive: true } }),
    ...(opts.sort === 'top' && PERIOD_MS[opts.period] ? { createdAt: { gt: new Date(Date.now() - PERIOD_MS[opts.period]) } } : {}),
    ...(opts.q ? { OR: [{ title: { contains: opts.q } }, { body: { contains: opts.q } }] } : {}),
  };
  const orderBy: Prisma.CommunityPostOrderByWithRelationInput[] = opts.sort === 'new' ? [{ createdAt: 'desc' }]
    : opts.sort === 'top' ? [{ score: 'desc' }, { createdAt: 'desc' }]
    : [...(opts.communityId ? [{ isPinned: 'desc' as const }] : []), { hotRank: 'desc' }];
  const [rows, total] = await Promise.all([
    prisma.communityPost.findMany({ where, include: postInclude, orderBy, skip: (opts.page - 1) * opts.limit, take: opts.limit }),
    prisma.communityPost.count({ where }),
  ]);
  const votes = await myVotes(opts.viewerId, 'POST', rows.map((r) => r.id));
  return { items: rows.map((r) => toPublicPost(r, opts.viewerId, votes.get(r.id) ?? 0)), total };
}

export async function getPost(id: string, viewerId?: string) {
  const p = await prisma.communityPost.findUnique({ where: { id }, include: postInclude });
  // Pending posts are visible only to their author (so they know it's waiting for review).
  if (!p || (p.status === 'PENDING' && p.authorId !== viewerId)) throw ApiError.notFound('Post not found.');
  const comments = await prisma.communityComment.findMany({
    where: { postId: id }, orderBy: { createdAt: 'asc' }, take: 1000,
    select: { id: true, parentId: true, authorId: true, alias: true, body: true, depth: true, score: true, status: true, createdAt: true, editedAt: true },
  });
  // Hide removed/pending comments unless they have visible replies (then keep a placeholder so threads stay intact).
  const hasVisibleChild = new Set(comments.filter((c) => c.status === 'VISIBLE' && c.parentId).map((c) => c.parentId!));
  const shown = comments.filter((c) => c.status === 'VISIBLE' || hasVisibleChild.has(c.id) || c.authorId === viewerId);
  const [pv, cv] = await Promise.all([myVotes(viewerId, 'POST', [p.id]), myVotes(viewerId, 'COMMENT', shown.map((c) => c.id))]);
  return {
    post: toPublicPost(p, viewerId, pv.get(p.id) ?? 0, true),
    comments: buildTree(shown.map((c) => toPublicComment(c, viewerId, p.authorId, cv.get(c.id) ?? 0))),
  };
}

export async function createPost(user: SessionUser, communityId: string, input: { title: string; body: string; linkUrl?: string }) {
  await assertCanParticipate(user, communityId);
  const spam = await spamCheck(user, input.title, input.body, input.linkUrl, 'post');
  const now = new Date();
  const post = await prisma.communityPost.create({
    data: {
      communityId, authorId: user.id, alias: aliasFor(aliasSecret(), user.id, communityId),
      title: input.title, body: input.body, linkUrl: input.linkUrl ?? null,
      spamScore: spam.score, status: spam.hold ? 'PENDING' : 'VISIBLE', hotRank: hotRank(0, 0, now), createdAt: now,
    },
    include: postInclude,
  });
  return { post: toPublicPost(post, user.id, 0, true), held: spam.hold, personalInfo: spam.personalInfo };
}

async function ownPost(user: SessionUser, id: string) {
  const p = await prisma.communityPost.findUnique({ where: { id } });
  if (!p || p.status === 'DELETED') throw ApiError.notFound('Post not found.');
  if (p.authorId !== user.id) throw ApiError.forbidden('You can only change your own posts.');
  return p;
}
export async function editPost(user: SessionUser, id: string, body: string) {
  const p = await ownPost(user, id);
  if (p.status === 'REMOVED') throw ApiError.forbidden('A moderator removed this post.');
  await prisma.communityPost.update({ where: { id }, data: { body, editedAt: new Date() } });
}
export async function deletePost(user: SessionUser, id: string) {
  await ownPost(user, id);
  // Content is wiped, not just hidden: an author's delete is final.
  await prisma.communityPost.update({ where: { id }, data: { status: 'DELETED', body: '', linkUrl: null, isPinned: false } });
}

// ───────────────────────────────── Comments ─────────────────────────────────

export async function createComment(user: SessionUser, postId: string, input: { body: string; parentId?: string }) {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post || post.status !== 'VISIBLE') throw ApiError.notFound('Post not found.');
  if (post.isLocked) throw new ApiError(403, 'This discussion is locked.', 'LOCKED');
  await assertCanParticipate(user, post.communityId);
  let depth = 0;
  if (input.parentId) {
    const parent = await prisma.communityComment.findUnique({ where: { id: input.parentId }, select: { postId: true, depth: true, status: true } });
    if (!parent || parent.postId !== postId || parent.status !== 'VISIBLE') throw ApiError.badRequest('That comment is no longer available.');
    depth = Math.min(parent.depth + 1, MAX_COMMENT_DEPTH);
  }
  const spam = await spamCheck(user, undefined, input.body, null, 'comment');
  const c = await prisma.$transaction(async (tx) => {
    const row = await tx.communityComment.create({
      data: { postId, parentId: input.parentId ?? null, depth, authorId: user.id, alias: aliasFor(aliasSecret(), user.id, post.communityId), body: input.body, spamScore: spam.score, status: spam.hold ? 'PENDING' : 'VISIBLE' },
    });
    if (!spam.hold) await tx.communityPost.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    return row;
  });
  return { comment: toPublicComment(c, user.id, post.authorId), held: spam.hold, personalInfo: spam.personalInfo };
}

export async function deleteComment(user: SessionUser, id: string) {
  const c = await prisma.communityComment.findUnique({ where: { id } });
  if (!c || c.status === 'DELETED') throw ApiError.notFound('Comment not found.');
  if (c.authorId !== user.id) throw ApiError.forbidden('You can only delete your own comments.');
  await prisma.$transaction([
    prisma.communityComment.update({ where: { id }, data: { status: 'DELETED', body: '' } }),
    ...(c.status === 'VISIBLE' ? [prisma.communityPost.update({ where: { id: c.postId }, data: { commentCount: { decrement: 1 } } })] : []),
  ]);
}

// ─────────────────────────────────── Votes ───────────────────────────────────

export async function vote(user: SessionUser, targetType: VoteTarget, targetId: string, value: -1 | 0 | 1) {
  const target = targetType === 'POST'
    ? await prisma.communityPost.findUnique({ where: { id: targetId }, select: { id: true, authorId: true, status: true, communityId: true, upvotes: true, downvotes: true, createdAt: true } })
    : await prisma.communityComment.findUnique({ where: { id: targetId }, select: { id: true, authorId: true, status: true, upvotes: true, downvotes: true, post: { select: { communityId: true } } } });
  if (!target || target.status !== 'VISIBLE') throw ApiError.notFound();
  if (target.authorId === user.id) throw ApiError.badRequest('You can’t vote on your own contribution.');
  const communityId = 'communityId' in target ? target.communityId : target.post.communityId;
  await assertCanParticipate(user, communityId);

  return prisma.$transaction(async (tx) => {
    const where = { userId_targetType_targetId: { userId: user.id, targetType, targetId } };
    const existing = await tx.communityVote.findUnique({ where });
    const prev = existing?.value ?? 0;
    if (prev === value) return { score: target.upvotes - target.downvotes, myVote: value };
    if (value === 0) await tx.communityVote.delete({ where });
    else await tx.communityVote.upsert({ where, create: { userId: user.id, targetType, targetId, value }, update: { value } });
    // Re-read counters inside the transaction so concurrent votes are not lost.
    if (targetType === 'POST') {
      const cur = await tx.communityPost.findUniqueOrThrow({ where: { id: targetId }, select: { upvotes: true, downvotes: true, createdAt: true } });
      const n = applyVote(cur, prev, value);
      await tx.communityPost.update({ where: { id: targetId }, data: { ...n, hotRank: hotRank(n.upvotes, n.downvotes, cur.createdAt) } });
      return { score: n.score, myVote: value };
    }
    const cur = await tx.communityComment.findUniqueOrThrow({ where: { id: targetId }, select: { upvotes: true, downvotes: true } });
    const n = applyVote(cur, prev, value);
    await tx.communityComment.update({ where: { id: targetId }, data: n });
    return { score: n.score, myVote: value };
  });
}

// ────────────────────────────────── Reports ──────────────────────────────────

export async function report(user: SessionUser, input: { targetType: VoteTarget; targetId: string; reason: Prisma.ContentReportCreateInput['reason']; details?: string }) {
  const exists = input.targetType === 'POST'
    ? await prisma.communityPost.count({ where: { id: input.targetId } })
    : await prisma.communityComment.count({ where: { id: input.targetId } });
  if (!exists) throw ApiError.notFound();
  try {
    await prisma.contentReport.create({ data: { reporterId: user.id, targetType: input.targetType, targetId: input.targetId, reason: input.reason, details: input.details } });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return { alreadyReported: true, hidden: false };
    throw e;
  }
  const open = await prisma.contentReport.count({ where: { targetType: input.targetType, targetId: input.targetId, status: 'OPEN' } });
  let hidden = false;
  if (open >= AUTO_HIDE_REPORTS) {
    if (input.targetType === 'POST') hidden = (await prisma.communityPost.updateMany({ where: { id: input.targetId, status: 'VISIBLE' }, data: { status: 'PENDING' } })).count > 0;
    else hidden = (await prisma.communityComment.updateMany({ where: { id: input.targetId, status: 'VISIBLE' }, data: { status: 'PENDING' } })).count > 0;
  }
  return { alreadyReported: false, hidden };
}

// ────────────────────────────────── Trending ──────────────────────────────────

const STOP = new Set('a an and are as at be but by can do for from has have how i if in is it its me my of on or our so that the their this to was we what when where which who why will with you your nepal any best good need help about there here near after before trip travel time'.split(' '));
/** Top posts of the last 48 h plus the most-used title words, for the "Trending" panel. */
export async function trending() {
  const since = new Date(Date.now() - 48 * 3_600_000);
  const posts = await prisma.communityPost.findMany({ where: { status: 'VISIBLE', createdAt: { gt: since }, community: { isActive: true } }, include: postInclude, orderBy: { hotRank: 'desc' }, take: 100 });
  const counts = new Map<string, number>();
  posts.forEach((p) => new Set(p.title.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []).forEach((w) => { if (!STOP.has(w)) counts.set(w, (counts.get(w) || 0) + 1); }));
  const topics = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([term, count]) => ({ term, count }));
  return { posts: posts.slice(0, 10).map((p) => toPublicPost(p)), topics };
}
