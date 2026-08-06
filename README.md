# CEDA — Centro Empresario de Azul

Sitio institucional del **Centro Empresario de Azul (CEDA)**, la cámara empresarial que
representa al comercio, la industria y los servicios de Azul, Buenos Aires. Fundado en
1917, integra CAME y FEBA.

**Sitio:** [www.ceda.org.ar](https://www.ceda.org.ar) — _pendiente de delegación DNS_

Astro 7 (salida estática) · Tailwind CSS v4 · Cloudflare Workers Static Assets.
Las convenciones del proyecto están en [`CLAUDE.md`](./CLAUDE.md).

## Empezar

Requiere **Node ≥ 22.12** (lo pide Astro 7; hay un `.nvmrc` con la versión que usamos) y,
solo para preparar revistas, **Ghostscript** (`brew install ghostscript`).

```bash
npm install
npm run dev        # desarrollo, con URLs limpias y hot reload
npm run build      # verifica tipos y genera dist/
npm run preview    # sirve dist/ tal como se va a publicar
```

Para probar los headers y los 404 como los sirve Cloudflare, usá `npx wrangler dev`.

## Calidad

```bash
npm run lint       # ESLint sobre .astro, .ts y los scripts (incluye accesibilidad)
npm run lint:fix   # arregla lo que se pueda solo
npm run format     # Prettier sobre todo el proyecto
npm run check      # tipos (lo corre también el build)
```

Los hooks de Git se instalan solos con `npm install` (`core.hooksPath` → `.githooks/`):

| Hook         | Qué corre                               |
| ------------ | --------------------------------------- |
| `pre-commit` | formato + lint + tipos — rápido         |
| `pre-push`   | build + chequeos sobre el HTML generado |

El `pre-push` busca errores que el linter no puede ver porque producen código válido:
palabras pegadas por el colapso de espacios de Astro (`solo.Desde`), el teléfono fijo
viejo, links `bit.ly` y la frase "entidad gremial".

> `public/js/` se sirve **sin compilar**, así que ahí el linter limita la sintaxis a
> ES2019. En `src/` no hace falta: lo compila Astro.

## Actualizar contenido

Casi todo el texto vive en módulos, no en el markup.

| Qué querés cambiar                   | Dónde                       |
| ------------------------------------ | --------------------------- |
| Teléfono, correo, dirección, redes   | `src/site.ts`               |
| Subcomisiones, Fundación, beneficios | `src/data/institutional.ts` |
| Gestiones ante el municipio          | `src/data/advocacy.ts`      |
| Ediciones de la revista              | `src/data/magazine.ts`      |
| Charlas y jornadas                   | `src/data/events.ts`        |
| Programas, temario y precios         | `src/data/programs.ts`      |
| Textos de una página puntual         | `src/pages/<página>.astro`  |
| Fotos                                | `src/assets/img/`           |

Cada gestión en `advocacy.ts` lleva su fuente. Si no hay fuente pública, no se publica.

Cada módulo se valida con **Zod** al compilar: si a una entrada le falta un campo o una
fecha está mal escrita, el build falla y dice cuál es. No hace falta revisarlo a ojo.

### Publicar una edición de la revista

```bash
node scripts/prepare-magazine.mjs ~/Downloads/<archivo>.pdf 317
```

Comprime el PDF —el original ronda los 58 MB, queda en ~2,5 MB sin perder el texto— y
extrae la tapa. Después agregá la edición arriba de todo en `src/data/magazine.ts`.
Requiere Ghostscript (`brew install ghostscript`).

### Publicar una charla o jornada

Agregá la actividad en `src/data/events.ts` con la fecha, el horario y el lugar tal como
figuran en el afiche, y guardá el afiche en `src/assets/img/events/`. Aparece
automáticamente en el inicio y en `/programas`.

No publiques el precio de la entrada ni la cantidad de oradores: cambian hasta último
momento y la consulta va por WhatsApp.

> Una actividad desaparece sola cuando pasa la fecha, **pero recién en el próximo build**.
> Volvé a publicar el sitio después de cada evento.

### Cambiar el logo

Reemplazá los originales en `src/assets/brand/` y corré `node scripts/prepare-logo.mjs`.
Regenera el logo, los favicons y los iconos de la PWA. Si cambiás el logo, corré también
`node scripts/generate-og.mjs` para rehacer la imagen que se ve al compartir el sitio.

## Deploy

```bash
npm run deploy
```

Cloudflare Workers Builds corre solo el comando de deploy, así que `wrangler.jsonc` define
un hook `build` que genera `dist/` antes de publicar.

> En Cloudflare hay que dejar **Caching → Configuration → Browser Cache TTL** en
> _"Respect Existing Headers"_. Si no, Cloudflare pisa los `Cache-Control` de `_headers`.

### Google Search Console

No requiere tocar la CSP. Lo más simple, una vez delegado el dominio, es verificar por
registro TXT en el DNS. Si hiciera falta el método de etiqueta, completá
`googleSiteVerification` en `src/site.ts` y se agrega sola al `<head>`.

Cuando `ceda.org.ar` esté delegado a Cloudflare, descomentá el bloque `routes` de
`wrangler.jsonc` y publicá: Cloudflare crea el registro DNS y el certificado. El apex
redirige a `www` con una Redirect Rule, que corre antes que el Worker.

## Estructura

```text
src/
  data/          Contenido en módulos tipados y validados con Zod
                 (institutional · advocacy · magazine · events · programs)
  layouts/       Base.astro — head, nav, footer, schema
  components/    SlashBand · MarkerCircle · PageHero · SectionHeader · ContactBand
                 BusinessDirectory · ExternalLink · EventFeature · IssueCard
  pages/         index · nosotros · programas · beneficios · revista · contacto · 404
  assets/        img/ (fotos, con events/ y business-directory/) · brand/ (logo)
                 magazine/ (tapas)
  styles/        global.css — tokens de marca
  site.ts        Identidad, contacto y navegación
scripts/         Generadores de assets (logo, OG, revista)
public/          Passthrough: _headers, robots.txt, site.webmanifest, img/, js/, revista/
dist/            Salida del build — lo que publica wrangler (gitignored)
```

## Pendiente

- Fecha de inicio del programa Herramientas Digitales
- Horarios de atención al público presencial (solo está publicada la atención telefónica)
- Confirmar el teléfono de oficina 2281 583969 y la grafía de dos nombres de la comisión
- `/novedades`, cuando haya material verificado
- Delegación DNS de `ceda.org.ar`

## Contacto

España 620, Azul, Buenos Aires ·
WhatsApp [2281 47-7297](https://wa.me/5492281477297) ·
[comunicacionceda@gmail.com](mailto:comunicacionceda@gmail.com)
