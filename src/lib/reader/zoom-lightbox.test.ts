// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZoomLightbox } from './zoom-lightbox';

// jsdom has no showModal/close, so stand in for the browser's modal behaviour.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

function setup(pageCount = 5) {
  document.body.innerHTML = `
    <button id="zoom">Ampliar</button>
    <dialog id="lightbox">
      <button data-zoom-prev>‹</button><p data-zoom-status></p><button data-zoom-next>›</button>
      <button data-zoom-out>−</button><button data-zoom-in>+</button>
      <button data-zoom-close>Cerrar</button>
      <div data-zoom-viewport><img alt="" /></div>
    </dialog>
  `;
  const dialog = document.getElementById('lightbox') as HTMLDialogElement;
  const zoomButton = document.getElementById('zoom') as HTMLButtonElement;
  const q = <T extends HTMLElement>(sel: string) => dialog.querySelector<T>(sel)!;
  const onPageChange = vi.fn();
  const lightbox = new ZoomLightbox(
    dialog,
    {
      pageCount,
      srcFor: (page) => `/p/${page}-1600.webp`,
      altFor: (page) => `Página ${page}`,
    },
    zoomButton,
    onPageChange,
  );
  const img = q<HTMLImageElement>('img');
  return { dialog, zoomButton, q, img, onPageChange, lightbox };
}

const key = (el: HTMLElement, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

describe('ZoomLightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens on the requested page at fit size, focusing the close button', () => {
    const { dialog, q, img, lightbox } = setup();
    lightbox.open(3);
    expect(dialog.open).toBe(true);
    expect(img.getAttribute('src')).toBe('/p/3-1600.webp');
    expect(q('[data-zoom-status]').textContent).toBe('Página 3 de 5');
    expect(dialog.dataset.zoom).toBe('fit');
    expect(document.activeElement).toBe(q('[data-zoom-close]'));
  });

  it('pages within the zoom view and reports each page to the reader', () => {
    const { dialog, q, img, onPageChange, lightbox } = setup();
    lightbox.open(2);
    q('[data-zoom-next]').click();
    expect(img.getAttribute('src')).toBe('/p/3-1600.webp');
    key(dialog, 'ArrowLeft');
    key(dialog, 'ArrowLeft');
    expect(img.getAttribute('src')).toBe('/p/1-1600.webp');
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('leaves the arrow keys to panning once zoomed in', () => {
    const { dialog, q, img, lightbox } = setup();
    lightbox.open(2);
    q('[data-zoom-in]').click();
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    dialog.dispatchEvent(event);
    expect(img.getAttribute('src')).toBe('/p/2-1600.webp');
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not page past either end', () => {
    const { q, img, lightbox } = setup(2);
    lightbox.open(2);
    q('[data-zoom-next]').click();
    expect(img.getAttribute('src')).toBe('/p/2-1600.webp');
    lightbox.open(1);
    q('[data-zoom-prev]').click();
    expect(img.getAttribute('src')).toBe('/p/1-1600.webp');
  });

  it('steps through zoom levels with the buttons, keys and a double-click', () => {
    const { dialog, q, img, lightbox } = setup();
    lightbox.open(1);
    q('[data-zoom-in]').click();
    expect(dialog.dataset.zoom).toBe('width');
    key(dialog, '+');
    expect(dialog.dataset.zoom).toBe('double');
    q('[data-zoom-in]').click();
    expect(dialog.dataset.zoom).toBe('double');
    img.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(dialog.dataset.zoom).toBe('fit');
    key(dialog, '-');
    expect(dialog.dataset.zoom).toBe('fit');
  });

  it('returns focus to the zoom button when closed, by button or Escape', () => {
    const { dialog, zoomButton, q, lightbox } = setup();
    lightbox.open(1);
    q('[data-zoom-close]').click();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(zoomButton);

    lightbox.open(1);
    dialog.close(); // what the browser does on Escape
    expect(document.activeElement).toBe(zoomButton);
  });

  it('closes on a click on the dark surround, not on the page', () => {
    const { dialog, q, img, lightbox } = setup();
    lightbox.open(1);
    img.click();
    expect(dialog.open).toBe(true);
    q('[data-zoom-viewport]').click();
    expect(dialog.open).toBe(false);
  });
});
