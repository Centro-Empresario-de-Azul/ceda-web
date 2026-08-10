// Issues of Revista Imagen CEDA, newest first.
//
// To add one: run `node scripts/prepare-magazine.mjs <source.pdf> <number>`, then prepend
// an entry here. `cover` must match a file in src/assets/magazine/.

import { z } from 'zod';

const issueSchema = z.object({
  number: z.number().int().positive(),
  /** Month and year as printed on the cover. */
  date: z.string().min(1),
  /** ISO form, for <time datetime>. Also groups the archive by year. */
  iso: z.string().regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM'),
  /** Cover headline of the issue. */
  headline: z.string().min(1),
  pages: z.number().int().positive(),
  /** Served from public/revista/ — see scripts/prepare-magazine.mjs. */
  pdf: z.string().startsWith('/revista/').endsWith('.pdf'),
  /** Filename in src/assets/magazine/. */
  cover: z.string().endsWith('.jpg'),
});

export type Issue = z.infer<typeof issueSchema>;

export const issues = z
  // Newest first — the page takes issues[0] as the featured edition and groups the rest.
  .array(issueSchema)
  .nonempty()
  .refine((list) => list.every((issue, i) => i === 0 || list[i - 1].iso >= issue.iso), {
    message: 'issues must be ordered newest first by `iso`',
  })
  .parse([
    {
      number: 317,
      date: 'Agosto 2026',
      iso: '2026-08',
      headline:
        'El tercer domingo de agosto mueve Azul: claves para aprovechar el Día de las Infancias',
      pages: 20,
      pdf: '/revista/imagen-ceda-317-web.pdf',
      cover: 'cover-317.jpg',
    },
    {
      number: 316,
      date: 'Julio 2026',
      iso: '2026-07',
      headline: 'Vacaciones de invierno: el receso escolar como oportunidad de ventas',
      pages: 22,
      pdf: '/revista/imagen-ceda-316-web.pdf',
      cover: 'cover-316.jpg',
    },
    {
      number: 288,
      date: 'Febrero 2024',
      iso: '2024-02',
      headline: 'Nuestro Balneario Municipal: obras que inspiran',
      pages: 28,
      pdf: '/revista/imagen-ceda-288-web.pdf',
      cover: 'cover-288.jpg',
    },
    {
      number: 286,
      date: 'Diciembre 2023',
      iso: '2023-12',
      headline: 'Felices fiestas, con optimismo y solidaridad',
      pages: 26,
      pdf: '/revista/imagen-ceda-286-web.pdf',
      cover: 'cover-286.jpg',
    },
    {
      number: 284,
      date: 'Octubre 2023',
      iso: '2023-10',
      headline: 'Propuestas para el sector productivo de los candidatos a intendentes de Azul',
      pages: 32,
      pdf: '/revista/imagen-ceda-284-web.pdf',
      cover: 'cover-284.jpg',
    },
    {
      number: 283,
      date: 'Septiembre 2023',
      iso: '2023-09',
      headline: '¡Viva la Vida!: alimentación consciente',
      pages: 27,
      pdf: '/revista/imagen-ceda-283-web.pdf',
      cover: 'cover-283.jpg',
    },
    {
      number: 282,
      date: 'Agosto 2023',
      iso: '2023-08',
      headline: 'Todos podemos emprender',
      pages: 25,
      pdf: '/revista/imagen-ceda-282-web.pdf',
      cover: 'cover-282.jpg',
    },
  ]);

export const latest = issues[0];
