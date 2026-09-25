// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

// public/js/nav.js ships untranspiled, so it is exercised as-is rather than imported.
// Resolved from the project root: under jsdom, import.meta.url is not a file: URL.
const script = readFileSync(resolve(process.cwd(), 'public/js/nav.js'), 'utf8');

function mount() {
  document.body.innerHTML = `
    <button id="nav-toggle" aria-expanded="false" aria-label="Abrir menú"></button>
    <div id="nav-mobile" class="hidden"><a href="/">Inicio</a></div>`;
  new Function(script)();
  return {
    toggle: document.getElementById('nav-toggle') as HTMLButtonElement,
    menu: document.getElementById('nav-mobile') as HTMLDivElement,
  };
}

const pressEscape = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

describe('nav.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens and closes the menu from the toggle', () => {
    const { toggle, menu } = mount();
    toggle.click();
    expect(menu.classList.contains('hidden')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Cerrar menú');
    toggle.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the toggle', () => {
    const { toggle, menu } = mount();
    toggle.click();
    (menu.querySelector('a') as HTMLAnchorElement).focus();
    pressEscape();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('leaves focus alone on Escape when the menu is already closed', () => {
    const { toggle } = mount();
    pressEscape();
    expect(document.activeElement).not.toBe(toggle);
  });
});
