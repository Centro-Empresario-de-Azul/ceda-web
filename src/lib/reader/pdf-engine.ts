import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';

// Vite resolves and fingerprints the worker as a same-origin asset — no CDN, and it
// satisfies the CSP's worker-src 'self' rather than needing a remote workerSrc.
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export type PdfDocument = PDFDocumentProxy;

export async function loadPdf(url: string): Promise<PdfDocument> {
  const task = getDocument({ url });
  return task.promise;
}

export function getPageCount(doc: PdfDocument): number {
  return doc.numPages;
}

export async function renderPageToCanvas(
  doc: PdfDocument,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  await page.render({ canvasContext: context, viewport }).promise;
}

export async function getPageText(doc: PdfDocument, pageNumber: number): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
}
