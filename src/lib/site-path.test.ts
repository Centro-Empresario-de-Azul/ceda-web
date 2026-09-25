import { describe, expect, it } from 'vitest';
import { breadcrumbTrail, isNavActive, normalisePath, stripTitleSuffix } from './site-path';

const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/revista', label: 'Revista' },
];

describe('normalisePath', () => {
  it.each([
    ['/index.html', '/'],
    ['/', '/'],
    ['/nosotros.html', '/nosotros'],
    ['/nosotros/', '/nosotros'],
    ['/revista/318.html', '/revista/318'],
  ])('%s → %s', (input, expected) => {
    expect(normalisePath(input)).toBe(expected);
  });
});

describe('isNavActive', () => {
  it('matches a section and the pages below it', () => {
    expect(isNavActive('/revista', '/revista')).toBe(true);
    expect(isNavActive('/revista/318', '/revista')).toBe(true);
  });

  it('does not match a sibling that merely shares a prefix', () => {
    expect(isNavActive('/revistas', '/revista')).toBe(false);
  });

  it('matches home only on the home page', () => {
    expect(isNavActive('/', '/')).toBe(true);
    expect(isNavActive('/nosotros', '/')).toBe(false);
  });
});

describe('breadcrumbTrail', () => {
  it('uses the nav label for a top-level section', () => {
    expect(breadcrumbTrail('/nosotros', 'Nosotros — CEDA', nav)).toEqual([
      { name: 'Inicio', path: '/' },
      { name: 'Nosotros', path: '/nosotros' },
    ]);
  });

  it('includes the parent section for a nested page', () => {
    expect(breadcrumbTrail('/revista/318', 'Imagen CEDA N.º 318', nav)).toEqual([
      { name: 'Inicio', path: '/' },
      { name: 'Revista', path: '/revista' },
      { name: 'Imagen CEDA N.º 318', path: '/revista/318' },
    ]);
  });
});

describe('stripTitleSuffix', () => {
  it('drops the acronym suffix', () => {
    expect(stripTitleSuffix('Imagen CEDA N.º 318 — CEDA', 'CEDA')).toBe('Imagen CEDA N.º 318');
  });

  it('leaves a title without the suffix alone', () => {
    expect(stripTitleSuffix('CEDA — Centro Empresario de Azul', 'CEDA')).toBe(
      'CEDA — Centro Empresario de Azul',
    );
  });
});
