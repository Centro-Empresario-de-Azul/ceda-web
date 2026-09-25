interface NavItem {
  href: string;
  label: string;
}

export interface Crumb {
  name: string;
  path: string;
}

// build.format 'file' emits /index.html and /nosotros.html; fold those and any trailing
// slash back to the clean route Cloudflare actually serves.
export function normalisePath(pathname: string): string {
  return pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '/')
    .replace(/(.)\/$/, '$1');
}

/** Home matches only itself; every other section also owns the pages below it. */
export function isNavActive(path: string, href: string): boolean {
  return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
}

/**
 * Inicio, then one crumb per path segment. Segments that are nav sections take the nav
 * label; the current page falls back to `pageName`.
 */
export function breadcrumbTrail(path: string, pageName: string, nav: readonly NavItem[]): Crumb[] {
  const trail: Crumb[] = [{ name: 'Inicio', path: '/' }];
  let current = '';
  for (const segment of path.split('/').filter(Boolean)) {
    current += `/${segment}`;
    const label = nav.find((n) => n.href === current)?.label;
    trail.push({ name: label ?? (current === path ? pageName : segment), path: current });
  }
  return trail;
}

/** "Imagen CEDA N.º 318 — CEDA" → "Imagen CEDA N.º 318". */
export function stripTitleSuffix(title: string, acronym: string): string {
  return title.replace(new RegExp(` — ${acronym}$`), '');
}
