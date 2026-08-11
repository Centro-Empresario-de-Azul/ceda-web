import { getPageText, type PdfDocument } from './pdf-engine';

export interface SearchResult {
  page: number;
  snippet: string;
}

const SNIPPET_RADIUS = 40;

export class SearchIndex {
  private pageText = new Map<number, string>();
  private ready: Promise<void> | null = null;

  constructor(
    private doc: PdfDocument,
    private pageCount: number,
  ) {}

  // Deferred until first use rather than started in the constructor: most visits to the
  // reader never touch search, so extracting text from every page shouldn't be unconditional.
  whenReady(): Promise<void> {
    if (!this.ready) this.ready = this.build();
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

  private async build(): Promise<void> {
    // One page's extraction failing (e.g. a malformed content stream) shouldn't disable
    // search for the rest of the issue — skip it and keep going.
    for (let n = 1; n <= this.pageCount; n += 1) {
      try {
        this.pageText.set(n, await getPageText(this.doc, n));
      } catch (err) {
        console.error(`SearchIndex: failed to extract text from page ${n}`, err);
      }
    }
  }
}
