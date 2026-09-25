import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { CONTENT_STATUSES, slugify } from '@himalayahub/shared';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { ApiError, created, ok } from '../../lib/http.js';
import { cache } from '../../lib/cache.js';
import { validate } from '../../middleware/validate.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { requirePermission } from '../../middleware/auth.js';
import { audit } from '../../services/audit.js';
import { distanceKm, googleMapsLink, PLACE_TYPES } from './stays.logic.js';

/**
 * Stays near destinations.
 *  - /api/destinations/:slug/stays   curated listings an editor has verified (stored in our DB)
 *  - /api/places/nearby, /:placeId   live Google Places results (NOT stored — Google Maps Platform terms)
 * We never invent hotels, phone numbers or ratings: unverified listings are not shown publicly, and
 * ratings/reviews only ever come live from Google with attribution.
 */
export const staysRoutes = Router();
export const placesRoutes = Router();
export const adminStaysRoutes = Router();

const TYPES = ['HOTEL', 'HOMESTAY', 'RESORT', 'LODGE', 'CAMPING'] as const;
const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

staysRoutes.get('/:slug/stays', validate({ query: z.object({ type: z.enum(TYPES).optional() }) }), async (req, res) => {
  const d = await prisma.destination.findFirst({ where: { slug: String(req.params.slug), status: 'PUBLISHED', deletedAt: null }, select: { id: true, latitude: true, longitude: true } });
  if (!d) throw ApiError.notFound('Destination not found.');
  const type = (req.query as { type?: (typeof TYPES)[number] }).type;
  const rows = await prisma.stay.findMany({ where: { destinationId: d.id, status: 'PUBLISHED', isVerified: true, deletedAt: null, ...(type ? { type } : {}) }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  res.setHeader('Cache-Control', 'public, max-age=300');
  return ok(res, {
    googleEnabled: Boolean(env.GOOGLE_MAPS_API_KEY),
    items: rows.map((s) => ({
      id: s.id, slug: s.slug, name: s.name, type: s.type, description: s.description, phone: s.phone, email: s.email, website: s.website,
      lat: s.latitude, lon: s.longitude, amenities: arr(s.amenities), priceRangeNpr: s.priceMinNpr || s.priceMaxNpr ? [s.priceMinNpr, s.priceMaxNpr] : null,
      distanceKm: s.latitude != null && s.longitude != null ? distanceKm({ lat: d.latitude, lon: d.longitude }, { lat: s.latitude, lon: s.longitude }) : null,
      mapsUrl: s.latitude != null && s.longitude != null ? googleMapsLink(s.latitude, s.longitude, s.googlePlaceId) : null,
      googlePlaceId: s.googlePlaceId, verifiedAt: s.verifiedAt,
    })),
  });
});

// ───────────────────────────── Google Places proxy ─────────────────────────────
// Keeps the key server-side and lets us rate-limit spend. Configure API restrictions + quotas in Google Cloud.

const placesLimit = rateLimit({ cache, name: 'places', windowMs: 60_000, max: 20, key: (r) => r.ip || 'x' });
async function places(path: string, init: { method?: string; body?: unknown; fieldMask: string }) {
  if (!env.GOOGLE_MAPS_API_KEY) throw new ApiError(501, 'Google Places is not configured.', 'NOT_CONFIGURED');
  const r = await fetch(`https://places.googleapis.com/v1/${path}`, {
    method: init.method || 'GET', signal: AbortSignal.timeout(8000),
    headers: { 'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY, 'X-Goog-FieldMask': init.fieldMask, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (!r.ok) throw new ApiError(502, 'Google Places is unavailable right now.', 'UPSTREAM');
  return r.json() as Promise<Record<string, unknown>>;
}
type GPlace = { id: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number; googleMapsUri?: string; priceLevel?: string; types?: string[]; websiteUri?: string; internationalPhoneNumber?: string; reviews?: { rating?: number; relativePublishTimeDescription?: string; text?: { text?: string }; authorAttribution?: { displayName?: string; uri?: string; photoUri?: string } }[] };

placesRoutes.get('/nearby', placesLimit, validate({ query: z.object({
  lat: z.coerce.number().min(26.3).max(30.5), lon: z.coerce.number().min(80).max(88.3),
  radius: z.coerce.number().int().min(500).max(30_000).default(8000), type: z.enum(['ALL', ...TYPES]).default('ALL'),
}) }), async (req, res) => {
  const q = req.query as unknown as { lat: number; lon: number; radius: number; type: string };
  const data = await places('places:searchNearby', {
    method: 'POST', fieldMask: 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.priceLevel,places.types',
    body: { includedTypes: PLACE_TYPES[q.type], maxResultCount: 20, rankPreference: 'DISTANCE', locationRestriction: { circle: { center: { latitude: q.lat, longitude: q.lon }, radius: q.radius } } },
  });
  const items = ((data.places as GPlace[] | undefined) || []).map((p) => ({
    placeId: p.id, name: p.displayName?.text ?? '', address: p.formattedAddress ?? null, lat: p.location?.latitude ?? null, lon: p.location?.longitude ?? null,
    rating: p.rating ?? null, ratingCount: p.userRatingCount ?? 0, priceLevel: p.priceLevel ?? null, types: p.types ?? [], mapsUrl: p.googleMapsUri ?? null,
    distanceKm: p.location ? distanceKm({ lat: q.lat, lon: q.lon }, { lat: p.location.latitude, lon: p.location.longitude }) : null,
  }));
  res.setHeader('Cache-Control', 'private, no-store'); // Google content is not cached by us
  return ok(res, { items, attribution: 'Google' });
});

placesRoutes.get('/:placeId', placesLimit, async (req, res) => {
  const id = String(req.params.placeId);
  if (!/^[\w-]{10,300}$/.test(id)) throw ApiError.badRequest('Invalid place.');
  const p = (await places(`places/${encodeURIComponent(id)}`, { fieldMask: 'id,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,websiteUri,internationalPhoneNumber,reviews' })) as unknown as GPlace;
  res.setHeader('Cache-Control', 'private, no-store');
  return ok(res, {
    placeId: p.id, name: p.displayName?.text ?? '', address: p.formattedAddress ?? null, lat: p.location?.latitude ?? null, lon: p.location?.longitude ?? null,
    rating: p.rating ?? null, ratingCount: p.userRatingCount ?? 0, phone: p.internationalPhoneNumber ?? null, website: p.websiteUri ?? null, mapsUrl: p.googleMapsUri ?? null,
    reviews: (p.reviews || []).slice(0, 5).map((r) => ({ rating: r.rating ?? null, when: r.relativePublishTimeDescription ?? null, text: r.text?.text?.slice(0, 1200) ?? '', author: r.authorAttribution?.displayName ?? 'Google user', authorUrl: r.authorAttribution?.uri ?? null, authorPhoto: r.authorAttribution?.photoUri ?? null })),
    attribution: 'Google',
  });
});

// ─────────────────────────────────── Admin ───────────────────────────────────

const opt = (max: number) => z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));
const stayInput = z.object({
  destinationSlug: z.string().trim().max(80), name: z.string().trim().min(2).max(120), type: z.enum(TYPES),
  description: opt(2000), phone: z.string().trim().regex(/^[+\d][\d\s-]{5,20}$/, 'Enter a phone number like +977 1 4123456').optional().nullable(),
  email: z.string().trim().email().max(200).optional().nullable(), website: z.string().trim().url().max(300).optional().nullable(),
  latitude: z.coerce.number().min(26.3).max(30.5).optional().nullable(), longitude: z.coerce.number().min(80).max(88.3).optional().nullable(),
  amenities: z.array(z.string().trim().min(1).max(60)).max(40).default([]),
  priceMinNpr: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(), priceMaxNpr: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  googlePlaceId: z.string().trim().regex(/^[\w-]{10,300}$/).optional().nullable(),
  isVerified: z.boolean().default(false), verificationNote: opt(500),
  status: z.enum(CONTENT_STATUSES).default('DRAFT'), sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
}).refine((v) => !v.isVerified || Boolean(v.verificationNote), { message: 'Say how the details were verified (e.g. “phoned owner 2026-10-02”).', path: ['verificationNote'] })
  .refine((v) => v.priceMinNpr == null || v.priceMaxNpr == null || v.priceMinNpr <= v.priceMaxNpr, { message: 'Minimum price is above maximum.', path: ['priceMinNpr'] });

adminStaysRoutes.use(requirePermission('stays.manage'));
adminStaysRoutes.get('/', validate({ query: z.object({ destination: z.string().max(80).optional() }) }), async (req, res) => {
  const slug = (req.query as { destination?: string }).destination;
  const rows = await prisma.stay.findMany({ where: { deletedAt: null, ...(slug ? { destination: { slug } } : {}) }, include: { destination: { select: { slug: true, name: true } } }, orderBy: [{ updatedAt: 'desc' }], take: 500 });
  return ok(res, rows);
});

async function toData(b: z.infer<typeof stayInput>, existingVerifiedAt?: Date | null) {
  const d = await prisma.destination.findFirst({ where: { slug: b.destinationSlug, deletedAt: null }, select: { id: true } });
  if (!d) throw ApiError.badRequest('Unknown destination.', [{ path: 'destinationSlug', message: 'Choose a destination.' }]);
  const { destinationSlug: _s, amenities, ...rest } = b;
  return { ...rest, amenities: amenities as Prisma.InputJsonValue, destinationId: d.id, verifiedAt: b.isVerified ? existingVerifiedAt ?? new Date() : null };
}
adminStaysRoutes.post('/', validate({ body: stayInput }), async (req, res) => {
  const data = await toData(req.body);
  const base = slugify(`${req.body.name}-${req.body.destinationSlug}`) || 'stay';
  let slug = base; for (let i = 2; await prisma.stay.findUnique({ where: { slug } }); i += 1) slug = `${base}-${i}`;
  const s = await prisma.stay.create({ data: { ...data, slug } });
  await audit(req, 'ADMIN_CREATED_STAY', 'Stay', s.id);
  return created(res, s);
});
adminStaysRoutes.put('/:id', validate({ body: stayInput }), async (req, res) => {
  const cur = await prisma.stay.findFirst({ where: { id: String(req.params.id), deletedAt: null } });
  if (!cur) throw ApiError.notFound();
  const s = await prisma.stay.update({ where: { id: cur.id }, data: await toData(req.body, cur.verifiedAt) });
  await audit(req, 'ADMIN_UPDATED_STAY', 'Stay', s.id, { fields: Object.keys(req.body) });
  return ok(res, s);
});
adminStaysRoutes.delete('/:id', async (req, res) => {
  await prisma.stay.updateMany({ where: { id: String(req.params.id), deletedAt: null }, data: { deletedAt: new Date(), status: 'ARCHIVED' } });
  await audit(req, 'ADMIN_DELETED_STAY', 'Stay', String(req.params.id));
  return ok(res, null, 'Deleted');
});
