// Builds the Open Graph card from CEDA's own assets. Deliberately text-free — no font
// rendering means the output is identical on any machine. Run: node scripts/generate-og.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;
const NAVY = '#1c3a70';
const NAVY_DEEP = '#14284f';
const ORANGE = '#ed7016';
const BAND = 26;

const slashBand = (y) => {
  const slashes = [];
  // 66deg slashes, matching .slash-band in global.css.
  const dx = BAND / Math.tan((66 * Math.PI) / 180);
  for (let x = -BAND; x < W + BAND * 2; x += 62) {
    slashes.push(
      `<polygon points="${x},${BAND} ${x + 18},${BAND} ${x + 18 + dx},0 ${x + dx},0" fill="${NAVY}"/>`,
      `<polygon points="${x + 30},${BAND} ${x + 48},${BAND} ${x + 48 + dx},0 ${x + 30 + dx},0" fill="${ORANGE}"/>`,
    );
  }
  return {
    input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAND}">${slashes.join('')}</svg>`,
    ),
    top: y,
    left: 0,
  };
};

const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0%" stop-color="${NAVY_DEEP}"/>
         <stop offset="100%" stop-color="${NAVY}"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
   </svg>`,
);

// Uses the ready-made white silhouette from prepare-logo.mjs, at its native 640px.
const logoPath = join(root, 'public/img/logo-white.png');
const logoWidth = 640;

const whiteLogo = await sharp(logoPath).resize({ width: logoWidth }).png().toBuffer();
const { height: logoHeight } = await sharp(whiteLogo).metadata();

await sharp(background)
  .composite([
    slashBand(0),
    slashBand(H - BAND),
    {
      input: whiteLogo,
      top: Math.round((H - logoHeight) / 2),
      left: Math.round((W - logoWidth) / 2),
    },
  ])
  .png()
  .toFile(join(root, 'public/img/og.png'));

console.log(`og.png written — ${W}x${H}`);
