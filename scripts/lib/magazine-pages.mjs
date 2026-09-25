// Shared by the page renderer (scripts/render-magazine-pages.mjs) and the site, which
// builds the same URLs in src/lib/reader/page-images.ts. Keep the two in step.

/** Widths each page is published at. The reader's srcset picks among them. */
export const PAGE_WIDTHS = [640, 1080, 1600];

/** Rendering DPI that yields at least the widest PAGE_WIDTHS for a page `widthPt` wide. */
export function dpiFor(widthPt, targetWidth = Math.max(...PAGE_WIDTHS)) {
  return Math.ceil((targetWidth / widthPt) * 72);
}

/** public/-relative directory for an issue's page images and text. */
export const pagesDir = (issue) => `revista/paginas/${issue}`;

/** "03-1080.webp" — zero-padded so a directory listing sorts in reading order. */
export const pageFile = (page, width) => `${String(page).padStart(2, '0')}-${width}.webp`;

/** Collapses pdftotext output to searchable prose: hyphenated line breaks rejoined, runs
    of whitespace folded to single spaces. */
export function cleanPageText(text) {
  return text
    .replace(/\f/g, '')
    .replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
