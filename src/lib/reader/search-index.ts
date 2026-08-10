import { getPageText, type PdfDocument } from './pdf-engine';

export interface SearchResult {
  page: number;
  snippet: string;
}

const SNIPPET_RADIUS = 40;

export class SearchIndex {
  private pageText = new Map<number, string>();
  private ready: Promise<void>;

  constructor(doc: PdfDocument, pageCount: number) {
    this.ready = this.build(doc, pageCount);
  }

  async whenReady(): Promise<void> {
    return this.ready;
  }

  search(query: string): SearchResult[] {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const results: SearchResult[] = [];
    for (const [page, text] of this.pageText) {
      const haystack = text.toLowerCase();
      const index = haystack.indexOf(needle);
      if (index === -1) continue;

      const start = Math.max(0, index - SNIPPET_RADIUS);
      const end = Math.min(text.length, index + needle.length + SNIPPET_RADIUS);
      const snippet =
        (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
      results.push({ page, snippet });
    }
    return results.sort((a, b) => a.page - b.page);
  }

  private async build(doc: PdfDocument, pageCount: number): Promise<void> {
    // Text extraction parses content streams without rasterizing, so it's cheap enough to
    // run for every page in the background — unlike canvas rendering, it isn't lazy.
    for (let n = 1; n <= pageCount; n += 1) {
      const text = await getPageText(doc, n);
      this.pageText.set(n, text);
    }
  }
}
