import { describe, expect, it } from 'vitest';
import { buildViews, viewIndexOf } from './spreads';

describe('buildViews', () => {
  it('shows one page per view on a phone', () => {
    expect(buildViews(3, false)).toEqual([[1], [2], [3]]);
  });

  it('keeps the cover alone and pairs the rest, like a printed magazine', () => {
    expect(buildViews(5, true)).toEqual([[1], [2, 3], [4, 5]]);
  });

  it('leaves a last even page on its own', () => {
    expect(buildViews(4, true)).toEqual([[1], [2, 3], [4]]);
  });
});

describe('viewIndexOf', () => {
  const views = buildViews(21, true);

  it('finds the spread holding either of its pages', () => {
    expect(viewIndexOf(views, 2)).toBe(1);
    expect(viewIndexOf(views, 3)).toBe(1);
    expect(viewIndexOf(views, 21)).toBe(10);
  });

  it('clamps pages outside the issue', () => {
    expect(viewIndexOf(views, 0)).toBe(0);
    expect(viewIndexOf(views, 99)).toBe(10);
  });
});
