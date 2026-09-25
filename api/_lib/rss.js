/**
 * Minimal RSS 2.0 / Atom parser (no dependencies). Extracts only the fields
 * we display. All text is stripped of HTML; URLs must be http(s).
 */
import { clean, safeUrl, iso } from './http.js';

function tag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i');
  const m = block.match(re);
  return m ? m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1') : '';
}
function attr(block, name, attrName) {
  const re = new RegExp(`<${name}\\b[^>]*\\b${attrName}=["']([^"']+)["'][^>]*>`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}
function firstImage(block) {
  const media = attr(block, 'media:thumbnail', 'url') || attr(block, 'media:content', 'url');
  if (media) return media;
  const enc = block.match(/<enclosure\b[^>]*type=["']image\/[^"']*["'][^>]*>/i) || block.match(/<enclosure\b[^>]*url=["'][^"']+\.(?:jpe?g|png|webp)[^"']*["'][^>]*>/i);
  if (enc) { const u = enc[0].match(/url=["']([^"']+)["']/i); if (u) return u[1]; }
  const raw = tag(block, 'description') + tag(block, 'content:encoded') + tag(block, 'content');
  const img = raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').match(/<img[^>]+src=["']([^"']+)["']/i);
  return img ? img[1] : '';
}

export function parseFeed(xml, { source, category, region }) {
  if (typeof xml !== 'string' || !/<(rss|feed|rdf:RDF)\b/i.test(xml)) return [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  const out = [];
  for (const b of blocks.slice(0, 40)) {
    const title = clean(tag(b, 'title'), 220);
    let link = tag(b, 'link').trim();
    if (!link || link.startsWith('<')) link = attr(b, 'link', 'href');
    const url = safeUrl(clean(link, 800));
    if (!title || !url) continue;
    const description = clean(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded') || tag(b, 'content'), 320);
    const publishedAt = iso(clean(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'), 60));
    const image = safeUrl(firstImage(b));
    out.push({ title, description: description === title ? '' : description, url, source, publishedAt, image, category, region });
  }
  return out;
}
