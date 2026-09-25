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
  // jsdom does no layout: mirror global.css. In spreads a slide is half the strip, and
  // the lone covers (the first page, and an even-numbered last page) get quarter margins.
  const layout = () => {
    const slides: { left: number; width: number }[] = [];
    let x = 0;
    for (let page = 1; page <= pageCount; page += 1) {
      if (!spreadQuery.matches) {
        slides.push({ left: x, width: SLIDE_WIDTH });
        x += SLIDE_WIDTH;
        continue;
      }
      const lone = page === 1 || (page === pageCount && page % 2 === 0);
      const margin = lone ? SLIDE_WIDTH / 4 : 0;
      slides.push({ left: x + margin, width: SLIDE_WIDTH / 2 });
      x += SLIDE_WIDTH / 2 + 2 * margin;
    }
    return { slides, scrollWidth: x };
  };
  [...scroller.children].forEach((li, i) => {
    Object.defineProperty(li, 'offsetLeft', { get: () => layout().slides[i].left });
    Object.defineProperty(li, 'offsetWidth', { get: () => layout().slides[i].width });
  });
  Object.defineProperty(scroller, 'clientWidth', { get: () => SLIDE_WIDTH });
  Object.defineProperty(scroller, 'scrollWidth', { get: () => layout().scrollWidth });
  let scrollLeft = 0;
  Object.defineProperty(scroller, 'scrollLeft', { get: () => scrollLeft });
  // Like a real scroller, it can't go past either end.
  const scrollTo = vi.fn((opts: ScrollToOptions) => {
    const max = layout().scrollWidth - SLIDE_WIDTH;
    scrollLeft = Math.min(Math.max(opts.left ?? scrollLeft, 0), max);
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
  const scrollWithoutEnd = (x: number) => {
    scrollLeft = x;
    scroller.dispatchEvent(new Event('scroll'));
  };
  const img = (page: number) => scroller.children[page - 1].querySelector('img')!;
  return { pager, scroller, scrollTo, spreadQuery, pages, swipeTo, scrollWithoutEnd, img };
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

  it('reaches a lone back cover on an even page count, centred like the front one', () => {
    const { pager, scrollTo, swipeTo } = setup(6, { spreads: true });
    pager.goToPage(6, true);
    expect(pager.getVisiblePages()).toEqual([6]);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 1200, behavior: 'instant' });
    swipeTo(1200);
    expect(pager.getVisiblePages()).toEqual([6]);
    expect(pager.canGoNext()).toBe(false);
    pager.prevPage();
    expect(pager.getVisiblePages()).toEqual([4, 5]);
  });

  it('settles on the scroll position without scrollend, after a pause', () => {
    vi.useFakeTimers();
    try {
      const { pager, scrollWithoutEnd } = setup(6);
      pager.nextPage();
      // A glide towards page 2 that a swipe carried on to page 4 instead.
      scrollWithoutEnd(1200);
      vi.advanceTimersByTime(200);
      expect(pager.getCurrentPage()).toBe(4);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps its target when a restarted glide ends the previous one early', () => {
    const { pager, swipeTo } = setup(8);
    pager.nextPage();
    pager.nextPage();
    // Chrome fires scrollend for the first glide, cut short on the way.
    swipeTo(500);
    expect(pager.getCurrentPage()).toBe(3);
    swipeTo(800);
    expect(pager.getCurrentPage()).toBe(3);
  });

  it('drops the glide target as soon as the reader touches the strip', () => {
    vi.useFakeTimers();
    try {
      const { pager, scroller, scrollWithoutEnd } = setup(6);
      pager.nextPage();
      scrollWithoutEnd(1200);
      vi.advanceTimersByTime(20);
      // Still gliding towards page 2: positions on the way are ignored.
      expect(pager.getCurrentPage()).toBe(2);

      scroller.dispatchEvent(new Event('pointerdown'));
      scrollWithoutEnd(1200);
      vi.advanceTimersByTime(20);
      expect(pager.getCurrentPage()).toBe(4);
    } finally {
      vi.useRealTimers();
    }
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
