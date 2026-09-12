// Promoted on the home page until it passes, then disappears on the next build — rebuild
// after an event or it lingers as "upcoming". Only publish what's on CEDA's own flyer;
// prices and speaker counts move until the last minute, so leave those to WhatsApp.

import { z } from 'zod';

const isDateTime = (s: string) => !Number.isNaN(new Date(s).getTime());

const eventSchema = z
  .object({
    title: z.string().min(1),
    tagline: z.string().min(1),
    body: z.string().min(1),
    /** Start and end, local time, for schema.org and for the visible date. */
    startISO: z.string().refine(isDateTime, 'not a parseable date-time'),
    endISO: z.string().refine(isDateTime, 'not a parseable date-time'),
    dateLabel: z.string().min(1),
    timeLabel: z.string().min(1),
    venue: z.string().min(1),
    address: z.string().min(1),
    /** What attendees will hear about. Indicative — the programme is not final. */
    topics: z.array(z.string().min(1)).nonempty(),
    /** Path under src/assets/img/. EventFeature throws if it resolves to nothing. */
    poster: z.string().min(1),
    organiser: z.string().min(1),
  })
  // An inverted range would silently make `upcoming` behave as if the event were over.
  .refine((e) => new Date(e.endISO) > new Date(e.startISO), {
    message: 'endISO must come after startISO',
    path: ['endISO'],
  });

export type CedaEvent = z.infer<typeof eventSchema>;

export const events = z.array(eventSchema).parse([
  {
    title: 'Conocé. Escuchá. Probá...',
    tagline: 'Sabores, historias y proyectos azuleños',
    body: 'Una noche para conocer emprendimientos locales, escuchar sus historias y disfrutar de una experiencia única de sabores y proyectos azuleños, con degustación de sushi, vinos, jamón crudo y miel, y la presentación del grupo fotográfico La Ronda.',
    startISO: '2026-09-24T20:00:00-03:00',
    endISO: '2026-09-24T23:00:00-03:00',
    dateLabel: '24 de septiembre',
    timeLabel: '20:00 a 23:00',
    venue: 'Sede del CEDA',
    address: 'España 620, Azul',
    topics: ['Sushi', 'Vinos', 'Jamón crudo', 'Miel', 'Fotografía local'],
    poster: 'events/cep-2026.jpg',
    organiser: 'CEDA',
  },
  {
    title: 'Jornada de Comercio Digital',
    tagline: 'Inspirate, aprendé, conectá',
    body: 'Una tarde para descubrir herramientas digitales, escuchar experiencias reales y compartir ideas que te ayudarán a hacer crecer tu negocio.',
    startISO: '2026-08-29T15:00:00-03:00',
    endISO: '2026-08-29T18:30:00-03:00',
    dateLabel: '29 de agosto',
    timeLabel: '15:00 a 18:30',
    venue: 'Auditorio del Consejo Profesional de Ciencias Económicas',
    address: 'Av. Perón 800, Azul',
    topics: ['E-commerce', 'Publicidad audiovisual', 'Marketing y redes sociales', 'Logística'],
    poster: 'events/jcd-2026.jpg',
    organiser: 'Subcomisión de Jóvenes',
  },
]);

/** The next event that has not finished yet, or null. Evaluated at build time. */
export const upcoming = events.find((e) => new Date(e.endISO).getTime() > Date.now()) ?? null;
