// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SlidePager, type SpreadTurn } from './pager';

const SLIDE_WIDTH = 400;

function mediaQuery(matches: boolean) {
  const listeners: (() => void)[] = [];
  const mq = {
    matches,
    addEventListener: (_: string, fn: () => void) => listeners.push(fn),
    set(value: boolean) {
      mq.matches = value;
      listeners.forEach((fn) => fn());
    },
  };
  return mq;
}

function setup(
  pageCount: number,
  {
    spreads = false,
    reduced = false,
    effect,
  }: {
    spreads?: boolean;
    reduced?: boolean;
    effect?: (turn: SpreadTurn) => boolean;
  } = {},
) {
  const scroller = document.createElement('ol');
  for (let page = 1; page <= pageCount; page += 1) {
    const li = document.createElement('li');
    li.dataset.page = String(page);
    const img = document.createElement('img');
    img.loading = page <= 2 ? 'eager' : 'lazy';
    li.appendChild(img);
    scroller.appendChild(li);
  }
  document.body.replaceChildren(scroller);
  // jsdom does no layout: give each slide the offset a real strip would have. In spreads
  // a slide is half the strip and the cover's margins fill the other half.
  const slideLeft = (page: number) =>
    spreadQuery.matches
      ? page === 1
        ? SLIDE_WIDTH / 2
        : (SLIDE_WIDTH / 2) * page
      : SLIDE_WIDTH * (page - 1);
  [...scroller.children].forEach((li, i) =>
    Object.defineProperty(li, 'offsetLeft', { get: () => slideLeft(i + 1) }),
  );
  let scrollLeft = 0;
  Object.defineProperty(scroller, 'scrollLeft', { get: () => scrollLeft });
  const scrollTo = vi.fn((opts: ScrollToOptions) => {
    scrollLeft = opts.left ?? scrollLeft;
  });
  scroller.scrollTo = scrollTo as unknown as typeof scroller.scrollTo;

  const spreadQuery = mediaQuery(spreads);
  const pager = new SlidePager(scroller, {
    spreadQuery: spreadQuery as unknown as MediaQueryList,
    prefersReducedMotion: () => reduced,
    turnEffect: effect,
  });
  const pages: number[] = [];
  pager.onPageChange((p) => pages.push(p));
  const swipeTo = (x: number) => {
    scrollLeft = x;
    scroller.dispatchEvent(new Event('scrollend'));
  };
  const img = (page: number) => scroller.children[page - 1].querySelector('img')!;
  return { pager, scroller, scrollTo, spreadQuery, pages, swipeTo, img };
}

describe('SlidePager', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('moves one page per turn on a phone, gliding unless motion is reduced', () => {
    const { pager, scrollTo, pages } = setup(3);
    pager.nextPage();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'smooth' });
    expect(pages).toEqual([2]);

    const reduced = setup(3, { reduced: true });
    reduced.pager.nextPage();
    expect(reduced.scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'instant' });
  });

  it('stops at both ends', () => {
    const { pager, scrollTo } = setup(2);
    pager.prevPage();
    expect(scrollTo).not.toHaveBeenCalled();
    pager.nextPage();
    pager.nextPage();
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(pager.canGoNext()).toBe(false);
  });

  it('turns spread by spread on a wide screen, cover first', () => {
    const { pager, pages } = setup(5, { spreads: true });
    pager.nextPage();
    expect(pager.getVisiblePages()).toEqual([2, 3]);
    pager.nextPage();
    expect(pager.getVisiblePages()).toEqual([4, 5]);
    expect(pager.canGoNext()).toBe(false);
    expect(pages).toEqual([2, 4]);
  });

  it('jumps to any page, landing on the spread that holds it', () => {
    const { pager, scrollTo } = setup(7, { spreads: true });
    pager.goToPage(5, true);
    expect(pager.getVisiblePages()).toEqual([4, 5]);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 800, behavior: 'instant' });
  });

  it('follows a swipe once scrolling settles', () => {
    const { pager, swipeTo, pages } = setup(4);
    swipeTo(810);
    expect(pager.getCurrentPage()).toBe(3);
    expect(pages).toEqual([3]);
  });

  it('keeps the same page when the screen switches between pages and spreads', () => {
    const { pager, spreadQuery, scrollTo } = setup(7);
    pager.goToPage(5, true);
    spreadQuery.set(true);
    expect(pager.getVisiblePages()).toEqual([4, 5]);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 800, behavior: 'instant' });
  });

  it('requests the images just ahead before they scroll into sight', () => {
    const { pager, img } = setup(8);
    expect(img(3).loading).toBe('eager');
    expect(img(5).loading).toBe('lazy');
    pager.nextPage();
    pager.nextPage();
    expect(img(5).loading).toBe('eager');
  });

  it('hands button turns to the page-turn effect, which jumps instead of gliding', () => {
    const effect = vi.fn((turn: SpreadTurn) => {
      turn.jump();
      return true;
    });
    const { pager, scrollTo } = setup(5, { spreads: true, effect });
    pager.nextPage();
    expect(effect).toHaveBeenCalledWith(expect.objectContaining({ direction: 'next' }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'instant' });
  });

  it('skips the effect for jumps and reduced motion, and slides when it declines', () => {
    const effect = vi.fn(() => false);
    const { pager, scrollTo } = setup(5, { spreads: true, effect });
    pager.goToPage(4);
    expect(effect).not.toHaveBeenCalled();
    pager.prevPage();
    expect(effect).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'smooth' });

    const reduced = setup(5, { spreads: true, reduced: true, effect: vi.fn(() => true) });
    reduced.pager.nextPage();
    expect(reduced.scrollTo).toHaveBeenCalled();
  });
});
