import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchIndex } from './search-index';
import { getPageText, type PdfDocument } from './pdf-engine';

vi.mock('./pdf-engine', () => ({
  getPageText: vi.fn(),
}));

const fakeDoc = {} as PdfDocument;

function buildIndex(pages: Record<number, string>): SearchIndex {
  const pageCount = Math.max(...Object.keys(pages).map(Number));
  vi.mocked(getPageText).mockImplementation(async (_doc, pageNumber) =>
    Object.prototype.hasOwnProperty.call(pages, pageNumber) ? pages[pageNumber] : '',
  );
  return new SearchIndex(fakeDoc, pageCount);
}

describe('SearchIndex', () => {
  beforeEach(() => {
    vi.mocked(getPageText).mockReset();
  });

  it('returns no results for queries shorter than 3 characters', async () => {
    const index = buildIndex({ 1: 'La Cámara Empresaria de Azul' });
    await index.whenReady();

    expect(index.search('az')).toEqual([]);
    expect(index.search('  a  ')).toEqual([]);
  });

  it('ignores accents in both the query and the page text', async () => {
    const index = buildIndex({ 1: 'El Año 1917 marca la fundación' });
    await index.whenReady();

    expect(index.search('ano')).toHaveLength(1);
    expect(index.search('Año')).toHaveLength(1);
  });

  it('matches whole words only, not substrings', async () => {
    const index = buildIndex({ 1: 'La localidad de Azuleño no existe' });
    await index.whenReady();

    expect(index.search('azul')).toEqual([]);
  });

  it('finds a real whole-word match', async () => {
    const index = buildIndex({ 1: 'Turismo en Azul crece cada año' });
    await index.whenReady();

    const results = index.search('azul');
    expect(results).toHaveLength(1);
    expect(results[0].page).toBe(1);
  });

  it('keeps snippet offsets aligned when the raw text has an already-decomposed accent', async () => {
    // A standalone combining acute (as pdf.js can emit) rather than a precomposed 'é' --
    // normalize() strips it, so the normalized string is shorter than the raw one here.
    const decomposedE = 'é';
    const text = `Informe${decomposedE} sobre el crecimiento en Azul durante el año.`;
    const index = buildIndex({ 1: text });
    await index.whenReady();

    const results = index.search('crecimiento');
    expect(results).toHaveLength(1);

    const matchStart = text.indexOf('crecimiento');
    const start = Math.max(0, matchStart - 40);
    const end = Math.min(text.length, matchStart + 'crecimiento'.length + 40);
    const expectedSnippet =
      (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');

    expect(results[0].snippet).toBe(expectedSnippet);
  });

  it('sorts results by page ascending', async () => {
    const index = buildIndex({
      3: 'CEDA organiza el evento',
      1: 'CEDA presenta su balance',
      2: 'Nada relevante aquí',
    });
    await index.whenReady();

    expect(index.search('ceda').map((r) => r.page)).toEqual([1, 3]);
  });

  it('builds the index only once, even if whenReady is called concurrently', async () => {
    const index = buildIndex({ 1: 'texto de prueba' });
    await Promise.all([index.whenReady(), index.whenReady(), index.whenReady()]);

    expect(vi.mocked(getPageText)).toHaveBeenCalledTimes(1);
  });

  it('skips a page whose text extraction fails, without failing the whole build', async () => {
    vi.mocked(getPageText).mockImplementation(async (_doc, pageNumber) => {
      if (pageNumber === 1) throw new Error('malformed content stream');
      return 'CEDA celebra su aniversario';
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const index = new SearchIndex(fakeDoc, 2);
    await index.whenReady();

    expect(index.search('ceda')).toEqual([{ page: 2, snippet: 'CEDA celebra su aniversario' }]);
    consoleErrorSpy.mockRestore();
  });
});
