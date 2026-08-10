import { PageFlip } from 'page-flip';
import { renderPageToCanvas, type PdfDocument } from './pdf-engine';

const RENDER_SCALE = 1.5;
const NEIGHBOR_RADIUS = 1;
// Canvases further than this from the current page are freed. Wider than NEIGHBOR_RADIUS
// so ordinary back-and-forth flipping never re-renders a page it just left.
const KEEP_RADIUS = 3;

export class FlipbookReader {
  private pageFlip: PageFlip;
  private rendered = new Set<number>();
  private canvases = new Map<number, HTMLCanvasElement>();
  private currentPage = 1;
  private pageListeners: ((page: number) => void)[] = [];

  constructor(
    private container: HTMLElement,
    private doc: PdfDocument,
    private pageCount: number,
  ) {
    this.pageFlip = new PageFlip(container, {
      width: 550,
      height: 733,
      size: 'stretch',
      minWidth: 315,
      maxWidth: 1200,
      minHeight: 420,
      maxHeight: 1600,
      maxShadowOpacity: 0.5,
      showCover: true,
      // On. With it off StPageFlip preventDefaults touchstart, so a vertical drag starting
      // on the book scrolled the page 0px and the download button below stayed out of
      // reach. On, the same drag scrolls normally; the trade is that a tap now flips on
      // touch too, matching the click-to-flip desktop already had.
      mobileScrollSupport: true,
      swipeDistance: 30,
    });
  }

  async init(): Promise<void> {
    const pageElements: HTMLElement[] = [];
    for (let n = 1; n <= this.pageCount; n += 1) {
      const pageEl = document.createElement('div');
      pageEl.className = 'reader-page';
      const canvas = document.createElement('canvas');
      canvas.className = 'reader-page-canvas';
      pageEl.appendChild(canvas);
      this.canvases.set(n, canvas);
      pageElements.push(pageEl);
    }

    this.pageFlip.loadFromHTML(pageElements);
    // StPageFlip's page index is 0-based; the reader's public API is 1-based to match how
    // PDF pages are already numbered everywhere else in this codebase (issue.pages, etc).
    this.pageFlip.on('flip', (event) => {
      this.setCurrentPage((event.data as number) + 1);
      void this.renderAround(this.currentPage);
    });

    await this.renderAround(1);
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  /** Fires whenever the visible page changes, by gesture or by goToPage. */
  onPageChange(listener: (page: number) => void): void {
    this.pageListeners.push(listener);
  }

  async goToPage(pageNumber: number): Promise<void> {
    const target = Math.min(Math.max(Math.trunc(pageNumber), 1), this.pageCount);
    await this.renderAround(target);
    this.pageFlip.turnToPage(target - 1);
    this.setCurrentPage(target);
  }

  setGesturesEnabled(enabled: boolean): void {
    // page-flip has no public runtime toggle for its drag handling, so gestures are
    // disabled at the DOM level: with pointer events off, no drag/click ever reaches it.
    this.container.style.pointerEvents = enabled ? 'auto' : 'none';
  }

  private setCurrentPage(pageNumber: number): void {
    if (pageNumber === this.currentPage) return;
    this.currentPage = pageNumber;
    for (const listener of this.pageListeners) listener(pageNumber);
  }

  private async renderAround(pageNumber: number): Promise<void> {
    this.evictOutside(pageNumber);
    const start = Math.max(1, pageNumber - NEIGHBOR_RADIUS);
    const end = Math.min(this.pageCount, pageNumber + NEIGHBOR_RADIUS);
    for (let n = start; n <= end; n += 1) {
      await this.renderPage(n);
    }
  }

  // Zeroing a canvas frees its backing store; dropping it from `rendered` lets renderPage
  // paint it again if the reader comes back.
  private evictOutside(pageNumber: number): void {
    for (const n of this.rendered) {
      if (Math.abs(n - pageNumber) <= KEEP_RADIUS) continue;
      const canvas = this.canvases.get(n);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      this.rendered.delete(n);
    }
  }

  private async renderPage(pageNumber: number): Promise<void> {
    if (this.rendered.has(pageNumber)) return;
    const canvas = this.canvases.get(pageNumber);
    if (!canvas) return;
    await renderPageToCanvas(this.doc, pageNumber, canvas, RENDER_SCALE);
    this.rendered.add(pageNumber);
  }
}
