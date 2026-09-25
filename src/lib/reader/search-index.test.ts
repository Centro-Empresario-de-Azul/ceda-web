import { describe, expect, it, vi } from 'vitest';
import { SearchIndex, searchSummary } from './search-index';

function buildIndex(pages: Record<number, string>): SearchIndex {
  const texts = Object.entries(pages).map(([page, text]) => ({ page: Number(page), text }));
  return new SearchIndex(async () => texts);
}

describe('SearchIndex', () => {
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

  it('matches queries that start or end with punctuation', async () => {
    const index = buildIndex({ 1: 'La cuota es de $4.000 por mes', 2: 'La 1.ª Ronda de Negocios' });
    await index.whenReady();

    expect(index.search('$4.000').map((r) => r.page)).toEqual([1]);
    expect(index.search('1.ª ronda').map((r) => r.page)).toEqual([2]);
  });

  it('keeps snippet offsets aligned after emoji, which are two UTF-16 units each', async () => {
    const text = `${'🎉'.repeat(10)} ${'a'.repeat(50)} crecimiento ${'b'.repeat(50)}`;
    const index = buildIndex({ 1: text });
    await index.whenReady();

    const matchStart = text.indexOf('crecimiento');
    expect(index.search('crecimiento')[0].snippet).toBe(
      `…${text.slice(matchStart - 40, matchStart + 'crecimiento'.length + 40).trim()}…`,
    );
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

  it('downloads the text only on first use, and only once', async () => {
    const load = vi.fn(async () => [{ page: 1, text: 'texto de prueba' }]);
    const index = new SearchIndex(load);
    expect(load).not.toHaveBeenCalled();

    await Promise.all([index.whenReady(), index.whenReady(), index.whenReady()]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('retries on the next search when the download fails', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ page: 2, text: 'CEDA celebra su aniversario' }]);
    const index = new SearchIndex(load);

    await expect(index.whenReady()).rejects.toThrow('offline');
    await index.whenReady();
    expect(index.search('ceda')).toEqual([{ page: 2, snippet: 'CEDA celebra su aniversario' }]);
  });
});

describe('searchSummary', () => {
  it('says when nothing matched, and how many pages did otherwise', () => {
    expect(searchSummary(0, 'azu')).toBe('Sin resultados para «azu».');
    expect(searchSummary(1, 'azul')).toBe('1 página con resultados.');
    expect(searchSummary(4, 'turismo')).toBe('4 páginas con resultados.');
  });
});
