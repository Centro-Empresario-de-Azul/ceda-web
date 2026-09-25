import { renderPageToCanvas, type PdfDocument } from './pdf-engine';

const ZOOM_SCALE = 3;

// A native modal <dialog> supplies role, aria-modal, the focus trap and Escape-to-close.
export class ZoomLightbox {
  private canvas: HTMLCanvasElement;
  private closeButton: HTMLElement | null;
  private opening: Promise<void> | null = null;

  constructor(
    private root: HTMLDialogElement,
    private onToggle: (open: boolean) => void,
    private returnFocusTo?: HTMLElement,
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'zoom-lightbox-canvas';
    this.root.appendChild(this.canvas);
    // Click on the backdrop (not the page itself) closes — the canvas is smaller than
    // root, so a click that reaches root is always outside the rendered page.
    this.root.addEventListener('click', (event) => {
      if (event.target === this.root) this.close();
    });
    this.closeButton = this.root.querySelector<HTMLElement>('[data-zoom-close]');
    this.closeButton?.addEventListener('click', () => {
      this.close();
    });
    // Fires for close() and for Escape alike, so both restore state the same way.
    this.root.addEventListener('close', () => {
      this.onToggle(false);
      this.returnFocusTo?.focus();
    });
  }

  // Guards against a second render() starting on `canvas` before a first one (e.g. from a
  // double-click) finishes — pdf.js throws if two renders overlap on the same canvas.
  open(doc: PdfDocument, pageNumber: number): Promise<void> {
    if (this.opening) return this.opening;
    this.opening = renderPageToCanvas(doc, pageNumber, this.canvas, ZOOM_SCALE)
      .then(() => {
        if (!this.root.open) this.root.showModal();
        this.closeButton?.focus();
        this.onToggle(true);
      })
      .finally(() => {
        this.opening = null;
      });
    return this.opening;
  }

  close(): void {
    if (this.root.open) this.root.close();
  }
}
