// Renders every page of a Revista Imagen CEDA issue to WebP at the reader's widths and
// extracts each page's text for search, so the online reader ships images instead of
// running pdf.js in the browser. Render from CEDA's original PDF: the -web copy is
// downsampled to 150dpi and would blur the widest size.
// Usage: node scripts/render-magazine-pages.mjs <source.pdf> <issue-number> [--force]
// Requires poppler (brew install poppler) for pdftoppm, pdftotext and pdfinfo.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parseArgs } from './lib/magazine-args.mjs';
import { PAGE_WIDTHS, cleanPageText, dpiFor, pageFile, pagesDir } from './lib/magazine-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const args = parseArgs(process.argv.slice(2), (p) => existsSync(resolve(p)));
if (args.error) fail(args.error);
const { issue, force } = args;
const src = resolve(args.source);

for (const tool of ['pdftoppm', 'pdftotext', 'pdfinfo']) {
  if (spawnSync(tool, ['-v']).error?.code === 'ENOENT') {
    fail(`${tool} not found. Install poppler: brew install poppler`);
  }
}

const outDir = join(root, 'public', pagesDir(issue));
const metaOut = join(root, 'src/data/magazine-pages', `${issue}.json`);
if ((existsSync(outDir) || existsSync(metaOut)) && !force) {
  fail(`Pages for issue ${issue} already exist. Re-run with --force to replace them.`);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(dirname(metaOut), { recursive: true });

const info = execFileSync('pdfinfo', [src], { encoding: 'utf8' });
const pageCount = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
const widthPt = Number(info.match(/^Page size:\s+([\d.]+)/m)?.[1]);
if (!pageCount || !widthPt) fail(`Could not read page count/size from ${src}`);

const tmp = mkdtempSync(join(tmpdir(), 'ceda-pages-'));
try {
  execFileSync('pdftoppm', ['-r', String(dpiFor(widthPt)), '-png', src, join(tmp, 'p')]);
  const rasters = readdirSync(tmp)
    .filter((f) => f.endsWith('.png'))
    .sort();
  if (rasters.length !== pageCount) fail(`Expected ${pageCount} pages, rendered ${rasters.length}`);

  const pages = [];
  let bytes = 0;
  for (const [i, raster] of rasters.entries()) {
    const page = i + 1;
    const image = sharp(join(tmp, raster));
    const { width, height } = await image.metadata();
    for (const target of PAGE_WIDTHS) {
      const info = await image
        .clone()
        .resize({ width: target })
        // Text-heavy pages: full chroma keeps coloured type crisp at a small size cost.
        .webp({ quality: 78, smartSubsample: true, effort: 5 })
        .toFile(join(outDir, pageFile(page, target)));
      bytes += info.size;
    }
    const text = execFileSync(
      'pdftotext',
      ['-f', String(page), '-l', String(page), '-enc', 'UTF-8', src, '-'],
      { encoding: 'utf8' },
    );
    pages.push({ page, ratio: +(height / width).toFixed(4), text: cleanPageText(text) });
  }

  // Page proportions are read at build time (image dimensions, layout); the text is only
  // fetched by the browser when someone searches.
  writeFileSync(
    metaOut,
    JSON.stringify(
      { issue: Number(issue), widths: PAGE_WIDTHS, ratios: pages.map((p) => p.ratio) },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(
    join(outDir, 'texto.json'),
    JSON.stringify(pages.map((p) => ({ page: p.page, text: p.text }))),
  );

  console.log(
    `pages  public/${pagesDir(issue)}/  ${pageCount} pages × ${PAGE_WIDTHS.length} widths, ` +
      `${(bytes / 1024 / 1024).toFixed(1)}MB`,
  );
  console.log(`meta   src/data/magazine-pages/${issue}.json`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
