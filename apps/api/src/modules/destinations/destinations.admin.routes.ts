import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError, created, ok, paginated } from '../../lib/http.js';
import { requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { audit } from '../../services/audit.js';
import { destinationInclude, toAdminDestination } from './destinations.mapper.js';
import { adminListQuery, categoryInput, destinationInput, destinationPatch, imageInput, imagePatch, reorderInput } from './destinations.schemas.js';
import { createDestination, invalidateDestinations, updateDestination } from './destinations.service.js';

export const adminDestinationRoutes = Router();
export const adminDestinationCategoryRoutes = Router();
const canEdit = requirePermission('destinations.update');

adminDestinationRoutes.get('/', canEdit, validate({ query: adminListQuery }), async (req, res) => {
  const q = req.query as unknown as { page: number; limit: number; status: string; q?: string; featured?: string };
  const where: Prisma.DestinationWhereInput = {
    deletedAt: null,
    ...(q.status !== 'ALL' ? { status: q.status as 'DRAFT' } : {}),
    ...(q.featured ? { isFeatured: q.featured === 'true' } : {}),
    ...(q.q ? { OR: [{ name: { contains: q.q } }, { slug: { contains: q.q.toLowerCase() } }] } : {}),
  };
  const [rows, total, counts] = await Promise.all([
    prisma.destination.findMany({ where, orderBy: [{ updatedAt: 'desc' }], skip: (q.page - 1) * q.limit, take: q.limit,
      select: { id: true, slug: true, name: true, province: true, status: true, isFeatured: true, sortOrder: true, updatedAt: true, images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { imageUrl: true, commonsFile: true, altText: true } } } }),
    prisma.destination.count({ where }),
    prisma.destination.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
  ]);
  return paginated(res, rows, q.page, q.limit, total, { counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) });
});

adminDestinationRoutes.get('/:id', canEdit, async (req, res) => {
  const d = await prisma.destination.findFirst({ where: { id: String(req.params.id), deletedAt: null }, include: destinationInclude });
  if (!d) throw ApiError.notFound('Destination not found.');
  return ok(res, toAdminDestination(d));
});

adminDestinationRoutes.post('/', requirePermission('destinations.create'), validate({ body: destinationInput }), async (req, res) => {
  const d = await createDestination(req.body);
  invalidateDestinations();
  await audit(req, 'ADMIN_CREATED_DESTINATION', 'Destination', d.id, { slug: d.slug, status: d.status });
  return created(res, toAdminDestination(d), d.status === 'PUBLISHED' ? 'Published' : 'Draft saved');
});

adminDestinationRoutes.patch('/:id', canEdit, validate({ body: destinationPatch }), async (req, res) => {
  const d = await updateDestination(String(req.params.id), req.body);
  invalidateDestinations();
  const action = req.body.status === 'PUBLISHED' ? 'ADMIN_PUBLISHED_DESTINATION' : req.body.status === 'ARCHIVED' ? 'ADMIN_ARCHIVED_DESTINATION' : 'ADMIN_UPDATED_DESTINATION';
  await audit(req, action, 'Destination', d.id, { fields: Object.keys(req.body) });
  return ok(res, toAdminDestination(d), 'Saved');
});

/** Soft delete (keeps the row, hides it everywhere). Requires destinations.delete (Admin+). */
adminDestinationRoutes.delete('/:id', requirePermission('destinations.delete'), async (req, res) => {
  const d = await prisma.destination.findFirst({ where: { id: String(req.params.id), deletedAt: null } });
  if (!d) throw ApiError.notFound('Destination not found.');
  await prisma.destination.update({ where: { id: d.id }, data: { deletedAt: new Date(), status: 'ARCHIVED', isFeatured: false } });
  invalidateDestinations();
  await audit(req, 'ADMIN_DELETED_DESTINATION', 'Destination', d.id, { slug: d.slug });
  return ok(res, null, 'Destination deleted');
});

