# CEDA — Centro Empresario de Azul

Institutional site for the **cámara empresarial** representing commerce, industry and
services in Azul, Buenos Aires. Founded 1917.

Astro 7 static output · Tailwind CSS v4 (CSS-first `@theme`) · astro-icon with Iconify ·
Fontsource self-hosted woff2 · Cloudflare Workers Static Assets.

Setup, content-editing and deploy walkthroughs live in [`README.md`](./README.md).

## Commands

`npm run dev` · `npm run build` (typechecks first) · `npm run check` · `npm run lint` ·
`npm run lint:fix` · `npm run format` · `npm run preview` · `npm run deploy`

Git hooks install themselves via `npm run prepare`, which `npm install` triggers
(`core.hooksPath` → `.githooks/`):
`pre-commit` runs Prettier, ESLint and types; `pre-push` builds and greps the output for
the failure modes below. ESLint carries the `astro/jsx-a11y` rules, and `public/js/` is
capped at **ES2019** because it ships untranspiled.

Asset generators, run by hand when a source changes — they overwrite files in `public/`:

- `node scripts/prepare-logo.mjs` — logo, favicons, PWA icons
- `node scripts/generate-og.mjs` — Open Graph card
- `node scripts/prepare-magazine.mjs <pdf> <number>` — a magazine issue

## Where things live

- **Content is data.** `src/data/` holds `institutional` (subcommittees, foundation,
  benefits), `advocacy` (public-record work), `magazine` (issues), `events` (dated
  activities) and `programs` (initiatives, curriculum, prices). Edit there, not in markup —
  a teaser hardcoded in `index.astro` once kept advertising benefits that had been
  retracted from the data. Each module validates itself with **Zod** at build time, so a
  malformed entry fails the build instead of rendering wrong.
- **Identity is `src/site.ts`.** Never hardcode name, acronym, address or contact.
- `src/components/` — `SlashBand` · `MarkerCircle` · `PageHero` · `SectionHeader` ·
  `ContactBand` · `BusinessDirectory` · `ExternalLink` · `EventFeature` · `IssueCard`.
  `SectionHeader` picks the accessible orange for its background; `ExternalLink` is the
  only place `rel="noopener noreferrer"` is written.
- `/revista` grids the newest issue's year and folds earlier years into native `<details>`.
  No collapsible-section library — the CSP would block one anyway.
- `src/pages/` — `index` · `nosotros` · `programas` · `beneficios` · `revista` ·
  `contacto` · `404`.
- `public/` is passthrough and unfingerprinted; `dist/` is the build output wrangler
  deploys. Workers Static Assets, free plan: **20,000 files**, **25 MiB per file**, no
  aggregate cap and no storage cost. Only the per-file cap is ever close — raw magazine
  scans run ~60 MB, which is why `prepare-magazine.mjs` exists.

## Language

Two rules, cutting in opposite directions:

- **English** for everything internal: filenames, identifiers, comments, commits.
- **Spanish** for everything a user sees or clicks: copy, routes, downloadable files.

So `src/data/magazine.ts` exports `issues`, while the route is `/revista` and the download
is `/revista/imagen-ceda-316-web.pdf`. Files in `src/pages/` are routes, so they stay Spanish.

> Never bulk-rename with a bare regex. Spanish copy contains the same words as the
> identifiers — a pattern for `beneficios` rewrites "Ver beneficios" in the markup too.
> Verify against the built HTML in `dist/`; a corrupted string still compiles.

## Events

`data/events.ts` drives the band on `/` and `/programas` plus the `Event` schema. The
`upcoming` export filters on end date **at build time**, so a finished event only vanishes
on the next build — redeploy in the days after one, or the site still says "próxima
actividad".

Publish only what is on CEDA's own flyer. Ticket prices and speaker counts move until the
last minute; send those to WhatsApp rather than committing CEDA to a number.

## Editorial rules

- CEDA is a _cámara empresarial_, never an _entidad gremial_ — its own Instagram bio says
  the latter and is wrong.
- Contact is WhatsApp **2281 47-7297**. The landline 02281 42-4028 is retired.
- Publish only what traces to CEDA material or a named source. Every `advocacy` entry
  carries its source link; anything unconfirmed carries a visible note.
- CEDA does **not** sit on the Ente Mixto de Turismo (EMTUR). It articulates the private
  side of the offer — do not word it as membership.
- CEDA and **Fundación CEDA** are different entities with different leadership. Martín
  Picaroni presides CEDA; Ramiro Layús presides the Fundación and is CEDA's secretario.
  Attribute each activity to whichever one actually ran it.

## Brand

Colours are sampled from CEDA's own artwork — never approximate them.

| Token                 | Hex       | Use                                                    |
| --------------------- | --------- | ------------------------------------------------------ |
| `--color-navy`        | `#1c3a70` | Primary                                                |
| `--color-navy-deep`   | `#14284f` | Footer, gradient floor                                 |
| `--color-orange`      | `#ed7016` | **Graphics only** — 3.03:1 on white, fails AA for text |
| `--color-orange-deep` | `#b8480f` | Orange text and button fills — 5.3:1 on white          |
| `--color-sky`         | `#eff4fa` | Alternating sections                                   |

Two signature devices, both from CEDA's print material: the **slash band** and the
**marker circle**. Use them sparingly — overuse kills them. The slash band needs its white
base; over navy the navy stripes vanish and it reads as stray orange dashes.

## Traps

Each of these has already cost a debugging cycle:

- Tailwind's `--text-*` keys generate font-size _utilities_: write `text-display`, never
  `text-[var(--text-display)]`.
- Scroll-driven animations need longhand `animation-*` properties. The minifier folds a
  shorthand plus `animation-timeline` into one invalid declaration and drops it silently.
- astro-icon emits repeated icons as `<symbol>` + `<use>`. CSS cannot reach into a `<use>`
  shadow tree, so an icon needing a fill must be intrinsically filled — hence
  `ph:diamond-fill` rather than restyling a Lucide outline.
- `build.format: 'file'` emits `/index.html`, so the path normaliser in `Base.astro` must
  fold `/index` back to `/` or the home page canonicalises to a URL that does not exist.
- Executable JS must be an external file. The CSP is `script-src 'self'`, so an inline
  script is blocked and fails silently in production while working in `astro preview`.

## Pending

- Start date for the Herramientas Digitales programme.
- Walk-in hours. Only phone attention (8–15 h) is published.
- Second phone number. Issue 316 prints 2281 583969 for the office and, on another page,
  the retired 2281 424028. The site publishes only WhatsApp 2281 47-7297, which the same
  issue confirms as the socios channel — check with CEDA before adding either.
- `/novedades`, once there is verified material to publish.
