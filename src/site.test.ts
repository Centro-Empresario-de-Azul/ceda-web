import { describe, expect, it } from 'vitest';
import { affiliationsProse, site, whatsappJoinUrl } from './site';

describe('whatsappJoinUrl', () => {
  it('opens the chat with the joining message typed', () => {
    const url = new URL(whatsappJoinUrl);
    expect(`${url.origin}${url.pathname}`).toBe(site.whatsappUrl);
    expect(url.searchParams.get('text')).toBe(`Hola, quiero asociarme al ${site.acronym}.`);
  });
});

describe('affiliationsProse', () => {
  it('names every affiliation with its acronym', () => {
    expect(affiliationsProse).toBe(
      'la Confederación Argentina de la Mediana Empresa (CAME) y la Federación Económica de la Provincia de Buenos Aires (FEBA)',
    );
  });
});
