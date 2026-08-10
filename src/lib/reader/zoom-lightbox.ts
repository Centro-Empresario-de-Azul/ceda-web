import { renderPageToCanvas, type PdfDocument } from './pdf-engine';

const ZOOM_SCALE = 3;

export class ZoomLightbox {
  private canvas: HTMLCanvasElement;
  private isOpen = false;

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

  async open(doc: PdfDocument, pageNumber: number): Promise<void> {
    await renderPageToCanvas(doc, pageNumber, this.canvas, ZOOM_SCALE);
    this.root.classList.remove('hidden');
    this.isOpen = true;
    this.onToggle(true);
  }

  close(): void {
    this.root.classList.add('hidden');
    this.isOpen = false;
    this.onToggle(false);
  }
}
