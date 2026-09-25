// Promoted on the home page until it passes, then disappears on the next build — rebuild
// after an event or it lingers as "upcoming". Only publish what's on CEDA's own flyer;
// prices and speaker counts move until the last minute, so leave those to WhatsApp.

import { z } from 'zod';
import { site } from '../site';

// The offset is required: the fallback end below reuses it to find the event's local day.
const dateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[+-]\d{2}:\d{2}$/,
    'expected YYYY-MM-DDTHH:MM±HH:MM',
  )
  .refine((s) => !Number.isNaN(new Date(s).getTime()), 'not a parseable date-time');

const eventSchema = z
  .object({
    title: z.string().min(1),
    tagline: z.string().min(1),
    body: z.string().min(1),
    /** Local time with offset, for schema.org and for the visible date. */
    startISO: dateTime,
    /** Only when the flyer prints one — never guess an end time. */
    endISO: dateTime.optional(),
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
  .refine((e) => !e.endISO || new Date(e.endISO) > new Date(e.startISO), {
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
    dateLabel: '24 de septiembre',
    timeLabel: '20:00',
    venue: 'Sede del CEDA',
    address: `${site.street}, ${site.city}`,
    topics: ['Sushi', 'Vinos', 'Jamón crudo', 'Miel', 'Fotografía local'],
    poster: 'events/cep-2026.jpg',
    organiser: 'CEDA',
  },
  {
    title: 'Jornada de Comercio Digital',
    tagline: 'Inspirate, aprendé, conectá',
    body: 'Una tarde para descubrir herramientas digitales, escuchar experiencias reales y compartir ideas que te ayudarán a hacer crecer tu negocio.',
    startISO: '2026-08-29T15:00:00-03:00',
    endISO: '2026-08-29T19:00:00-03:00',
    dateLabel: '29 de agosto',
    timeLabel: '15:00 a 19:00',
    venue: 'Auditorio del Consejo Profesional de Ciencias Económicas',
    address: 'Av. Perón 800, Azul',
    topics: ['E-commerce', 'Publicidad audiovisual', 'Marketing y redes sociales', 'Logística'],
    poster: 'events/jcd-2026.jpg',
    organiser: 'Subcomisión de Jóvenes',
  },
]);

/** When the event is over: its end time, or midnight closing its local day if the flyer
    gives only a start. */
export function eventEnd(e: Pick<CedaEvent, 'startISO' | 'endISO'>): Date {
  if (e.endISO) return new Date(e.endISO);
  const day = e.startISO.slice(0, 10);
  const offset = e.startISO.slice(-6);
  return new Date(`${day}T23:59:59${offset}`);
}

/** The soonest event that has not finished by `now`, whatever order the data is in. */
export function pickUpcoming<E extends Pick<CedaEvent, 'startISO' | 'endISO'>>(
  list: readonly E[],
  now: Date,
): E | null {
  return (
    [...list]
      .filter((e) => eventEnd(e) > now)
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime())[0] ?? null
  );
}

/** Evaluated at build time. */
export const upcoming = pickUpcoming(events, new Date());
