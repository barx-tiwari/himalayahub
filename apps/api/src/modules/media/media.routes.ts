import express, { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { ApiError, created } from '../../lib/http.js';
import { requirePermission } from '../../middleware/auth.js';
import { sniffImage, storage } from '../../lib/storage.js';
import { audit } from '../../services/audit.js';
import { slugify } from '@himalayahub/shared';

export const mediaRoutes = Router();
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Upload one image as the raw request body (no multipart parser needed):
 *   POST /api/admin/media   Content-Type: image/jpeg   X-Filename: pokhara.jpg
 * The real type is checked from the file bytes; SVG and non-images are refused.
 * If `sharp` is installed, a 1600px WebP variant is also produced (optional dependency).
 */
mediaRoutes.post('/', requirePermission('media.manage'), express.raw({ type: () => true, limit: MAX_BYTES }), async (req, res) => {
  const body = req.body as Buffer;
  if (!Buffer.isBuffer(body) || !body.length) throw ApiError.badRequest('Choose an image to upload.');
  const kind = sniffImage(body);
  if (!kind) throw ApiError.badRequest('Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.');
  const original = String(req.get('x-filename') || 'image').slice(0, 120);
  const base = slugify(original.replace(/\.[a-z0-9]+$/i, '')) || 'image';
  const key = `${new Date().toISOString().slice(0, 7)}/${base}-${randomBytes(4).toString('hex')}.${kind.ext}`;
  const { url } = await storage.put(key, body, kind.mime);

  let width: number | null = null; let height: number | null = null; const variants: Record<string, string> = {};
  try {
    const sharp = (await import('sharp' as string)).default as (b: Buffer) => { metadata(): Promise<{ width?: number; height?: number }>; resize(o: object): { webp(o: object): { toBuffer(): Promise<Buffer> } } };
    const meta = await sharp(body).metadata(); width = meta.width ?? null; height = meta.height ?? null;
    const webp = await sharp(body).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    variants.webp1600 = (await storage.put(key.replace(/\.\w+$/, '-1600.webp'), webp, 'image/webp')).url;
  } catch { /* sharp not installed: keep the original only */ }

  const asset = await prisma.mediaAsset.create({
    data: { storageKey: key, url, filename: original, mimeType: kind.mime, size: body.length, width, height, variants: Object.keys(variants).length ? variants : undefined, altText: req.get('x-alt')?.slice(0, 200) || null, uploadedById: req.user!.id },
  });
  await audit(req, 'ADMIN_UPLOADED_MEDIA', 'MediaAsset', asset.id);
  return created(res, asset, 'Uploaded');
});
