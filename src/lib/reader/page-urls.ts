// Client-safe: the reader script builds zoom URLs with these, so this module must stay
// free of build-time imports (zod, import.meta.glob of every issue's metadata).
import { pageFile, pagesDir } from '../../../scripts/lib/magazine-pages.mjs';

export function pageUrl(issue: number, page: number, width: number): string {
  return `/${pagesDir(issue)}/${pageFile(page, width)}`;
}

export function textUrl(issue: number): string {
  return `/${pagesDir(issue)}/texto.json`;
}
