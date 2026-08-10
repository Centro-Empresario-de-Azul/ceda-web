// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Canonicals, og:url and og:image are absolute and built from this. Override it to
  // preview link cards on a temporary host, e.g.
  //   SITE_URL=https://ceda-web.<account>.workers.dev npm run build
  // Leave unset for real deploys so canonicals point at the production domain.
  site: process.env.SITE_URL ?? 'https://www.ceda.org.ar',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    // Brand marks come from simple-icons, interface glyphs from lucide. Both are inlined
    // as SVG at build time, so no icon font and no client JS ship.
    icon({
      include: {
        'simple-icons': ['whatsapp', 'instagram', 'facebook'],
        ph: ['diamond-fill'],
        lucide: [
          'mail',
          'map-pin',
          'map',
          'arrow-right',
          'menu',
          'x',
          'check',
          'download',
          'calendar',
          'chevron-down',
          'book-open',
          'zoom-in',
        ],
      },
    }),
    sitemap({
      lastmod: new Date(),
      // 404 is reachable but should never be indexed.
      filter: (page) => !page.endsWith('/404'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
