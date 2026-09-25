/**
 * Photos come from Wikimedia Commons, which only hosts freely licensed or
 * public-domain files. We never hot-link originals: every <img> asks Commons
 * for a resized thumbnail at one of its standard widths, so a phone downloads
 * ~500 px and a large screen ~1920 px instead of a 10 MB original.
 *
 * Attribution (author + licence) is read from the Commons API, cached for two
 * weeks, and shown under gallery images, in the lightbox and on /image-credits.
 *
 * Self-hosted photos: give a photo `src` (and optionally `webp` / `avif` URLs and
 * a `credit` string) instead of `file`. Those are served as-is.
 */
import { readStorage, writeStorage } from '../utils/storage';

const FILEPATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const API = 'https://commons.wikimedia.org/w/api.php';
/** Commons pre-renders these widths; other widths are slower and may be refused. */
export const THUMB_WIDTHS = [500, 960, 1280, 1920];

const encodeFile = (file) => encodeURIComponent(file.replace(/ /g, '_'));

export function commonsUrl(file, width = 960) {
  return `${FILEPATH}${encodeFile(file)}?width=${width}`;
}
export function commonsPage(file) {
  return `https://commons.wikimedia.org/wiki/File:${encodeFile(file)}`;
}

/** { src, srcSet, sources[] } for a photo object. */
export function imageSources(photo, { widths = THUMB_WIDTHS, fallbackWidth = 960 } = {}) {
  if (!photo) return null;
  if (photo.src) {
    const sources = [];
    if (photo.avif) sources.push({ type: 'image/avif', srcSet: photo.avif });
    if (photo.webp) sources.push({ type: 'image/webp', srcSet: photo.webp });
    return { src: photo.src, srcSet: photo.srcSet, sources };
  }
  if (!photo.file) return null;
  return {
    src: commonsUrl(photo.file, fallbackWidth),
    srcSet: widths.map((w) => `${commonsUrl(photo.file, w)} ${w}w`).join(', '),
    sources: [],
  };
}

const CACHE_KEY = 'img:credits:v1';
const TTL = 14 * 24 * 60 * 60 * 1000;
const strip = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function readCache() {
  const c = readStorage(CACHE_KEY, null);
  return c && Date.now() - c.at < TTL ? c.items : {};
}

let inflight = null;
/**
 * Resolves author/licence for Commons files. Returns a map keyed by file name:
 * { artist, license, licenseUrl, page }. Unknown or failed lookups still get
 * `page`, so there is always a link to the full licence information.
 */
export async function getCredits(files) {
  const cached = readCache();
  const wanted = [...new Set(files.filter(Boolean))];
  const missing = wanted.filter((f) => !cached[f]);
  if (missing.length) {
    const run = async () => {
      const found = {};
      for (let i = 0; i < missing.length; i += 40) {
        const batch = missing.slice(i, i + 40);
        const q = new URLSearchParams({
          action: 'query', prop: 'imageinfo', iiprop: 'extmetadata', iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
          titles: batch.map((f) => `File:${f}`).join('|'), format: 'json', formatversion: '2', origin: '*',
        });
        const res = await fetch(`${API}?${q}`);
        if (!res.ok) throw new Error(`Commons ${res.status}`);
        const json = await res.json();
        const norm = Object.fromEntries((json.query?.normalized || []).map((n) => [n.to, n.from]));
        (json.query?.pages || []).forEach((pg) => {
          const title = norm[pg.title] || pg.title;
          const file = title.replace(/^File:/, '');
          const key = batch.find((b) => b === file || b.replace(/_/g, ' ') === file) || file;
          const m = pg.imageinfo?.[0]?.extmetadata || {};
          found[key] = {
            artist: strip(m.Artist?.value) || null,
            license: strip(m.LicenseShortName?.value) || null,
            licenseUrl: m.LicenseUrl?.value || null,
            missing: Boolean(pg.missing),
          };
        });
      }
      const merged = { ...readCache(), ...found };
      writeStorage(CACHE_KEY, { at: Date.now(), items: merged });
      return merged;
    };
    inflight = inflight || run().finally(() => { inflight = null; });
    try { Object.assign(cached, await inflight); } catch { /* offline: fall back to file-page links */ }
  }
  return Object.fromEntries(wanted.map((f) => [f, { ...(cached[f] || {}), page: commonsPage(f) }]));
}

/** Short one-line credit, e.g. "Photo: Jane Doe, CC BY-SA 4.0 · Wikimedia Commons". */
export function creditLine(photo, credit) {
  if (photo?.credit) return photo.credit;
  const bits = [credit?.artist, credit?.license].filter(Boolean).join(', ');
  return bits ? `Photo: ${bits} · Wikimedia Commons` : 'Photo: Wikimedia Commons';
}
