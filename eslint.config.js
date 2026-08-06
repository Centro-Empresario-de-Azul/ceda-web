// Flat config. Three areas with genuinely different constraints, so each gets its own
// language settings rather than one lowest-common-denominator rule set.
//
//   src/**        .astro and .ts — compiled by Astro/Vite, browser globals
//   scripts/**    .mjs build tools — Node globals, never shipped
//   public/js/**  shipped to browsers UNTRANSPILED, so the syntax ceiling is enforced here
//
// Type-checking lives in `astro check` (run by `npm run build`); this catches the things
// types do not — unused bindings, undeclared globals, unreachable code.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.astro/**', '.wrangler/**', 'node_modules/**'] },

  js.configs.recommended,
  // Scoped to TS/Astro only. Left global, the TypeScript parser also claims plain .js and
  // silently ignores `ecmaVersion`, which would defeat the syntax ceiling on public/js.
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: ['**/*.ts', '**/*.astro'] })),
  ...astro.configs.recommended,
  // Accessibility rules for .astro templates. They live in eslint-plugin-astro but are
  // inert without eslint-plugin-jsx-a11y installed alongside it. Catches missing alt text,
  // invalid aria-* and non-focusable interactive elements at lint time rather than at audit
  // time — the kind of regression that is cheap to introduce and expensive to find.
  ...astro.configs['jsx-a11y-recommended'],

  // Astro components and site source.
  {
    files: ['src/**/*.{astro,ts}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      // TypeScript already resolves these; no-undef cannot see type-only globals such as
      // ImageMetadata and reports false positives.
      'no-undef': 'off',
    },
  },

  // Build scripts: Node, not the browser.
  {
    files: ['scripts/**/*.mjs', '*.config.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // The only file that reaches a browser without a build step. Capped at ES2019 so no one
  // ships syntax that a visitor's browser has to understand natively — there is no
  // transpiler behind this file, and it is what makes the mobile menu work.
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'script',
      globals: { ...globals.browser },
    },
    rules: {
      'no-var': 'off', // deliberate in this file — it targets the widest possible support
    },
  },

  // Last: switches off every rule that would argue with Prettier about formatting.
  prettier,
];
