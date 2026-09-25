export const PAGE_WIDTHS: number[];
export function dpiFor(widthPt: number, targetWidth?: number): number;
export function pagesDir(issue: number | string): string;
export function pageFile(page: number, width: number): string;
export function cleanPageText(text: string): string;
