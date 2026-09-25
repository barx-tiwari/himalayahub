import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { env } from '../config/env.js';

/**
 * File storage behind a small interface so the provider can change without touching callers.
 * - local: files under apps/api/uploads, served at /uploads (development / single server)
 * - s3:    any S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze B2…). Adapter to be added
 *          with the media-library slice; configured via STORAGE_* variables.
 * The database only stores the returned URL + metadata, never the file bytes.
 */
export interface Storage { put(key: string, body: Buffer, contentType: string): Promise<{ url: string }>; remove(key: string): Promise<void> }

const UPLOAD_ROOT = resolve(process.cwd(), 'uploads');
export const LOCAL_UPLOAD_ROOT = UPLOAD_ROOT;

const local: Storage = {
  async put(key, body) {
    const path = join(UPLOAD_ROOT, key);
    if (!path.startsWith(UPLOAD_ROOT)) throw new Error('Invalid storage key');
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
    return { url: `${env.API_URL}/uploads/${key}` };
  },
  async remove(key) {
    const path = join(UPLOAD_ROOT, key);
    if (path.startsWith(UPLOAD_ROOT)) await unlink(path).catch(() => {});
  },
};

const notConfigured: Storage = {
  put: async () => { throw new Error('S3 storage adapter not implemented yet — use STORAGE_DRIVER=local for now.'); },
  remove: async () => {},
};

export const storage: Storage = env.STORAGE_DRIVER === 's3' ? notConfigured : local;

export { sniffImage } from './imageType.js';
