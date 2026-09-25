/** "#p=5": a shareable link to a page of an issue. */
export function readerHash(page: number): string {
  return `#p=${page}`;
}

/** The page a "#p=N" link points at, or null when there is none or it's out of range. */
export function pageFromHash(hash: string, pageCount: number): number | null {
  const match = /^#p=(\d+)$/.exec(hash);
  if (!match) return null;
  const page = Number(match[1]);
  return page >= 1 && page <= pageCount ? page : null;
}
