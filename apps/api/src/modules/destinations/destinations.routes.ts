import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError, ok, paginated } from '../../lib/http.js';
import { cache, cached } from '../../lib/cache.js';
import { validate } from '../../middleware/validate.js';
import { hasPermission } from '../../services/permissions.js';
import { destinationInclude, toPublicDestination } from './destinations.mapper.js';
import { listQuery } from './destinations.schemas.js';
import { publicCacheKey } from './destinations.service.js';

export const destinationRoutes = Router();
export const destinationCategoryRoutes = Router();

const published: Prisma.DestinationWhereInput = { status: 'PUBLISHED', deletedAt: null };

/** GET /api/destinations — published destinations (cached 60 s; admin edits bust the cache). */
destinationRoutes.get('/', validate({ query: listQuery }), async (req, res) => {
  const q = req.query as unknown as { page: number; limit: number; featured?: string; category?: string; province?: string; zone?: string; q?: string; region?: string; hiddenGem?: string };
  const where: Prisma.DestinationWhereInput = {
    ...published,
    ...(q.featured ? { isFeatured: q.featured === 'true' } : {}),
    ...(q.province ? { province: q.province } : {}),
    ...(q.zone ? { zone: q.zone } : {}),
    ...(q.region ? { region: q.region } : {}),
    ...(q.hiddenGem ? { isHiddenGem: q.hiddenGem === 'true' } : {}),
    ...(q.category ? { categories: { some: { category: { slug: q.category } } } } : {}),
    ...(q.q ? { OR: [{ name: { contains: q.q } }, { tagline: { contains: q.q } }, { knownFor: { contains: q.q } }] } : {}),
  };
  const key = publicCacheKey(JSON.stringify(q));
  const { items, total } = await cached(cache, key, 60_000, async () => {
    const [rows, count] = await Promise.all([
      prisma.destination.findMany({ where, include: destinationInclude, orderBy: q.hiddenGem === 'true' ? [{ hiddenGemRank: 'asc' }, { name: 'asc' }] : [{ sortOrder: 'asc' }, { name: 'asc' }], skip: (q.page - 1) * q.limit, take: q.limit }),
      prisma.destination.count({ where }),
    ]);
    return { items: rows.map(toPublicDestination), total: count };
  });
  res.setHeader('Cache-Control', 'public, max-age=60');
  return paginated(res, items, q.page, q.limit, total);
});

/** GET /api/destinations/:slug — published; staff may add ?preview=1 to see drafts. */
destinationRoutes.get('/:slug', async (req, res) => {
  const preview = req.query.preview === '1' && req.user && (await hasPermission(req.user.role, 'destinations.update'));
  const d = await prisma.destination.findFirst({ where: { slug: String(req.params.slug), deletedAt: null, ...(preview ? {} : { status: 'PUBLISHED' }) }, include: destinationInclude });
  if (!d) throw ApiError.notFound('Destination not found.');
  if (!preview) void prisma.destination.update({ where: { id: d.id }, data: { views: { increment: 1 } } }).catch(() => {});
  res.setHeader('Cache-Control', preview ? 'no-store' : 'public, max-age=60');
  return ok(res, { ...toPublicDestination(d), preview: Boolean(preview) });
});

destinationCategoryRoutes.get('/', async (_req, res) => {
  const cats = await cached(cache, 'dest:categories', 300_000, () => prisma.destinationCategory.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true, emoji: true, sortOrder: true } }));
  return ok(res, cats);
});
