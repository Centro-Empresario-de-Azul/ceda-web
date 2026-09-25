import { describe, expect, it } from 'vitest';
import { groupArchive } from './magazine-archive';

const issue = (n: number, iso: string) => ({ n, iso });

describe('groupArchive', () => {
  it('keeps the latest year as a grid and folds earlier years, newest first', () => {
    const { latest, thisYear, pastYears } = groupArchive([
      issue(318, '2026-09'),
      issue(317, '2026-08'),
      issue(288, '2024-02'),
      issue(287, '2024-01'),
      issue(282, '2023-08'),
    ]);
    expect(latest.n).toBe(318);
    expect(thisYear.map((i) => i.n)).toEqual([317]);
    expect(pastYears.map((y) => [y.year, y.items.map((i) => i.n)])).toEqual([
      ['2024', [288, 287]],
      ['2023', [282]],
    ]);
  });

  it('anchors the current year on the newest issue, not the calendar', () => {
    const { thisYear, pastYears } = groupArchive([issue(2, '2025-12'), issue(1, '2025-11')]);
    expect(thisYear.map((i) => i.n)).toEqual([1]);
    expect(pastYears).toEqual([]);
  });

  it('refuses an empty archive', () => {
    expect(() => groupArchive([])).toThrow();
  });
});
