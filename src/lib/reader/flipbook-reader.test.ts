// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadFromHTML = vi.fn();
const on = vi.fn();
const turnToPage = vi.fn();
const flipNext = vi.fn();
const flipPrev = vi.fn();
const getOrientation = vi.fn(() => 'portrait');

vi.mock('page-flip', () => ({
  PageFlip: vi.fn().mockImplementation(function PageFlipMock() {
    return { loadFromHTML, on, turnToPage, flipNext, flipPrev, getOrientation };
  }),
}));

vi.mock('./pdf-engine', () => ({
  renderPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

import { PageFlip } from 'page-flip';
import { FlipbookReader } from './flipbook-reader';
import type { PdfDocument } from './pdf-engine';

async function createReader(pageCount: number) {
  const reader = new FlipbookReader(document.createElement('div'), {} as PdfDocument, pageCount);
  await reader.init();
  return reader;
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: reduce && query.includes('reduce') })),
  );
}

describe('FlipbookReader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOrientation.mockReturnValue('portrait');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('overlays every page with its folio number, since the source scans carry none', async () => {
    await createReader(3);

    expect(loadFromHTML).toHaveBeenCalledTimes(1);
    const pageElements = loadFromHTML.mock.calls[0][0] as HTMLElement[];

    expect(pageElements).toHaveLength(3);
    pageElements.forEach((pageEl, i) => {
      const numberEl = pageEl.querySelector('.reader-page-number');
      expect(numberEl?.textContent).toBe(String(i + 1));
    });
  });

  it('flips forward and back through page-flip, stopping at the bounds', async () => {
    const reader = await createReader(3);

    reader.prevPage();
    expect(flipPrev).not.toHaveBeenCalled();

    reader.nextPage();
    expect(flipNext).toHaveBeenCalledTimes(1);

    await reader.goToPage(3);
    reader.nextPage();
    expect(flipNext).toHaveBeenCalledTimes(1);

    reader.prevPage();
    expect(flipPrev).toHaveBeenCalledTimes(1);
  });

  it('treats the last spread as the end of the book in landscape', async () => {
    getOrientation.mockReturnValue('landscape');
    const reader = await createReader(5);

    await reader.goToPage(4);
    expect(reader.canGoNext()).toBe(false);

    await reader.goToPage(2);
    expect(reader.canGoNext()).toBe(true);

    await reader.goToPage(1);
    expect(reader.canGoPrev()).toBe(false);
  });

  it('uses the default flip animation when motion is allowed', () => {
    stubReducedMotion(false);
    new FlipbookReader(document.createElement('div'), {} as PdfDocument, 1);

    expect(vi.mocked(PageFlip).mock.calls[0][1]).toMatchObject({ flippingTime: 1000 });
  });

  it('makes the flip near-instant when the user prefers reduced motion', () => {
    stubReducedMotion(true);
    new FlipbookReader(document.createElement('div'), {} as PdfDocument, 1);

    const { flippingTime } = vi.mocked(PageFlip).mock.calls[0][1];
    expect(flippingTime).toBeGreaterThan(0);
    expect(flippingTime).toBeLessThanOrEqual(10);
  });
});
