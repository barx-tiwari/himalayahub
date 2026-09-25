import express, { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { ApiError, created, ok } from '../../lib/http.js';
import { cache } from '../../lib/cache.js';
import { requireAuth } from '../../middleware/auth.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { sniffImage, storage } from '../../lib/storage.js';

/**
 * The signed-in traveller's own data. Everything here is private to the account:
 * nothing from these endpoints is ever shown on community posts (which use aliases).
 */
export const meRoutes = Router();
meRoutes.use(requireAuth);

export const TRAVEL_INTERESTS = ['trekking', 'hiking', 'culture', 'religious-sites', 'wildlife', 'lakes', 'photography', 'food', 'adventure-sports', 'camping', 'village-stays', 'festivals', 'cycling', 'birdwatching'] as const;

const profileBody = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  country: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  travelInterests: z.array(z.enum(TRAVEL_INTERESTS)).max(TRAVEL_INTERESTS.length).optional(),
  travelerType: z.enum(['domestic', 'international']).nullable().optional(),
}).strict();

meRoutes.get('/profile', async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, include: { profile: true, oauthAccounts: { select: { provider: true } } } });
  res.setHeader('Cache-Control', 'no-store');
  return ok(res, {
    name: u.name, email: u.email, avatar: u.avatar, country: u.country, bio: u.bio, role: u.role, emailVerified: Boolean(u.emailVerifiedAt),
    travelInterests: (u.profile?.travelInterests as string[] | null) ?? [], travelerType: u.profile?.travelerType ?? null,
    signInMethods: [...(u.passwordHash ? ['password'] : []), ...u.oauthAccounts.map((a) => a.provider)], createdAt: u.createdAt,
  });
});

meRoutes.patch('/profile', validate({ body: profileBody }), async (req, res) => {
  const { name, country, bio, travelInterests, travelerType } = req.body as z.infer<typeof profileBody>;
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name !== undefined ? { name } : {}), ...(country !== undefined ? { country } : {}), ...(bio !== undefined ? { bio } : {}),
      profile: { upsert: { create: { travelInterests, travelerType: travelerType ?? null }, update: { ...(travelInterests ? { travelInterests } : {}), ...(travelerType !== undefined ? { travelerType } : {}) } } },
    },
  });
  return ok(res, null, 'Profile saved');
});

/** Profile photo: raw image body (max 3 MB), type checked from the bytes. */
const avatarLimit = rateLimit({ cache, name: 'avatar', windowMs: 3_600_000, max: 10, key: (r) => r.user?.id || r.ip || 'x' });
meRoutes.post('/avatar', avatarLimit, express.raw({ type: () => true, limit: 3 * 1024 * 1024 }), async (req, res) => {
  const body = req.body as Buffer;
  if (!Buffer.isBuffer(body) || !body.length) throw ApiError.badRequest('Choose a photo to upload.');
  const kind = sniffImage(body);
  if (!kind || kind.ext === 'gif') throw ApiError.badRequest('Use a JPEG, PNG, WebP or AVIF photo.');
  let bytes = body; let mime = kind.mime; let ext = kind.ext;
  try { // Square 256px WebP when sharp is installed; also strips EXIF (incl. GPS) from phone photos.
    const sharp = (await import('sharp' as string)).default as (b: Buffer) => { rotate(): { resize(o: object): { webp(o: object): { toBuffer(): Promise<Buffer> } } } };
    bytes = await sharp(body).rotate().resize({ width: 256, height: 256, fit: 'cover' }).webp({ quality: 82 }).toBuffer(); mime = 'image/webp'; ext = 'webp';
  } catch { /* sharp missing: original kept */ }
  const { url } = await storage.put(`avatars/${req.user!.id.slice(-8)}-${randomBytes(4).toString('hex')}.${ext}`, bytes, mime);
  await prisma.user.update({ where: { id: req.user!.id }, data: { avatar: url } });
  return created(res, { avatar: url }, 'Photo updated');
});

// ─────────── Favourite destinations (uses the existing Favorite table, contentType DESTINATION) ───────────

meRoutes.get('/favorites/destinations', async (req, res) => {
  const favs = await prisma.favorite.findMany({ where: { userId: req.user!.id, contentType: 'DESTINATION' }, orderBy: { createdAt: 'desc' } });
  const rows = await prisma.destination.findMany({ where: { id: { in: favs.map((f) => f.contentId) }, status: 'PUBLISHED', deletedAt: null }, select: { id: true, slug: true, name: true, tagline: true, province: true, district: true, featuredImage: true } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ok(res, favs.map((f) => byId.get(f.contentId)).filter(Boolean));
});
meRoutes.put('/favorites/destinations/:slug', async (req, res) => {
  const d = await prisma.destination.findFirst({ where: { slug: String(req.params.slug), status: 'PUBLISHED', deletedAt: null }, select: { id: true } });
  if (!d) throw ApiError.notFound('Destination not found.');
  await prisma.favorite.upsert({ where: { userId_contentType_contentId: { userId: req.user!.id, contentType: 'DESTINATION', contentId: d.id } }, create: { userId: req.user!.id, contentType: 'DESTINATION', contentId: d.id }, update: {} });
  return ok(res, { favorite: true });
});
meRoutes.delete('/favorites/destinations/:slug', async (req, res) => {
  const d = await prisma.destination.findFirst({ where: { slug: String(req.params.slug) }, select: { id: true } });
  if (d) await prisma.favorite.deleteMany({ where: { userId: req.user!.id, contentType: 'DESTINATION', contentId: d.id } });
  return ok(res, { favorite: false });
});

// ─────────────────────────────────── Saved trips ───────────────────────────────────

const slug = z.string().trim().regex(/^[a-z0-9-]{1,80}$/);
const tripBody = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(4000).optional(),
  startDate: z.coerce.date().optional(),
  days: z.number().int().min(1).max(60).optional(),
  destinations: z.array(slug).min(1).max(30),
  itinerary: z.array(z.object({ day: z.number().int().min(1).max(60), title: z.string().max(160), stops: z.array(z.string().max(160)).max(20).default([]) })).max(60).optional(),
});
const MAX_TRIPS = 50;

meRoutes.get('/trips', async (req, res) => ok(res, await prisma.savedTrip.findMany({ where: { userId: req.user!.id }, orderBy: { updatedAt: 'desc' } })));
meRoutes.post('/trips', validate({ body: tripBody }), async (req, res) => {
  if ((await prisma.savedTrip.count({ where: { userId: req.user!.id } })) >= MAX_TRIPS) throw ApiError.badRequest(`You can keep up to ${MAX_TRIPS} trips. Delete one to add another.`);
  return created(res, await prisma.savedTrip.create({ data: { ...req.body, userId: req.user!.id } }), 'Trip saved');
});
meRoutes.patch('/trips/:id', validate({ body: tripBody.partial() }), async (req, res) => {
  const n = await prisma.savedTrip.updateMany({ where: { id: String(req.params.id), userId: req.user!.id }, data: req.body });
  if (!n.count) throw ApiError.notFound('Trip not found.');
  return ok(res, null, 'Trip updated');
});
meRoutes.delete('/trips/:id', async (req, res) => {
  await prisma.savedTrip.deleteMany({ where: { id: String(req.params.id), userId: req.user!.id } });
  return ok(res, null, 'Trip deleted');
});
