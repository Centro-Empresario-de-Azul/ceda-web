interface Dated {
  iso: string;
}

const yearOf = (issue: Dated) => issue.iso.slice(0, 4);

/**
 * Splits a newest-first list into the latest issue, the rest of its year, and earlier years
 * (newest first). Anchored on the newest issue rather than the calendar year, so a gap of a
 * few months can't leave the current-year grid empty.
 */
export function groupArchive<T extends Dated>(issues: readonly T[]) {
  const [latest, ...older] = issues;
  if (!latest) throw new Error('groupArchive needs at least one issue');
  const currentYear = yearOf(latest);
  const earlier = older.filter((issue) => yearOf(issue) !== currentYear);
  return {
    latest,
    thisYear: older.filter((issue) => yearOf(issue) === currentYear),
    pastYears: [...new Set(earlier.map(yearOf))].map((year) => ({
      year,
      items: earlier.filter((issue) => yearOf(issue) === year),
    })),
  };
}
