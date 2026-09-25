# CEDA — Centro Empresario de Azul

Sitio institucional del **Centro Empresario de Azul (CEDA)**, la cámara empresarial que
representa al comercio, la industria y los servicios de Azul, Buenos Aires. Fundado en
1917, integra CAME y FEBA.

**Sitio:** [www.centroempresariodeazul.org.ar](https://www.centroempresariodeazul.org.ar) —
dominio provisorio hasta que se pueda registrar `ceda.org.ar` (ver [Dominio](#dominio)).

Astro 7 (salida estática) · Tailwind CSS v4 · Cloudflare Workers Static Assets.
Las convenciones del proyecto están en [`CLAUDE.md`](./CLAUDE.md).

## Empezar

Requiere **Node ≥ 22.12** (lo pide Astro 7; hay un `.nvmrc` con la versión que usamos) y,
solo para preparar revistas, **Ghostscript** y **Poppler** (`brew install ghostscript poppler`).

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
palabras pegadas por el colapso de espacios de Astro (`solo.Desde`), los teléfonos
viejos, links `bit.ly` y la frase "entidad gremial". También rechaza links externos
escritos a mano en lugar de `<ExternalLink>`.

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
| Textos de una página puntual         | `src/pages/<página>.astro`  |
| Fotos                                | `src/assets/img/`           |

Cada gestión en `advocacy.ts` lleva su fuente. Si no hay fuente pública, no se publica.

Cada módulo se valida con **Zod** al compilar: si a una entrada le falta un campo o una
fecha está mal escrita, el build falla y dice cuál es. No hace falta revisarlo a ojo.

### Publicar una edición de la revista

```bash
node scripts/prepare-magazine.mjs ~/Downloads/<archivo>.pdf 317
```

Usá el PDF **original** que manda CEDA. El script:

- comprime el PDF para descargar (el original ronda los 58 MB, queda en ~2,5 MB),
- extrae la tapa,
- convierte cada página en imágenes WebP (640, 1080 y 1600 px) en
  `public/revista/paginas/<número>/`, más el texto de cada página (`texto.json`) para el
  buscador, y guarda las proporciones en `src/data/magazine-pages/<número>.json`.

Tarda ~30 segundos por edición. Después agregá la edición arriba de todo en
`src/data/magazine.ts`, con la cantidad de páginas que indica el script (el build falla si
no coinciden).

El lector online muestra esas imágenes: no carga el PDF ni pdf.js. En el celular las
páginas se pasan deslizando; en la compu se ven de a dos, como la revista impresa. Para
volver a generar solo las imágenes: `node scripts/render-magazine-pages.mjs <pdf> <número>
--force`.

#### Sin instalar nada: desde GitHub

Si solo necesitás la versión reducida, GitHub la genera:

1. En el repo, **Releases → Draft a new release**.
2. Tag: `revista-<número>` (por ejemplo `revista-319`), creado sobre `main`. Adjuntá el PDF
   original (hasta 2 GB) y tocá **Publish release**.
3. En unos minutos el workflow _Reduce magazine_ (pestaña **Actions**) reemplaza en la
   release el PDF original por `imagen-ceda-<número>-web.pdf` y la tapa, listos para
   descargar.

Esto no publica nada en el sitio. El run guarda además el artifact
`revista-<número>-sitio`, con el PDF, la tapa, las páginas y el texto en sus rutas del repo:
descomprimilo en la raíz y agregá la edición a `src/data/magazine.ts`. Las releases son
públicas, como el sitio; cuando ya no la necesites, podés borrarla.

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

### Dominio

Un problema administrativo entre ARCA y NIC Argentina impide por ahora registrar
`ceda.org.ar`. Mientras tanto el sitio se publica en un dominio provisorio:

| Dirección                                   | Qué hace                                  |
| ------------------------------------------- | ----------------------------------------- |
| `https://www.centroempresariodeazul.org.ar` | Sirve el sitio (Custom Domain del Worker) |
| `https://centroempresariodeazul.org.ar`     | 301 a `www`, conservando ruta y query     |

- `wrangler deploy` crea solo el registro DNS de `www`. El apex necesita un registro
  propio **proxied** (A `192.0.2.1`, una IP de documentación que nunca recibe tráfico)
  para que la Redirect Rule tenga dónde correr.
- La Redirect Rule vive en la zona de Cloudflare (_Rules → Redirect Rules_) y corre
  antes que el Worker: `http.host eq "centroempresariodeazul.org.ar"` →
  `concat("https://www.centroempresariodeazul.org.ar", http.request.uri.path)`, 301.
- El dominio figura en dos archivos: `wrangler.jsonc` (`routes`) y `src/site.ts`
  (`origin`). De `origin` salen el `site` de `astro.config.mjs`, las URLs canónicas, el
  sitemap y `robots.txt` (`src/pages/robots.txt.ts`).

#### Pasar a `www.ceda.org.ar`

Cuando `ceda.org.ar` esté registrado, el dominio provisorio **no se da de baja**: pasa a
redirigir con 301 al definitivo, así no se pierden los links compartidos ni lo indexado.

1. Agregar la zona `ceda.org.ar` en Cloudflare y delegar sus nameservers en NIC.ar.
2. Reemplazar el dominio en los dos archivos de arriba: en `wrangler.jsonc` activar el
   bloque `routes` comentado (`www.ceda.org.ar`) en lugar del actual.
3. `npm run deploy`. Cloudflare crea el DNS y el certificado de `www.ceda.org.ar`.
4. En la zona `ceda.org.ar`: registro A `192.0.2.1` proxied para el apex y la misma
   Redirect Rule de apex → `www` que usa hoy el dominio provisorio.
5. En la zona `centroempresariodeazul.org.ar`:
   - Quitar el Custom Domain `www` del Worker si sigue asociado (_Workers → ceda-web →
     Settings → Domains & Routes_) y crear un registro A `192.0.2.1` proxied para `www`.
   - Cambiar la Redirect Rule para que tome los dos hosts y apunte al dominio nuevo:
     `http.host in {"centroempresariodeazul.org.ar" "www.centroempresariodeazul.org.ar"}`
     → `concat("https://www.ceda.org.ar", http.request.uri.path)`, 301, conservando la
     query.
6. Verificar: `curl -I https://www.centroempresariodeazul.org.ar/nosotros` debe devolver
   `301` con `location: https://www.ceda.org.ar/nosotros`.
7. En Google Search Console, verificar `ceda.org.ar` y usar **Cambio de dirección** desde
   la propiedad del dominio provisorio.
8. Mantener `centroempresariodeazul.org.ar` renovado al menos un año más, mientras los
   buscadores y los links impresos (revista, afiches) terminan de migrar.

## Estructura

```text
src/
  data/          Contenido en módulos tipados y validados con Zod
                 (institutional · advocacy · magazine · events)
  layouts/       Base.astro — head, nav, footer, schema
  components/    SlashBand · MarkerCircle · PageHero · SectionHeader · ContactBand
                 BusinessDirectory · ExternalLink · EventFeature · IssueCard
  pages/         index · nosotros · programas · beneficios · revista · contacto · 404
  assets/        img/ (fotos, con events/ y business-directory/) · brand/ (logo)
                 magazine/ (tapas)
  styles/        global.css — tokens de marca
  site.ts        Identidad, contacto y navegación
scripts/         Generadores de assets (logo, OG, revista)
public/          Passthrough: _headers, site.webmanifest, img/, js/, revista/
dist/            Salida del build — lo que publica wrangler (gitignored)
```

## Pendiente

- Horarios de atención al público presencial (solo está publicada la atención telefónica)
- `/novedades`, cuando haya material verificado
- Registro de `ceda.org.ar` y migración desde el dominio provisorio (ver [Dominio](#dominio))

## Contacto

España 620, Azul, Buenos Aires ·
WhatsApp [2281 58-3969](https://wa.me/5492281583969) ·
[comunicacionceda@gmail.com](mailto:comunicacionceda@gmail.com)
