import { describe, expect, it } from 'vitest';
import { yearsSince } from './stats';

describe('yearsSince', () => {
  it('does not count the current year before the anniversary', () => {
    expect(yearsSince('1917-10-12', new Date(2026, 8, 25))).toBe(108);
  });

  it('counts it from the anniversary day on', () => {
    expect(yearsSince('1917-10-12', new Date(2026, 9, 12))).toBe(109);
    expect(yearsSince('1917-10-12', new Date(2026, 11, 1))).toBe(109);
  });
});
