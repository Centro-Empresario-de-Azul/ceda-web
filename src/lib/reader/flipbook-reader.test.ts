// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

const loadFromHTML = vi.fn();
const on = vi.fn();
const turnToPage = vi.fn();

vi.mock('page-flip', () => ({
  PageFlip: vi.fn().mockImplementation(function PageFlipMock() {
    return { loadFromHTML, on, turnToPage };
  }),
}));

vi.mock('./pdf-engine', () => ({
  renderPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

import { FlipbookReader } from './flipbook-reader';
import type { PdfDocument } from './pdf-engine';

describe('FlipbookReader', () => {
  it('overlays every page with its folio number, since the source scans carry none', async () => {
    const container = document.createElement('div');
    const reader = new FlipbookReader(container, {} as PdfDocument, 3);
    await reader.init();

    expect(loadFromHTML).toHaveBeenCalledTimes(1);
    const pageElements = loadFromHTML.mock.calls[0][0] as HTMLElement[];

    expect(pageElements).toHaveLength(3);
    pageElements.forEach((pageEl, i) => {
      const numberEl = pageEl.querySelector('.reader-page-number');
      expect(numberEl?.textContent).toBe(String(i + 1));
    });
  });
});
