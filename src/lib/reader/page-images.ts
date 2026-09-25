import { z } from 'zod';
import { pageUrl } from './page-urls';

export { pageUrl, textUrl } from './page-urls';

const metaSchema = z.object({
  issue: z.number().int(),
  widths: z.array(z.number().int().positive()).nonempty(),
  /** Height ÷ width of each page, in page order. */
  ratios: z.array(z.number().positive()).nonempty(),
});

export type PageSet = z.infer<typeof metaSchema>;

const metas = import.meta.glob<{ default: unknown }>('../../data/magazine-pages/*.json', {
  eager: true,
});

/** Throws when an issue has no rendered pages, so a new issue can't ship an empty reader. */
export function pageSetFor(issue: number): PageSet {
  const entry = metas[`../../data/magazine-pages/${issue}.json`];
  if (!entry) {
    throw new Error(
      `No page images for issue ${issue}. Run: node scripts/render-magazine-pages.mjs <original.pdf> ${issue}`,
    );
  }
  const set = metaSchema.parse(entry.default);
  if (set.issue !== issue) {
    throw new Error(`magazine-pages/${issue}.json describes issue ${set.issue}`);
  }
  return set;
}

export function pageSrcset(set: PageSet, page: number): string {
  return set.widths.map((w) => `${pageUrl(set.issue, page, w)} ${w}w`).join(', ');
}

// Read at build time only, to print each issue's text in its page (see [number].astro).
const texts = import.meta.glob<{ default: { page: number; text: string }[] }>(
  '../../../public/revista/paginas/*/texto.json',
  { eager: true },
);

/** Throws when the text is missing: the reader's search would 404 on it. */
export function pageTextsFor(issue: number): { page: number; text: string }[] {
  const entry = texts[`../../../public/revista/paginas/${issue}/texto.json`];
  if (!entry) {
    throw new Error(
      `No page text for issue ${issue}. Run: node scripts/render-magazine-pages.mjs <original.pdf> ${issue}`,
    );
  }
  return entry.default;
}
