import { Router } from 'express';
import { z } from 'zod';
import { whatsappUrl, normalizeWhatsApp } from '@himalayahub/shared';
import { prisma } from '../../lib/prisma.js';
import { cache, cached } from '../../lib/cache.js';
import { ok } from '../../lib/http.js';
import { requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { audit } from '../../services/audit.js';

export const settingsRoutes = Router();
const KEY = 'site-settings:public';

async function getOrCreate() {
  return (await prisma.siteSettings.findUnique({ where: { id: 1 } })) ?? prisma.siteSettings.create({ data: { id: 1 } });
}

/** Public settings the web app loads once (name, tagline, WhatsApp…). Admin edits apply site-wide. */
settingsRoutes.get('/', async (_req, res) => {
  const data = await cached(cache, KEY, 60_000, async () => {
    const s = await getOrCreate();
    return {
      siteName: s.siteName, tagline: s.tagline, secondaryTagline: s.secondaryTagline, description: s.description,
      logoUrl: s.logoUrl, faviconUrl: s.faviconUrl, contactPhone: s.contactPhone, contactEmail: s.contactEmail,
      whatsappNumber: s.whatsappNumber, whatsappDigits: normalizeWhatsApp(s.whatsappNumber), whatsappMessage: s.whatsappMessage,
      whatsappUrl: whatsappUrl(s.whatsappNumber, s.whatsappMessage), socialLinks: s.socialLinks, footerText: s.footerText,
      seo: { title: s.defaultMetaTitle, description: s.defaultMetaDescription, ogImage: s.defaultOgImage }, theme: s.theme, updatedAt: s.updatedAt,
    };
  });
  res.setHeader('Cache-Control', 'public, max-age=60');
  return ok(res, data);
});

const url = z.string().trim().url().max(500).optional().nullable();
const updateSchema = z.object({
  siteName: z.string().trim().min(2).max(60), tagline: z.string().trim().max(120), secondaryTagline: z.string().trim().max(200).nullish(),
  description: z.string().trim().max(300).nullish(), logoUrl: url, faviconUrl: url,
  contactPhone: z.string().trim().max(30).nullish(), contactEmail: z.string().trim().email().max(254).nullish(),
  whatsappNumber: z.string().trim().refine((v) => normalizeWhatsApp(v) !== null, 'Enter a valid WhatsApp number, e.g. +977 9863903703.'),
  whatsappMessage: z.string().trim().max(200),
  socialLinks: z.record(z.string().url()).nullish(), footerText: z.string().trim().max(300).nullish(),
  defaultMetaTitle: z.string().trim().max(70).nullish(), defaultMetaDescription: z.string().trim().max(170).nullish(), defaultOgImage: url,
  theme: z.object({ accent: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), defaultMode: z.enum(['system', 'light', 'dark']).optional() }).nullish(),
}).partial();

settingsRoutes.put('/', requirePermission('settings.manage'), validate({ body: updateSchema }), async (req, res) => {
  await getOrCreate();
  const s = await prisma.siteSettings.update({ where: { id: 1 }, data: { ...req.body, updatedById: req.user!.id } });
  await cache.del(KEY);
  await audit(req, 'ADMIN_UPDATED_SETTINGS', 'SiteSettings', '1', { fields: Object.keys(req.body) });
  return ok(res, s, 'Settings saved');
});
