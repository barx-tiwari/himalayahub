import type { Prisma } from '@prisma/client';

/** Everything needed to render a destination (public shape == the web app's bundled data shape). */
export const destinationInclude = {
  images: { orderBy: { sortOrder: 'asc' } },
  categories: { include: { category: { select: { slug: true } } } },
  nearby: { where: { status: 'PUBLISHED', deletedAt: null }, select: { slug: true } },
} satisfies Prisma.DestinationInclude;

type Row = Prisma.DestinationGetPayload<{ include: typeof destinationInclude }>;
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function toPublicDestination(d: Row) {
  return {
    id: d.slug, name: d.name, province: d.province, district: d.district, zone: d.zone,
    lat: d.latitude, lon: d.longitude, tagline: d.tagline ?? d.shortDescription ?? '', knownFor: d.knownFor ?? '', description: d.description,
    tags: d.categories.map((c) => c.category.slug), activities: arr(d.activities), nearbyAttractions: arr(d.nearbyAttractions),
    tips: arr(d.travelTips), safety: arr(d.safetyInformation), bestTime: d.bestTimeToVisit ?? '', duration: d.typicalDuration ?? '',
    travel: d.gettingThere ?? '', nearby: d.nearby.map((n) => n.slug), mountain: d.isMountainArea, viewDependent: d.isViewDependent,
    featured: d.isFeatured, outdoor: true, emoji: '📍', sortOrder: d.sortOrder, status: d.status, updatedAt: d.updatedAt,
    metaTitle: d.metaTitle, metaDescription: d.metaDescription,
    region: d.region, elevationM: d.elevationM, difficulty: d.difficulty, distanceFromKtmKm: d.distanceFromKtmKm,
    hiddenGem: d.isHiddenGem, hiddenGemRank: d.hiddenGemRank, guide: (d.guide as Record<string, unknown> | null) ?? null,
    photos: d.images.map((i) => (i.imageUrl ? { src: i.imageUrl, alt: i.altText, caption: i.caption, credit: i.credit } : { file: i.commonsFile!, alt: i.altText, caption: i.caption })),
  };
}

/** Admin shape: raw fields + ids, for the editor. */
export function toAdminDestination(d: Row) {
  return {
    ...d,
    activities: arr(d.activities), nearbyAttractions: arr(d.nearbyAttractions), travelTips: arr(d.travelTips), safetyInformation: arr(d.safetyInformation),
    categorySlugs: d.categories.map((c) => c.category.slug), nearbySlugs: d.nearby.map((n) => n.slug),
    images: d.images.map(({ id, imageUrl, commonsFile, altText, caption, credit, license, sortOrder }) => ({ id, imageUrl, commonsFile, altText, caption, credit, license, sortOrder })),
    categories: undefined, nearby: undefined,
  };
}
