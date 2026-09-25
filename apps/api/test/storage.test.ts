import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sniffImage } from '../src/lib/imageType.ts';

test('image uploads are identified by their bytes, not their name', () => {
  const pad = (b: number[]) => Buffer.from([...b, ...new Array(16).fill(0)]);
  assert.equal(sniffImage(pad([0xff, 0xd8, 0xff, 0xe0])).mime, 'image/jpeg');
  assert.equal(sniffImage(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).mime, 'image/png');
  assert.equal(sniffImage(Buffer.concat([Buffer.from('RIFF\0\0\0\0WEBP'), Buffer.alloc(8)])).mime, 'image/webp');
  assert.equal(sniffImage(Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(10)])).mime, 'image/gif');
  assert.equal(sniffImage(Buffer.concat([Buffer.from('\0\0\0\x1cftypavif'), Buffer.alloc(8)])).mime, 'image/avif');
  assert.equal(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), null, 'SVG refused');
  assert.equal(sniffImage(Buffer.from('%PDF-1.7 not an image at all')), null);
  assert.equal(sniffImage(Buffer.from('MZ\x90\0 fake.jpg executable')), null);
  assert.equal(sniffImage(Buffer.from('tiny')), null);
});
