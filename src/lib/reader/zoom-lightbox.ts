export interface ZoomSource {
  pageCount: number;
  /** The sharpest image for a page. */
  srcFor(page: number): string;
  altFor(page: number): string;
}

/** Fit the screen, fill its width, then twice that. Panning is plain native scrolling. */
export const ZOOM_LEVELS = ['fit', 'width', 'double'] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

// A native modal <dialog> supplies role, aria-modal, the focus trap and Escape-to-close.
export class ZoomLightbox {
  private img: HTMLImageElement;
  private viewport: HTMLElement;
  private closeButton: HTMLElement | null;
  private status: HTMLElement | null;
  private page = 1;
  private level: ZoomLevel = 'fit';

  constructor(
    private root: HTMLDialogElement,
    private source: ZoomSource,
    private returnFocusTo?: HTMLElement,
    private onPageChange?: (page: number) => void,
  ) {
    this.viewport = root.querySelector<HTMLElement>('[data-zoom-viewport]') ?? root;
    this.img = this.viewport.querySelector('img') ?? this.viewport.appendChild(new Image());
    this.closeButton = root.querySelector<HTMLElement>('[data-zoom-close]');
    this.status = root.querySelector<HTMLElement>('[data-zoom-status]');

    this.closeButton?.addEventListener('click', () => this.close());
    root.querySelector('[data-zoom-in]')?.addEventListener('click', () => this.step(1));
    root.querySelector('[data-zoom-out]')?.addEventListener('click', () => this.step(-1));
    root
      .querySelector('[data-zoom-prev]')
      ?.addEventListener('click', () => this.show(this.page - 1));
    root
      .querySelector('[data-zoom-next]')
      ?.addEventListener('click', () => this.show(this.page + 1));
    this.img.addEventListener('dblclick', () => this.step(this.level === 'double' ? -2 : 1));
    // A click on the dark surround (not the page, not a control) closes.
    this.viewport.addEventListener('click', (event) => {
      if (event.target === this.viewport) this.close();
    });
    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.show(this.page - 1);
      else if (event.key === 'ArrowRight') this.show(this.page + 1);
      else if (event.key === '+' || event.key === '=') this.step(1);
      else if (event.key === '-') this.step(-1);
    });
    // Fires for close() and for Escape alike, so both restore focus the same way.
    root.addEventListener('close', () => this.returnFocusTo?.focus());
  }

  get currentPage(): number {
    return this.page;
  }

  get zoomLevel(): ZoomLevel {
    return this.level;
  }

  open(page: number): void {
    this.setLevel('fit');
    this.show(page);
    if (!this.root.open) this.root.showModal();
    this.closeButton?.focus();
  }

  close(): void {
    if (this.root.open) this.root.close();
  }

  private show(page: number): void {
    const clamped = Math.min(Math.max(page, 1), this.source.pageCount);
    if (clamped !== page && this.root.open) return;
    this.page = clamped;
    this.img.src = this.source.srcFor(clamped);
    this.img.alt = this.source.altFor(clamped);
    this.viewport.scrollTo?.({ top: 0, left: 0 });
    if (this.status) this.status.textContent = `Página ${clamped} de ${this.source.pageCount}`;
    this.onPageChange?.(clamped);
  }

  private step(delta: number): void {
    const i = ZOOM_LEVELS.indexOf(this.level);
    const next = ZOOM_LEVELS[Math.min(Math.max(i + delta, 0), ZOOM_LEVELS.length - 1)];
    this.setLevel(next);
  }

  private setLevel(level: ZoomLevel): void {
    this.level = level;
    this.root.dataset.zoom = level;
  }
}
