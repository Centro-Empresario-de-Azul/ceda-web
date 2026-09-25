/**
 * The reader's views: one page each on a phone, or — like a printed magazine — the cover
 * alone followed by two-page spreads (2–3, 4–5, …) when there is room for them.
 */
export function buildViews(pageCount: number, spreads: boolean): number[][] {
  const views: number[][] = [];
  if (!spreads) {
    for (let page = 1; page <= pageCount; page += 1) views.push([page]);
    return views;
  }
  if (pageCount >= 1) views.push([1]);
  for (let page = 2; page <= pageCount; page += 2) {
    views.push(page + 1 <= pageCount ? [page, page + 1] : [page]);
  }
  return views;
}

/** Index of the view showing `page`, clamped into the issue. */
export function viewIndexOf(views: number[][], page: number): number {
  const last = views.length - 1;
  if (last < 0) return 0;
  const index = views.findIndex((view) => view.includes(page));
  if (index !== -1) return index;
  return page < 1 ? 0 : last;
}
