// Derives every brand raster from CEDA's HD masters in src/assets/brand.
//
// Run: node scripts/prepare-logo.mjs
//
// Two logo variants exist on purpose:
//   logo.png        full colour, referenced only by the JSON-LD schema, so search
//                   engines get true brand colour. Visitors never download it.
//   logo-white.png  the flat white silhouette the navy nav and footer actually render.
//                   Being single-colour it compresses to a fraction of the colour file,
//                   and it avoids the `brightness-0 invert` filter entirely.
//
// Note: passing `effort` to sharp's png() implicitly enables palette mode, which
// quantises to 256 colours and bands the gradient swoosh. Colour output must pass
// `palette: false` explicitly.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => join(root, 'src/assets/brand', f);
const out = (f) => join(root, 'public/img', f);
const PNG = { compressionLevel: 9, palette: false };

const report = [];
const write = async (pipeline, name) => {
  const info = await pipeline.toFile(out(name));
  report.push([name, `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(1)}KB`]);
};

// Alpha comes from distance to white. Solid artwork stays fully opaque with its colour
// untouched; only the narrow anti-aliased rim ramps, keeping the navy and the blue/orange
// swoosh true rather than washed out.
const WHITE = 246;
const SOLID = 228;

async function cutout(file) {
  const { data, info } = await sharp(src(file))
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold: 12 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = Buffer.from(data);
  for (let i = 0; i < px.length; i += info.channels) {
    const min = Math.min(px[i], px[i + 1], px[i + 2]);
    px[i + 3] =
      min >= WHITE ? 0 : min <= SOLID ? 255 : Math.round(((WHITE - min) / (WHITE - SOLID)) * 255);
  }
  return { px, info };
}

const { px, info } = await cutout('logo-hd.jpg');
const raw = { raw: { width: info.width, height: info.height, channels: info.channels } };

// Full colour, for structured data.
await write(sharp(px, raw).resize({ width: 800 }).png(PNG), 'logo.png');

// White silhouette, for the navy chrome. Alpha is preserved; RGB is forced to white.
const white = Buffer.from(px);
for (let i = 0; i < white.length; i += info.channels) {
  white[i] = white[i + 1] = white[i + 2] = 255;
}
await write(sharp(white, raw).resize({ width: 640 }).png(PNG), 'logo-white.png');

// Square lockup, padded, for touch icons and PWA.
const sq = await cutout('logo-hd-square.jpg');
const sqRaw = { raw: { width: sq.info.width, height: sq.info.height, channels: sq.info.channels } };
const mark = await sharp(sq.px, sqRaw).resize({ width: 880, fit: 'inside' }).png(PNG).toBuffer();

// sharp resizes before compositing within one pipeline, so the canvas is finished first
// and re-opened before scaling down.
const canvas = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: '#ffffff' },
})
  .composite([{ input: mark, gravity: 'center' }])
  .png(PNG)
  .toBuffer();

for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await write(sharp(canvas).resize(size, size).png(PNG), name);
}

// Maskable icons are cropped to a circle by the launcher, so the artwork has to sit
// inside the inner ~80% safe zone. The standard lockup spans the full width and would
// lose its edges, hence a separate, tighter composition.
const maskableMark = await sharp(sq.px, sqRaw)
  .resize({ width: 560, fit: 'inside' })
  .png(PNG)
  .toBuffer();
const maskable = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: '#ffffff' },
})
  .composite([{ input: maskableMark, gravity: 'center' }])
  .png(PNG)
  .toBuffer();
await write(sharp(maskable).resize(512, 512).png(PNG), 'icon-maskable-512.png');

// At favicon sizes the full lockup is unreadable, so it uses the "C" alone.
const cMark = await sharp(px, raw)
  .extract({ left: 0, top: 0, width: Math.round(info.width * 0.17), height: info.height })
  .png(PNG)
  .toBuffer();

// 180px is covered by apple-touch-icon.png, which uses the full lockup instead.
for (const [name, size] of [
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
]) {
  await write(
    sharp(cMark)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png(PNG),
    name,
  );
}

const pad = (s, n) => String(s).padEnd(n);
for (const [n, d, s] of report) console.log(`${pad(n, 22)} ${pad(d, 10)} ${s}`);
