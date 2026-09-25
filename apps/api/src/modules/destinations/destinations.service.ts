import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/http.js';
import { cache } from '../../lib/cache.js';
import { destinationInclude } from './destinations.mapper.js';

/** Public list cache is versioned; any admin write bumps the version, so changes appear immediately. */
let version = 0;
export const publicCacheKey = (suffix: string) => `dest:v${version}:${suffix}`;
export function invalidateDestinations() { version += 1; void cache.del('dest:categories'); }

type Input = Record<string, unknown> & { categorySlugs?: string[]; nearbySlugs?: string[] };

/** Prisma needs DbNull (not null) to clear a Json column. */
const jsonFields = (data: Record<string, unknown>) => ('guide' in data && data.guide === null ? { ...data, guide: Prisma.DbNull } : data);

async function resolveCategories(slugs: string[]) {
  if (!slugs.length) return [];
  const rows = await prisma.destinationCategory.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const missing = slugs.filter((s) => !rows.some((r) => r.slug === s));
  if (missing.length) throw ApiError.badRequest(`Unknown categories: ${missing.join(', ')}`, [{ path: 'categorySlugs', message: 'Choose categories from the list.' }]);
  return rows;
}

export async function createDestination(input: Input) {
  const { categorySlugs = [], nearbySlugs = [], ...data } = input;
  if (await prisma.destination.findUnique({ where: { slug: String(data.slug) } })) throw ApiError.badRequest('That web address is already used by another destination.', [{ path: 'slug', message: 'Already in use — choose another.' }]);
  const cats = await resolveCategories(categorySlugs);
  return prisma.destination.create({
    data: {
      ...(jsonFields(data) as Prisma.DestinationCreateInput),
      categories: { create: cats.map((c) => ({ categoryId: c.id })) },
      nearby: { connect: nearbySlugs.filter((s) => s !== data.slug).map((slug) => ({ slug })) },
    },
    include: destinationInclude,
  });
}

export async function updateDestination(id: string, input: Input) {
  const current = await prisma.destination.findFirst({ where: { id, deletedAt: null } });
  if (!current) throw ApiError.notFound('Destination not found.');
  const { categorySlugs, nearbySlugs, ...data } = input;
  if (data.slug && data.slug !== current.slug && (await prisma.destination.findUnique({ where: { slug: String(data.slug) } }))) {
    throw ApiError.badRequest('That web address is already used by another destination.', [{ path: 'slug', message: 'Already in use — choose another.' }]);
  }
  return prisma.$transaction(async (tx) => {
    if (categorySlugs) {
      const cats = await resolveCategories(categorySlugs);
      await tx.destinationOnCategory.deleteMany({ where: { destinationId: id } });
      for (const c of cats) await tx.destinationOnCategory.create({ data: { destinationId: id, categoryId: c.id } });
    }
    return tx.destination.update({
      where: { id },
      data: {
        ...(jsonFields(data) as Prisma.DestinationUpdateInput),
        ...(nearbySlugs ? { nearby: { set: nearbySlugs.filter((s) => s !== current.slug).map((slug) => ({ slug })) } } : {}),
      },
      include: destinationInclude,
    });
  });
}
