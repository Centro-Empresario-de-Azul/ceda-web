// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

// public/js ships untranspiled, so the file is exercised as-is. Resolved from the project
// root: under jsdom, import.meta.url is not a file: URL.
const script = readFileSync(resolve(process.cwd(), 'public/js/benefit-filter.js'), 'utf8');

function mount() {
  document.body.innerHTML = `
    <div data-benefit-filter hidden>
      <button data-tag="" aria-pressed="true">Todos</button>
      <button data-tag="Pagos" aria-pressed="false">Pagos</button>
      <button data-tag="Seguros" aria-pressed="false">Seguros</button>
    </div>
    <p data-benefit-status></p>
    <ul data-benefit-list>
      <li data-tag="Pagos">A</li>
      <li data-tag="Pagos">B</li>
      <li data-tag="Seguros">C</li>
    </ul>`;
  new Function(script)();
  const q = (sel: string) => document.querySelector(sel) as HTMLElement;
  const visible = () =>
    [...document.querySelectorAll<HTMLElement>('[data-benefit-list] li')]
      .filter((li) => !li.hidden)
      .map((li) => li.textContent);
  return { q, visible };
}

describe('benefit-filter.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('reveals the controls only once the script runs', () => {
    const { q } = mount();
    expect(q('[data-benefit-filter]').hidden).toBe(false);
  });

  it('shows only the chosen category and announces the count', () => {
    const { q, visible } = mount();
    q('button[data-tag="Pagos"]').click();
    expect(visible()).toEqual(['A', 'B']);
    expect(q('button[data-tag="Pagos"]').getAttribute('aria-pressed')).toBe('true');
    expect(q('button[data-tag=""]').getAttribute('aria-pressed')).toBe('false');
    expect(q('[data-benefit-status]').textContent).toBe('2 beneficios');
  });

  it('uses the singular for one result and restores everything with Todos', () => {
    const { q, visible } = mount();
    q('button[data-tag="Seguros"]').click();
    expect(q('[data-benefit-status]').textContent).toBe('1 beneficio');
    q('button[data-tag=""]').click();
    expect(visible()).toEqual(['A', 'B', 'C']);
  });
});
