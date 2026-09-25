// Prepares a Revista Imagen CEDA issue: the compressed PDF for download, the cover, and
// (via render-magazine-pages.mjs) the page images and text the online reader uses.
// Losslessly-exported CorelDRAW PDFs run ~58MB; ghostscript re-encodes images but keeps
// text vector, ~2.5MB.
// Usage: node scripts/prepare-magazine.mjs <source.pdf> <issue-number> [--force]
// Requires ghostscript and poppler (brew install ghostscript poppler).

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { checkAssetSize, parseArgs, psString } from './lib/magazine-args.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const args = parseArgs(process.argv.slice(2), (p) => existsSync(resolve(p)));
if (args.error) fail(args.error);
const { issue, force } = args;
const src = resolve(args.source);

if (spawnSync('gs', ['--version']).error?.code === 'ENOENT') {
  fail('Ghostscript (gs) not found. Install it: brew install ghostscript');
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

const existing = [pdfOut, coverOut].filter((p) => existsSync(p));
if (existing.length && !force) {
  fail(
    `Refusing to overwrite:\n${existing.map((p) => `  ${p.replace(root + '/', '')}`).join('\n')}\nRe-run with --force to replace them.`,
  );
}

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

const tooBig = checkAssetSize(statSync(pdfOut).size);
if (tooBig) {
  // Removed so an undeployable file is never left in public/ for the next build to pick up.
  unlinkSync(pdfOut);
  fail(tooBig);
}

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
const pages = execFileSync(
  'gs',
  [
    '-q',
    '-dNODISPLAY',
    `--permit-file-read=${pdfOut}`,
    '-c',
    `${psString(pdfOut)} (r) file runpdfbegin pdfpagecount = quit`,
  ],
  { encoding: 'utf8' },
).trim();
console.log(`pages  ${pages}`);

// The online reader shows pre-rendered page images, made from the original for sharpness.
execFileSync(
  process.execPath,
  [
    join(root, 'scripts/render-magazine-pages.mjs'),
    src,
    String(issue),
    ...(force ? ['--force'] : []),
  ],
  { stdio: 'inherit' },
);

console.log(`\nNow add issue ${issue} to src/data/magazine.ts with pages: ${pages}`);
