import { z } from 'zod';
import { site } from '../site';

// Programme content, previously inline in the page markup. Kept here so a change to a
// price, a topic or a call to action is one edit in one place — and so the schemas below
// fail the build rather than shipping a half-filled card.

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
    title: 'Herramientas Digitales para tu Negocio',
    body: 'Doce encuentros para incorporar inteligencia artificial, automatización, datos y venta online a tu empresa. Los dictan especialistas del Cluster Tecnológico Tandil.',
    href: '/programas',
    cta: 'Ver el programa',
  },
  {
    title: 'Azul Mueve',
    body: 'Las historias de quienes producen, emprenden y dan trabajo en Azul, contadas por sus protagonistas.',
    href: site.instagram,
    cta: 'Verlas en Instagram',
    external: true,
  },
]);

/** Curriculum of Herramientas Digitales para tu Negocio. */
export const digitalTopics = z
  .array(z.object({ name: z.string().min(1), body: z.string().min(1) }))
  .parse([
    {
      name: 'Inteligencia artificial',
      body: 'Usar asistentes de inteligencia artificial para escribir, resumir y organizar las tareas del día a día.',
    },
    {
      name: 'Automatización',
      body: 'Que las tareas repetitivas las haga la máquina, sin programar nada — por ejemplo, un chatbot que responda las consultas más simples.',
    },
    {
      name: 'Datos del negocio',
      body: 'Entender y visualizar los números de tu empresa en paneles, para detectar a tiempo qué vende y qué no.',
    },
    {
      name: 'Ventas por internet',
      body: 'Vender online a otras empresas o al público: catálogos, marketplaces y canales digitales, con tus clientes ordenados en un CRM.',
    },
    {
      name: 'Seguridad básica',
      body: 'Copias de seguridad, contraseñas seguras y cómo evitar que te hackeen el WhatsApp o las redes del negocio.',
    },
  ]);

/* Prices and terms as published on CEDA's own flyer. They move between editions — check
   the current flyer before editing, and route anything unconfirmed to WhatsApp. */
export const digitalFacts = z
  .array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
      detail: z.string().min(1),
    }),
  )
  .parse([
    {
      label: 'Duración',
      value: '12 encuentros',
      detail: 'Virtuales y en vivo, de 2 horas cada uno.',
    },
    {
      label: 'Cierre',
      value: 'Taller presencial',
      detail: 'Práctico, para dejar todo funcionando.',
    },
    { label: 'Dictan', value: 'Cluster Tecnológico Tandil', detail: 'Especialistas del cluster.' },
    { label: 'Inversión', value: '$300.000', detail: 'Por persona — $25.000 por encuentro.' },
    {
      label: 'Pago',
      value: '50% y 50%',
      detail: 'Mitad al reservar el lugar, mitad antes de empezar.',
    },
    { label: 'Grupos', value: '10% off', detail: 'Si tu empresa anota a más de una persona.' },
  ]);
