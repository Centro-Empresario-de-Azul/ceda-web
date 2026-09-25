// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bindReaderNavigation, type PageNavigator } from './reader-navigation';

function fakeReader(pageCount: number) {
  let page = 1;
  const listeners: ((page: number) => void)[] = [];
  const goTo = (target: number) => {
    page = target;
    for (const listener of listeners) listener(page);
  };
  const reader: PageNavigator = {
    canGoPrev: () => page > 1,
    canGoNext: () => page < pageCount,
    prevPage: vi.fn(() => {
      if (page > 1) goTo(page - 1);
    }),
    nextPage: vi.fn(() => {
      if (page < pageCount) goTo(page + 1);
    }),
    onPageChange: (listener) => listeners.push(listener),
  };
  return reader;
}

function setup(pageCount = 3) {
  document.body.innerHTML = `
    <section id="reader">
      <input id="search" type="search" />
      <input id="page" type="number" />
      <div id="book"></div>
      <button id="prev">Anterior</button>
      <button id="next">Siguiente</button>
      <dialog id="zoom"><button id="close">Cerrar</button></dialog>
    </section>
  `;
  const el = (id: string) => document.getElementById(id)!;
  const reader = fakeReader(pageCount);
  bindReaderNavigation(el('reader'), el('prev'), el('next'), reader);
  return { el, reader };
}

const press = (target: HTMLElement, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('bindReaderNavigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('pages with the Anterior and Siguiente buttons', () => {
    const { el, reader } = setup();

    el('next').click();
    expect(reader.nextPage).toHaveBeenCalledTimes(1);

    el('prev').click();
    expect(reader.prevPage).toHaveBeenCalledTimes(1);
  });

  it('marks Anterior disabled on the first page and Siguiente on the last', () => {
    const { el } = setup(2);
    expect(el('prev').getAttribute('aria-disabled')).toBe('true');
    expect(el('next').getAttribute('aria-disabled')).toBe('false');

    el('next').click();

    expect(el('prev').getAttribute('aria-disabled')).toBe('false');
    expect(el('next').getAttribute('aria-disabled')).toBe('true');
  });

  it('pages with ArrowLeft and ArrowRight when focus is inside the reader', () => {
    const { el, reader } = setup();

    const handled = !press(el('next'), 'ArrowRight');
    expect(reader.nextPage).toHaveBeenCalledTimes(1);
    expect(handled).toBe(true);

    press(el('book'), 'ArrowLeft');
    expect(reader.prevPage).toHaveBeenCalledTimes(1);
  });

  it.each(['search', 'page', 'close'])('leaves arrow keys alone inside #%s', (id) => {
    const { el, reader } = setup();

    const notCancelled = press(el(id), 'ArrowRight');
    press(el(id), 'ArrowLeft');

    expect(notCancelled).toBe(true);
    expect(reader.nextPage).not.toHaveBeenCalled();
    expect(reader.prevPage).not.toHaveBeenCalled();
  });

  it('ignores arrows combined with a modifier, such as browser back/forward', () => {
    const { el, reader } = setup();

    el('book').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }),
    );

    expect(reader.prevPage).not.toHaveBeenCalled();
  });
});
