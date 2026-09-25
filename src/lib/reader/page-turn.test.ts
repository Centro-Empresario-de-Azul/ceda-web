// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPageTurn } from './page-turn';

interface FakeAnimation {
  finished: Promise<void>;
  resolve: () => void;
  reject: () => void;
}

let animations: FakeAnimation[] = [];

function page(name: string, loaded = true): HTMLImageElement {
  const img = document.createElement('img');
  img.src = `https://example.test/${name}.webp`;
  Object.defineProperty(img, 'complete', { value: loaded });
  Object.defineProperty(img, 'naturalWidth', { value: loaded ? 1080 : 0 });
  return img;
}

function setup() {
  const stage = document.createElement('div');
  document.body.replaceChildren(stage);
  const turn = createPageTurn(stage);
  const jump = vi.fn();
  const leaf = () => stage.querySelector<HTMLElement>('.page-turn-leaf');
  const faces = () => [...(leaf()?.querySelectorAll('img') ?? [])].map((img) => img.src);
  const still = () => stage.querySelector('.page-turn-still img')?.getAttribute('src');
  return { stage, turn, jump, leaf, faces, still };
}

// Lets the promise callbacks attached to `finished` run.
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('createPageTurn', () => {
  beforeEach(() => {
    animations = [];
    HTMLElement.prototype.animate = vi.fn(() => {
      const animation = {} as FakeAnimation;
      animation.finished = new Promise<void>((resolve, reject) => {
        animation.resolve = resolve;
        animation.reject = reject;
      });
      animations.push(animation);
      return animation as unknown as Animation;
    });
  });

  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
  });

  it('turning forward lifts the right page, hinged on the left, showing the next left page', () => {
    const { turn, jump, leaf, faces, still } = setup();
    const handled = turn({
      direction: 'next',
      from: [page('2'), page('3')],
      to: [page('4'), page('5')],
      jump,
    });
    expect(handled).toBe(true);
    expect(jump).toHaveBeenCalledTimes(1);
    expect(leaf()?.style.transformOrigin).toBe('left center');
    expect(faces()).toEqual(['https://example.test/3.webp', 'https://example.test/4.webp']);
    expect(still()).toBe('https://example.test/2.webp');
  });

  it('turning back mirrors it', () => {
    const { turn, jump, leaf, faces, still } = setup();
    turn({ direction: 'prev', from: [page('4'), page('5')], to: [page('2'), page('3')], jump });
    expect(leaf()?.style.transformOrigin).toBe('right center');
    expect(faces()).toEqual(['https://example.test/4.webp', 'https://example.test/3.webp']);
    expect(still()).toBe('https://example.test/5.webp');
  });

  it('declines for a lone cover, unloaded pages, or no animation support', () => {
    const { turn, jump, stage } = setup();
    expect(turn({ direction: 'next', from: [page('1')], to: [page('2'), page('3')], jump })).toBe(
      false,
    );
    expect(
      turn({
        direction: 'next',
        from: [page('2'), page('3')],
        to: [page('4', false), page('5')],
        jump,
      }),
    ).toBe(false);
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
    expect(
      turn({ direction: 'next', from: [page('2'), page('3')], to: [page('4'), page('5')], jump }),
    ).toBe(false);
    expect(jump).not.toHaveBeenCalled();
    expect(stage.children).toHaveLength(0);
  });

  it('removes its overlays when the turn ends or is cancelled', async () => {
    const { turn, jump, stage } = setup();
    const spread = () => ({ from: [page('2'), page('3')], to: [page('4'), page('5')], jump });
    turn({ direction: 'next', ...spread() });
    expect(stage.children).toHaveLength(2);
    animations[0].resolve();
    await flush();
    expect(stage.children).toHaveLength(0);

    turn({ direction: 'next', ...spread() });
    animations.at(-2)!.reject();
    await flush();
    expect(stage.children).toHaveLength(0);
  });

  it('clears a turn still in progress before starting the next one', async () => {
    const { turn, jump, stage, faces } = setup();
    turn({ direction: 'next', from: [page('2'), page('3')], to: [page('4'), page('5')], jump });
    turn({ direction: 'next', from: [page('4'), page('5')], to: [page('6'), page('7')], jump });
    expect(stage.children).toHaveLength(2);
    expect(faces()).toEqual(['https://example.test/5.webp', 'https://example.test/6.webp']);

    // The first turn's animation ending late must not remove the second turn's overlays.
    animations[0].resolve();
    await flush();
    expect(stage.children).toHaveLength(2);
  });
});
