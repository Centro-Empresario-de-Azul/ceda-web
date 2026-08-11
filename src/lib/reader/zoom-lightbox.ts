import { renderPageToCanvas, type PdfDocument } from './pdf-engine';

const ZOOM_SCALE = 3;

export class ZoomLightbox {
  private canvas: HTMLCanvasElement;
  private isOpen = false;
  private opening: Promise<void> | null = null;

  constructor(
    private root: HTMLElement,
    private onToggle: (open: boolean) => void,
  ) {
    this.root.classList.add('hidden');
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'zoom-lightbox-canvas';
    this.root.appendChild(this.canvas);
    // Click on the backdrop (not the page itself) closes — the canvas is smaller than
    // root, so a click that reaches root is always outside the rendered page.
    this.root.addEventListener('click', (event) => {
      if (event.target === this.root) this.close();
    });
    // The close button is rendered in the page markup so it can use the site's inlined
    // icon set; without it (and without Escape) the backdrop was the only way out.
    this.root.querySelector<HTMLElement>('[data-zoom-close]')?.addEventListener('click', () => {
      this.close();
    });
    document.addEventListener('keydown', (event) => {
      if (this.isOpen && event.key === 'Escape') this.close();
    });
  }

  // Guards against a second render() starting on `canvas` before a first one (e.g. from a
  // double-click) finishes — pdf.js throws if two renders overlap on the same canvas.
  open(doc: PdfDocument, pageNumber: number): Promise<void> {
    if (this.opening) return this.opening;
    this.opening = renderPageToCanvas(doc, pageNumber, this.canvas, ZOOM_SCALE)
      .then(() => {
        this.root.classList.remove('hidden');
        this.isOpen = true;
        this.onToggle(true);
      })
      .finally(() => {
        this.opening = null;
      });
    return this.opening;
  }

  close(): void {
    this.root.classList.add('hidden');
    this.isOpen = false;
    this.onToggle(false);
  }
}
