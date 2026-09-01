import { getPageText, type PdfDocument } from './pdf-engine';

export interface SearchResult {
  page: number;
  snippet: string;
}

const SNIPPET_RADIUS = 40;
export const MIN_QUERY_LENGTH = 3;

// Strips accents (á, ñ, ü…) so "azul" matches "Azuleño" and "Ano" matches "Año" alike.
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

interface NormalizedText {
  normalized: string;
  // normalized[i] came from raw[map[i]] -- needed because a single raw character can
  // normalize to zero characters (a lone combining mark), so the two strings can drift
  // out of alignment; without this map, slicing a snippet out of `raw` at a `normalized`
  // match index can land one or more characters off.
  map: number[];
}

// Normalizes character-by-character (rather than the whole string at once) so each
// output character can be traced back to the raw character it came from.
function normalizeWithMap(raw: string): NormalizedText {
  let normalized = '';
  const map: number[] = [];
  for (const [rawIndex, char] of Array.from(raw).entries()) {
    for (const outChar of normalize(char)) {
      normalized += outChar;
      map.push(rawIndex);
    }
  }
  return { normalized, map };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface PageEntry {
  raw: string;
  normalized: string;
  map: number[];
}

export class SearchIndex {
  private pageText = new Map<number, PageEntry>();
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
    const needle = normalize(query.trim());
    if (needle.length < MIN_QUERY_LENGTH) return [];

    // Whole-word match: "azul" must not hit "azuleño".
    const pattern = new RegExp(`\\b${escapeRegExp(needle)}\\b`);

    const results: SearchResult[] = [];
    for (const [page, entry] of this.pageText) {
      const match = pattern.exec(entry.normalized);
      if (!match) continue;

      // Map the match's normalized-string offsets back to the raw text before slicing,
      // since the two strings can differ in length (see normalizeWithMap).
      const rawStart = entry.map[match.index] ?? entry.raw.length;
      const normalizedMatchEnd = match.index + match[0].length;
      const rawMatchEnd =
        normalizedMatchEnd < entry.map.length ? entry.map[normalizedMatchEnd] : entry.raw.length;

      const start = Math.max(0, rawStart - SNIPPET_RADIUS);
      const end = Math.min(entry.raw.length, rawMatchEnd + SNIPPET_RADIUS);
      const snippet =
        (start > 0 ? '…' : '') +
        entry.raw.slice(start, end).trim() +
        (end < entry.raw.length ? '…' : '');
      results.push({ page, snippet });
    }
    return results.sort((a, b) => a.page - b.page);
  }

  private async build(): Promise<void> {
    // One page's extraction failing (e.g. a malformed content stream) shouldn't disable
    // search for the rest of the issue -- skip it and keep going.
    for (let n = 1; n <= this.pageCount; n += 1) {
      try {
        const raw = await getPageText(this.doc, n);
        this.pageText.set(n, { raw, ...normalizeWithMap(raw) });
      } catch (err) {
        console.error(`SearchIndex: failed to extract text from page ${n}`, err);
      }
    }
  }
}
