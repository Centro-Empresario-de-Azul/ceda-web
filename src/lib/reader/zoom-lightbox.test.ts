// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./pdf-engine', () => ({
  renderPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

import { ZoomLightbox } from './zoom-lightbox';
import type { PdfDocument } from './pdf-engine';

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

function setup() {
  document.body.innerHTML = `
    <button id="zoom">Ampliar</button>
    <dialog id="lightbox"><button data-zoom-close>Cerrar</button></dialog>
  `;
  const dialog = document.getElementById('lightbox') as HTMLDialogElement;
  const zoomButton = document.getElementById('zoom') as HTMLButtonElement;
  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-zoom-close]')!;
  const onToggle = vi.fn();
  const lightbox = new ZoomLightbox(dialog, onToggle, zoomButton);
  return { dialog, zoomButton, closeButton, onToggle, lightbox };
}

describe('ZoomLightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens as a modal dialog and moves focus to the close button', async () => {
    const { dialog, zoomButton, closeButton, onToggle, lightbox } = setup();
    zoomButton.focus();

    await lightbox.open({} as PdfDocument, 1);

    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(closeButton);
    expect(onToggle).toHaveBeenLastCalledWith(true);
  });

  it('restores focus to the zoom button when the close button is used', async () => {
    const { dialog, zoomButton, closeButton, onToggle, lightbox } = setup();
    await lightbox.open({} as PdfDocument, 1);

    closeButton.click();

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(zoomButton);
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it('restores state when the browser closes the dialog itself, as on Escape', async () => {
    const { dialog, zoomButton, onToggle, lightbox } = setup();
    await lightbox.open({} as PdfDocument, 1);

    dialog.close();

    expect(document.activeElement).toBe(zoomButton);
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it('closes on a backdrop click but not on a click on the page', async () => {
    const { dialog, lightbox } = setup();
    await lightbox.open({} as PdfDocument, 1);

    dialog.querySelector('canvas')!.click();
    expect(dialog.open).toBe(true);

    dialog.click();
    expect(dialog.open).toBe(false);
  });
});
