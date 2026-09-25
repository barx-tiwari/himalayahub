import { z } from 'zod';
import { CONTENT_STATUSES } from '@himalayahub/shared';

const PROVINCES = ['koshi', 'madhesh', 'bagmati', 'gandaki', 'lumbini', 'karnali', 'sudurpashchim'] as const;
const ZONES = ['himalaya', 'hill', 'valley', 'terai'] as const;
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens.').max(80);
const line = z.string().trim().min(1).max(300);
const list = z.array(line).max(30).default([]);
const opt = (max: number) => z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(50),
  featured: z.enum(['true', 'false']).optional(), category: slug.optional(), province: z.enum(PROVINCES).optional(), zone: z.enum(ZONES).optional(),
  q: z.string().trim().max(80).optional(),
  region: z.enum(['eastern', 'central', 'western', 'far-western']).optional(), hiddenGem: z.enum(['true', 'false']).optional(),
});
export const adminListQuery = listQuery.extend({ status: z.enum([...CONTENT_STATUSES, 'ALL']).default('ALL') });

const para = z.string().trim().max(4000).optional();
const short = z.string().trim().max(300);
const route = z.object({ name: short, days: z.number().int().min(1).max(40).optional(), maxElevationM: z.number().int().min(50).max(8850).optional(), notes: z.string().trim().max(600).optional() });
const plan = z.array(z.object({ day: z.number().int().min(1).max(21), title: short, detail: z.string().trim().max(800).optional() })).max(21);
/** Structured travel guide stored as JSON on the destination (all sections optional). */
export const guideSchema = z.object({
  story: z.array(z.object({ heading: short, text: z.string().trim().max(2000) })).max(12).optional(),
  history: para, culture: para, localCommunities: para,
  travel: z.object({ howToReach: para, nearestAirport: short.optional(), nearestBusStation: short.optional(), roadConditions: para }).partial().optional(),
  adventure: z.object({ trekRoutes: z.array(route).max(12), hikingRoutes: z.array(route).max(12), camping: para, wildlife: z.array(short).max(30) }).partial().optional(),
  tourism: z.object({ weather: para, sunrisePoints: z.array(short).max(12), sunsetPoints: z.array(short).max(12) }).partial().optional(),
  permits: z.array(z.object({ name: short, note: z.string().trim().max(600).optional(), officialUrl: z.string().url().max(300).optional() })).max(12).optional(),
  videos: z.array(z.object({ title: short, youtubeId: z.string().regex(/^[\w-]{11}$/, 'YouTube video id (11 characters)') })).max(12).optional(),
  localGuides: para,
  costs: z.object({
    domestic: z.object({ perDayNpr: z.tuple([z.number().int().min(0), z.number().int().min(0)]), note: z.string().trim().max(400).optional() }).optional(),
    international: z.object({ perDayUsd: z.tuple([z.number().int().min(0), z.number().int().min(0)]), note: z.string().trim().max(400).optional() }).optional(),
  }).optional(),
  itineraries: z.array(z.object({ days: z.union([z.literal(3), z.literal(5), z.literal(7), z.literal(14)]), audience: z.enum(['domestic', 'international', 'both']), title: short, startFrom: short.optional(), plan })).max(12).optional(),
  verifiedAt: z.string().max(40).optional(), // when an editor last checked the facts
}).strict();
export type Guide = z.infer<typeof guideSchema>;

/** Latitude/longitude are limited to Nepal's bounding box to catch swapped or mistyped coordinates. */
export const destinationInput = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(80), slug,
  tagline: opt(160), shortDescription: opt(300), description: opt(5000), knownFor: opt(300),
  province: z.enum(PROVINCES, { errorMap: () => ({ message: 'Choose a province.' }) }), district: opt(60), zone: z.enum(ZONES).nullable().optional(),
  latitude: z.coerce.number().min(26.3, 'Latitude must be inside Nepal (26.3–30.5).').max(30.5, 'Latitude must be inside Nepal (26.3–30.5).'),
  longitude: z.coerce.number().min(80.0, 'Longitude must be inside Nepal (80.0–88.3).').max(88.3, 'Longitude must be inside Nepal (80.0–88.3).'),
  bestTimeToVisit: opt(500), typicalDuration: opt(120), gettingThere: opt(600),
  activities: list, nearbyAttractions: list, travelTips: list, safetyInformation: list,
  isMountainArea: z.boolean().default(false), isViewDependent: z.boolean().default(false), isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(CONTENT_STATUSES).default('DRAFT'),
  metaTitle: opt(70), metaDescription: opt(170),
  region: z.enum(['eastern', 'central', 'western', 'far-western']).nullable().optional(),
  elevationM: z.coerce.number().int().min(50).max(8850).nullable().optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'strenuous']).nullable().optional(),
  distanceFromKtmKm: z.coerce.number().int().min(0).max(1500).nullable().optional(),
  isHiddenGem: z.boolean().default(false), hiddenGemRank: z.coerce.number().int().min(1).max(99).nullable().optional(),
  guide: guideSchema.nullable().optional(),
  categorySlugs: z.array(slug).max(20).default([]), nearbySlugs: z.array(slug).max(12).default([]),
});
export const destinationPatch = destinationInput.partial();

export const imageInput = z.object({
  imageUrl: z.string().trim().url().max(600).optional().nullable(),
  commonsFile: z.string().trim().min(3).max(240).optional().nullable(),
  altText: z.string().trim().min(3, 'Describe the photo for people who can’t see it.').max(200),
  caption: opt(200), credit: opt(200), license: opt(80),
}).refine((v) => Boolean(v.imageUrl) !== Boolean(v.commonsFile), { message: 'Give either an uploaded image URL or a Wikimedia Commons file name.', path: ['imageUrl'] });
export const imagePatch = z.object({ altText: z.string().trim().min(3).max(200).optional(), caption: opt(200), credit: opt(200), license: opt(80) });
export const reorderInput = z.object({ ids: z.array(z.string().min(1)).min(1).max(50) });
export const categoryInput = z.object({ name: z.string().trim().min(2).max(40), slug, emoji: opt(8), sortOrder: z.coerce.number().int().min(0).max(999).default(0) });