// ── Gallery ──
adminDestinationRoutes.post('/:id/images', canEdit, validate({ body: imageInput }), async (req, res) => {
  const id = String(req.params.id);
  if (!(await prisma.destination.findFirst({ where: { id, deletedAt: null } }))) throw ApiError.notFound('Destination not found.');
  const count = await prisma.destinationImage.count({ where: { destinationId: id } });
  if (count >= 30) throw ApiError.badRequest('A destination can have up to 30 photos.');
  const img = await prisma.destinationImage.create({ data: { ...req.body, destinationId: id, sortOrder: count } });
  invalidateDestinations();
  await audit(req, 'ADMIN_ADDED_DESTINATION_IMAGE', 'Destination', id, { imageId: img.id });
  return created(res, img, 'Photo added');
});
adminDestinationRoutes.patch('/:id/images/:imageId', canEdit, validate({ body: imagePatch }), async (req, res) => {
  const img = await prisma.destinationImage.findFirst({ where: { id: String(req.params.imageId), destinationId: String(req.params.id) } });
  if (!img) throw ApiError.notFound('Photo not found.');
  const out = await prisma.destinationImage.update({ where: { id: img.id }, data: req.body });
  invalidateDestinations();
  return ok(res, out, 'Photo updated');
});
adminDestinationRoutes.put('/:id/images/order', canEdit, validate({ body: reorderInput }), async (req, res) => {
  const id = String(req.params.id);
  const existing = await prisma.destinationImage.findMany({ where: { destinationId: id }, select: { id: true } });
  const ids: string[] = req.body.ids;
  if (ids.length !== existing.length || !existing.every((e) => ids.includes(e.id))) throw ApiError.badRequest('The photo list changed — reload and try again.');
  await prisma.$transaction(ids.map((imageId, i) => prisma.destinationImage.update({ where: { id: imageId }, data: { sortOrder: i } })));
  invalidateDestinations();
  await audit(req, 'ADMIN_REORDERED_DESTINATION_IMAGES', 'Destination', id);
  return ok(res, null, 'Order saved');
});
adminDestinationRoutes.delete('/:id/images/:imageId', canEdit, async (req, res) => {
  const img = await prisma.destinationImage.findFirst({ where: { id: String(req.params.imageId), destinationId: String(req.params.id) } });
  if (!img) throw ApiError.notFound('Photo not found.');
  await prisma.destinationImage.delete({ where: { id: img.id } }); // the uploaded file stays in the media library
  invalidateDestinations();
  await audit(req, 'ADMIN_REMOVED_DESTINATION_IMAGE', 'Destination', String(req.params.id), { imageId: img.id });
  return ok(res, null, 'Photo removed');
});

// ── Travel categories ──
adminDestinationCategoryRoutes.get('/', canEdit, async (_req, res) => {
  const rows = await prisma.destinationCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { destinations: true } } } });
  return ok(res, rows.map(({ _count, ...c }) => ({ ...c, destinationCount: _count.destinations })));
});
adminDestinationCategoryRoutes.post('/', canEdit, validate({ body: categoryInput }), async (req, res) => {
  const c = await prisma.destinationCategory.create({ data: req.body });
  invalidateDestinations(); await audit(req, 'ADMIN_CREATED_TRAVEL_CATEGORY', 'DestinationCategory', c.id);
  return created(res, c, 'Category added');
});
adminDestinationCategoryRoutes.patch('/:id', canEdit, validate({ body: categoryInput.partial() }), async (req, res) => {
  const c = await prisma.destinationCategory.update({ where: { id: String(req.params.id) }, data: req.body });
  invalidateDestinations(); await audit(req, 'ADMIN_UPDATED_TRAVEL_CATEGORY', 'DestinationCategory', c.id);
  return ok(res, c, 'Category saved');
});
adminDestinationCategoryRoutes.delete('/:id', requirePermission('destinations.delete'), async (req, res) => {
  const id = String(req.params.id);
  const used = await prisma.destinationOnCategory.count({ where: { categoryId: id } });
  if (used) throw ApiError.badRequest(`This category is used by ${used} destination${used === 1 ? '' : 's'}. Remove it from them first.`);
  await prisma.destinationCategory.delete({ where: { id } });
  invalidateDestinations(); await audit(req, 'ADMIN_DELETED_TRAVEL_CATEGORY', 'DestinationCategory', id);
  return ok(res, null, 'Category deleted');
});
