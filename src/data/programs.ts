import { z } from 'zod';
import { site } from '../site';

// Programme content, kept out of the page markup so a change to a topic or a call to
// action is one edit in one place — and so the schema fails the build rather than shipping
// a half-filled card.

const initiativeSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  href: z.string().min(1),
  cta: z.string().min(1),
  /** Set for links that leave the site; drives target/rel. */
  external: z.boolean().optional(),
});

/** Teasers on the home page. Each points at the page or channel that carries the detail. */
export const initiatives = z.array(initiativeSchema).parse([
  {
    title: 'Centro Comercial a Cielo Abierto',
    body: 'Un proyecto para devolverle movimiento al centro de Azul. Nació de comerciantes preocupados por su futuro y CEDA lo presentó ante el municipio, alineado a la iniciativa de CAME.',
    href: '/programas',
    cta: 'Conocé el proyecto',
  },
  {
    title: 'Azul Mueve',
    body: 'Las historias de quienes producen, emprenden y dan trabajo en Azul, contadas por sus protagonistas.',
    href: site.instagram,
    cta: 'Verlas en Instagram',
    external: true,
  },
]);
