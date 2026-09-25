import { describe, expect, it } from 'vitest';
import { cleanPageText, dpiFor, pageFile, pagesDir } from './magazine-pages.mjs';

describe('magazine page helpers', () => {
  it('picks a DPI that reaches the widest published width', () => {
    // An A5 page is 419.5pt wide; 1600px needs ~275dpi.
    expect(dpiFor(419.528, 1600)).toBe(275);
    expect((dpiFor(419.528, 1600) / 72) * 419.528).toBeGreaterThanOrEqual(1600);
  });

  it('names files so they sort in reading order', () => {
    expect(pagesDir(318)).toBe('revista/paginas/318');
    expect(pageFile(3, 1080)).toBe('03-1080.webp');
    expect(pageFile(21, 640)).toBe('21-640.webp');
  });

  it('rejoins hyphenated line breaks and folds whitespace', () => {
    expect(cleanPageText('nuevas formas de comercia-\nlización.\n\n  Hola\f')).toBe(
      'nuevas formas de comercialización. Hola',
    );
  });

  it('keeps a real hyphen before a capital', () => {
    expect(cleanPageText('Ruta-\nNacional')).toBe('Ruta- Nacional');
  });
});
