import { buildViews, viewIndexOf } from './spreads';
import type { PageNavigator } from './reader-navigation';

/** Two-page spreads need width and a landscape screen. Mirrors the spread block in
    global.css — change both together. */
export const SPREAD_QUERY = '(min-width: 1024px) and (min-aspect-ratio: 5/4)';

export interface PagerOptions {
  /** Matches when the reader shows two-page spreads (wide, landscape screens). */
  spreadQuery: MediaQueryList;
  prefersReducedMotion: () => boolean;
  /** Optional page-turn flourish for button/keyboard turns between two spreads. */
  turnEffect?: (turn: SpreadTurn) => boolean;
}

export interface SpreadTurn {
  direction: 'next' | 'prev';
  from: HTMLImageElement[];
  to: HTMLImageElement[];
  /** Moves the pager to the destination spread instantly, underneath the effect. */
  jump: () => void;
}

// How many views ahead/behind get their images requested before they scroll into sight.
const WARM_AHEAD = 2;

/**
 * Pages are laid out in a native horizontal scroll-snap strip: the browser does the
 * swiping, momentum and snapping on the compositor. This class only tracks which view is
 * showing and moves between views on request — it never reorders the DOM, which is what
 * made the old page-curl library jump the whole window on every turn.
 */
export class SlidePager implements PageNavigator {
  private slides: HTMLElement[];
  private views: number[][] = [];
  private current = 0;
  private listeners: ((page: number) => void)[] = [];
  private pendingTarget: number | null = null;
  private frame = 0;

  constructor(
    private scroller: HTMLElement,
    private options: PagerOptions,
  ) {
    this.slides = [...scroller.querySelectorAll<HTMLElement>('[data-page]')];
    this.views = buildViews(this.slides.length, options.spreadQuery.matches);

    scroller.addEventListener('scroll', () => this.scheduleSync(), { passive: true });
    // A swipe can interrupt a programmatic glide before it arrives; once scrolling
    // settles, wherever it stopped is the truth.
    scroller.addEventListener('scrollend', () => {
      this.pendingTarget = null;
      this.syncFromScroll();
    });
    // Rotating a tablet or resizing a window switches between single pages and spreads;
    // keep the reader on the page they were looking at.
    options.spreadQuery.addEventListener('change', () => {
      const page = this.getCurrentPage();
      this.views = buildViews(this.slides.length, options.spreadQuery.matches);
      this.current = viewIndexOf(this.views, page);
      this.scroller.scrollTo({ left: this.viewLeft(this.current), behavior: 'instant' });
      this.notify();
    });
    this.warm(0);
  }

  get pageCount(): number {
    return this.slides.length;
  }

  /** First page of the view on screen. */
  getCurrentPage(): number {
    return this.views[this.current]?.[0] ?? 1;
  }

  /** Every page on screen: one on a phone, up to two in a spread. */
  getVisiblePages(): number[] {
    return this.views[this.current] ?? [1];
  }

  onPageChange(listener: (page: number) => void): void {
    this.listeners.push(listener);
  }

  canGoPrev(): boolean {
    return this.current > 0;
  }

  canGoNext(): boolean {
    return this.current < this.views.length - 1;
  }

  prevPage(): void {
    if (this.canGoPrev()) this.goToView(this.current - 1, true);
  }

  nextPage(): void {
    if (this.canGoNext()) this.goToView(this.current + 1, true);
  }

  /** `instant` skips the glide — for opening at a linked page or following the zoom view. */
  goToPage(page: number, instant = false): void {
    if (!Number.isFinite(page)) return;
    this.goToView(viewIndexOf(this.views, Math.trunc(page)), false, instant);
  }

  private goToView(index: number, allowEffect: boolean, instant = false): void {
    if (index === this.current) return;
    const from = this.current;
    const left = this.viewLeft(index);
    const jump = () => this.scroller.scrollTo({ left, behavior: 'instant' });

    this.current = index;
    this.pendingTarget = left;
    this.warm(index);
    this.notify();

    const effect = this.options.turnEffect;
    const adjacent = Math.abs(index - from) === 1;
    if (allowEffect && effect && adjacent && !this.options.prefersReducedMotion()) {
      const handled = effect({
        direction: index > from ? 'next' : 'prev',
        from: this.imagesOf(from),
        to: this.imagesOf(index),
        jump,
      });
      if (handled) return;
    }

    this.scroller.scrollTo({
      left,
      behavior: instant || this.options.prefersReducedMotion() ? 'instant' : 'smooth',
    });
  }

  // The cover sits centred on its own; every other view starts at its first page.
  private viewLeft(index: number): number {
    if (index === 0) return 0;
    const first = this.views[index]?.[0];
    const slide = first ? this.slides[first - 1] : undefined;
    return slide ? slide.offsetLeft : 0;
  }

  private imagesOf(index: number): HTMLImageElement[] {
    return (this.views[index] ?? [])
      .map((page) => this.slides[page - 1]?.querySelector('img'))
      .filter((img): img is HTMLImageElement => img instanceof HTMLImageElement);
  }

  private scheduleSync(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.syncFromScroll();
    });
  }

  // A swipe or trackpad scroll changes the view without going through goToView; the
  // nearest view to the scroll position is the one on screen. While a programmatic move
  // is still gliding there, intermediate positions are ignored so the counter doesn't
  // count through every page it passes.
  private syncFromScroll(): void {
    const x = this.scroller.scrollLeft;
    if (this.pendingTarget !== null) {
      if (Math.abs(x - this.pendingTarget) > 2) return;
      this.pendingTarget = null;
    }
    let nearest = 0;
    let best = Infinity;
    this.views.forEach((_, i) => {
      const distance = Math.abs(this.viewLeft(i) - x);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    if (nearest === this.current) return;
    this.current = nearest;
    this.warm(nearest);
    this.notify();
  }

  // loading="lazy" is unreliable for images off to the side in a scroller, so the pages
  // just ahead are requested explicitly.
  private warm(index: number): void {
    for (let i = index - 1; i <= index + WARM_AHEAD; i += 1) {
      for (const img of this.imagesOf(i)) {
        if (img.loading === 'lazy') img.loading = 'eager';
      }
    }
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.getCurrentPage());
  }
}
