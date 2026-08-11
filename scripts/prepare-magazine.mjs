// Compresses a Revista Imagen CEDA issue and extracts its cover. Losslessly-exported
// CorelDRAW PDFs run ~58MB; ghostscript re-encodes images but keeps text vector, ~2.5MB.
// Usage: node scripts/prepare-magazine.mjs <source.pdf> <issue-number> (requires ghostscript)

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [source, issue] = process.argv.slice(2);

if (!source || !issue) {
  console.error('Usage: node scripts/prepare-magazine.mjs <source.pdf> <issue-number>');
  process.exit(1);
}

const src = resolve(source);
if (!existsSync(src)) {
  console.error(`Source not found: ${src}`);
  process.exit(1);
}

const pdfDir = join(root, 'public/revista');
const coverDir = join(root, 'src/assets/magazine');
mkdirSync(pdfDir, { recursive: true });
mkdirSync(coverDir, { recursive: true });

// The -web suffix marks this as the edition prepared for the site, distinct from the
// print master CEDA sends. It names why the file differs rather than how it was made, so
// it stays accurate if the compression settings ever change.
const pdfOut = join(pdfDir, `imagen-ceda-${issue}-web.pdf`);
const coverOut = join(coverDir, `cover-${issue}.jpg`);

const mb = (p) => `${(statSync(p).size / 1024 / 1024).toFixed(1)}MB`;

// /ebook downsamples images to 150dpi — indistinguishable on screen, and the only
// setting that gets a 22-page issue under 3MB.
execFileSync('gs', [
  '-sDEVICE=pdfwrite',
  '-dCompatibilityLevel=1.7',
  '-dPDFSETTINGS=/ebook',
  '-dDetectDuplicateImages=true',
  '-dNOPAUSE',
  '-dQUIET',
  '-dBATCH',
  `-sOutputFile=${pdfOut}`,
  src,
]);
console.log(`pdf    ${pdfOut.replace(root + '/', '')}  ${mb(src)} -> ${mb(pdfOut)}`);

// Cover, for the listing on /revista.
execFileSync('gs', [
  '-sDEVICE=jpeg',
  '-dJPEGQ=88',
  '-r150',
  '-dFirstPage=1',
  '-dLastPage=1',
  '-dNOPAUSE',
  '-dQUIET',
  '-dBATCH',
  `-sOutputFile=${coverOut}`,
  src,
]);
console.log(`cover  ${coverOut.replace(root + '/', '')}  ${mb(coverOut)}`);
console.log(`\nNow add issue ${issue} to src/data/magazine.ts`);
