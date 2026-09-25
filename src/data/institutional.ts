import { z } from 'zod';
import { site } from '../site';

/** Benefit categories, in filter order, with the icon each one shows. */
export const benefitTags = {
  Sede: 'lucide:building-2',
  Pagos: 'lucide:credit-card',
  Bancos: 'lucide:landmark',
  Seguros: 'lucide:shield-check',
  Logística: 'lucide:truck',
  Servicios: 'lucide:briefcase',
  Bienestar: 'lucide:dumbbell',
  Comunicación: 'lucide:megaphone',
} as const;

export type BenefitTag = keyof typeof benefitTags;

const benefitSchema = z.object({
  name: z.string().min(1),
  body: z.string().min(1),
  tag: z.enum(Object.keys(benefitTags) as [BenefitTag, ...BenefitTag[]]),
  /** Shown in the short teaser on the home page. */
  featured: z.boolean().optional(),
});

const seatSchema = z.object({
  role: z.string().min(1),
  names: z.array(z.string().min(1)).nonempty(),
});

const subcommitteeSchema = z.object({
  name: z.string().min(1),
  /** The subcomisión's motto, when it has one distinct from its name. */
  motto: z.string().min(1).optional(),
  body: z.string().min(1),
});

const officerSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
});

const agendaItemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

export const subcommittees = z.array(subcommitteeSchema).parse([
  {
    // "Jóvenes en Movimiento" is the subcomisión's motto, not its name.
    name: 'Subcomisión de Jóvenes',
    motto: 'Jóvenes en Movimiento',
    body: 'La subcomisión de jóvenes del CEDA, que sigue sumando integrantes. Impulsa la formación y los proyectos de la próxima generación de empresarios —como la Jornada de Comercio Digital— y acompaña iniciativas de emprendedurismo junto a la Facultad de Agronomía. Hoy está construyendo la guía de comercios, oficios y servicios del partido de Azul, a partir del padrón de negocios registrados.',
  },
  {
    name: 'Centro Comercial a Cielo Abierto',
    body: 'Trabaja en la puesta en valor del centro de Azul junto al municipio y en línea con la iniciativa de CAME. El proyecto tiene gerenta propia, Lorena Triviño, y una primera etapa de intervención sobre las calles Yrigoyen y San Martín.',
  },
  {
    // CEDA does not sit on el Ente Mixto de Turismo; its role is articulating the private
    // side of the offer. Worded to state that positively, without claiming membership.
    name: 'CEDA Turismo',
    body: 'Articula la oferta turística de Azul para que funcione de manera integrada: hoteles, gastronomía, agencias de viaje y prestadores de servicios, junto al comercio local.',
  },
]);

export const foundationFounded = { iso: '1994-07-14', long: '14 de julio de 1994' };

// Officers of Fundación CEDA — a separate legal entity from CEDA, with its own
// leadership. Ramiro Layús presides it while also serving as CEDA's secretario.
export const foundationOfficers = z.array(officerSchema).parse([
  { role: 'Presidente', name: 'Ramiro Layús' },
  { role: 'Secretario administrativo', name: 'Gastón Mocciaro' },
  { role: 'Contadora', name: 'Silvina Giorgetti' },
]);

// Working lines the Fundación set out with the Municipality and local institutions.
export const foundationAgenda = z.array(agendaItemSchema).parse([
  {
    title: 'Azul, Ciudad Parque',
    body: 'Integrar el desarrollo urbano con el entorno natural, con un modelo sostenible centrado en la calidad de vida de la comunidad.',
  },
  {
    title: 'Proyecto de inversiones',
    body: 'Un esquema local que reciba, evalúe e impulse proyectos productivos, con una lógica parecida a la de una incubadora, articulando lo público y lo privado.',
  },
  {
    title: 'Plan Estratégico de Azul',
    body: 'Retomar y actualizar el plan junto a las instituciones de la ciudad, con la mirada puesta en el Bicentenario de Azul en 2032.',
  },
]);

// From the Fundación's own roll-up banner.
export const foundationMembers = z
  .array(z.string().min(1))
  .nonempty()
  .parse([
    site.name,
    'Sociedad Rural de Azul',
    'Cooperativa Farmacéutica Ltda.',
    'Cooperativa Eléctrica de Azul Ltda.',
    'Banco Industrial',
    'Municipalidad de Azul',
  ]);

/* Benefits as published in Revista Imagen CEDA N.º 316. Only list — the home page teaser
   derives from `featured` below; a hardcoded teaser once kept advertising retracted ones. */
// The home page shows the featured ones in a grid of up to six.
export const MAX_FEATURED_BENEFITS = 6;

export const benefitsSchema = z.array(benefitSchema).refine(
  (list) => {
    const featured = list.filter((b) => b.featured).length;
    return featured >= 1 && featured <= MAX_FEATURED_BENEFITS;
  },
  { message: `feature between 1 and ${MAX_FEATURED_BENEFITS} benefits for the home page` },
);

export const benefits = benefitsSchema.parse([
  {
    name: 'Salón para reuniones y eventos',
    body: `Espacio para reuniones, entrevistas y capacitaciones, y salón para charlas y eventos, en la sede de ${site.street}.`,
    tag: 'Sede',
    featured: true,
  },
  {
    name: 'CAJA Provincia Net',
    body: 'Exclusiva para socios. Pago de ARBA, patente automotor, multas de la provincia, servicios de la CEAL, tasas municipales, seguros, obras sociales, cable e internet, y líneas de venta directa.',
    tag: 'Pagos',
    featured: true,
  },
  {
    name: 'Extracciones en la sede',
    body: 'Extracciones en la sede: hasta $800.000 con Banco Provincia de Buenos Aires; otros bancos según su propio límite.',
    tag: 'Pagos',
    featured: true,
  },
  {
    name: 'Banco Galicia',
    body: 'Cuentas nuevas con múltiples beneficios.',
    tag: 'Bancos',
    featured: true,
  },
  {
    name: 'Sancor Seguros',
    body: 'Productor Héctor Castellar. 20% de descuento en Integral de Comercio y 10% en seguro de hogar y automotor.',
    tag: 'Seguros',
    featured: true,
  },
  {
    name: 'Andreani',
    body: 'Envíos de bultos y correspondencia con 25% de descuento para socios.',
    tag: 'Logística',
    featured: true,
  },
  {
    name: 'TALA RRHH',
    body: 'Búsqueda de personal con 20% de descuento para socios de CEDA.',
    tag: 'Servicios',
  },
  {
    name: 'Seguridad e Higiene',
    body: 'Asesoramiento a cargo de Alejandro Muñoz, con 20% de descuento para socios.',
    tag: 'Servicios',
  },
  {
    name: 'Asesoramiento legal',
    body: 'Consultas legales para socios de CEDA.',
    tag: 'Servicios',
  },
  {
    name: 'Gimnasio ATP Center',
    body: '15% de descuento para socios, abonando en efectivo.',
    tag: 'Bienestar',
  },
  {
    name: 'Revista Imagen CEDA',
    body: 'La revista digital de CEDA, de distribución gratuita para socios y para toda la comunidad.',
    tag: 'Comunicación',
  },
  {
    name: 'Canal de socios',
    body: 'Un canal de comunicación con información exclusiva para socios.',
    tag: 'Comunicación',
  },
]);

/** The handful named on the home page. Never a second copy of the text. */
export const featuredBenefits = benefits.filter((b) => b.featured);

/** Only the categories that currently have a benefit, in `benefitTags` order. */
export const usedBenefitTags = (Object.keys(benefitTags) as BenefitTag[]).filter((tag) =>
  benefits.some((b) => b.tag === tag),
);

// From CEDA's own "Sumate al CEDA" page in Revista Imagen CEDA N.º 318. The fee is CEDA's
// published rate, unlike event prices; update it from the latest issue.
export const membership = z
  .object({
    audience: z.array(z.string().min(1)).nonempty(),
    reasons: z.array(z.string().min(1)).nonempty(),
    fee: z.string().min(1),
    feePeriod: z.string().min(1),
    feeSource: z.object({ label: z.string().min(1), href: z.string().startsWith('/') }),
  })
  .parse({
    audience: ['Comerciantes', 'Empresarios', 'Emprendedores', 'Profesionales'],
    reasons: [
      'Representación institucional ante organismos públicos y privados.',
      'Acceso a capacitaciones y charlas exclusivas.',
      'Difusión y promoción de tu emprendimiento.',
      'Participación en ferias, eventos y actividades.',
      'Networking con otros actores del ecosistema local.',
    ],
    fee: '$4.000',
    feePeriod: 'por mes',
    feeSource: { label: 'Revista Imagen CEDA N.º 318, septiembre 2026', href: '/revista/318' },
  });

// Where the 1930, 1952 and 1980 names and seat in the Historia section come from.
export const historySources = z.array(z.object({ label: z.string().min(1), href: z.url() })).parse([
  { label: 'Salidores', href: 'https://salidores.com/azul/ceda-centro-empresario-de-azul' },
  {
    label: 'El Tiempo, "Pasó en Azul un 24 de mayo"',
    href: 'https://www.diarioeltiempo.com.ar/nota-paso-en-azul-un-24-de-mayo-205564',
  },
]);

// From the founding date and the sources in historySources.
export const historyMilestones = z
  .array(z.object({ year: z.string().min(1), text: z.string().min(1) }))
  .nonempty()
  .parse([
    { year: String(site.founded), text: `Se funda la ${site.foundingName}.` },
    { year: '1930', text: 'La Liga funciona en Av. 25 de Mayo 733.' },
    {
      year: '1952',
      text: 'Se la conoce como Centro de Comerciantes, Industriales y Propietarios de Azul.',
    },
    { year: '1980', text: `Ya lleva el nombre de ${site.name}.` },
    { year: 'Hoy', text: `Su sede está en ${site.street}.` },
  ]);

// The institution's first board, 1917, under its founding name (site.foundingName).
export const foundingBoardTitle = '1.ª Comisión Directiva (1917)';

export const foundingBoard = z.array(seatSchema).parse([
  { role: 'Presidente', names: ['Constantino Fernández'] },
  { role: 'Vicepresidente', names: ['Laureano Lobato'] },
  { role: 'Secretario', names: ['Ruperto Campos'] },
  { role: 'Prosecretario', names: ['Juan P. Torras'] },
  { role: 'Tesorero', names: ['Pedro Gorostiza'] },
  { role: 'Protesorero', names: ['Almanzor de Antueno'] },
  {
    role: 'Consejales',
    names: [
      'Agustín L. Mendieta',
      'Juan B. Italiani',
      'José A. Motti',
      'Francisco T. Carmuega',
      'Gregorio L. Motti',
    ],
  },
  { role: 'Gerente', names: ['Albino T. Díaz'] },
]);

// Comisión Directiva 2026, as printed in Revista Imagen CEDA N.º 316 (julio 2026).
export const boardTitle = 'Comisión Directiva 2026';

export const board = z.array(seatSchema).parse([
  { role: 'Presidente', names: ['Martín Picaroni'] },
  { role: 'Vicepresidenta', names: ['Martha Marquís'] },
  { role: 'Secretario', names: ['Ramiro Layús'] },
  { role: 'Prosecretaria', names: ['Gabriela Salís'] },
  { role: 'Tesorero', names: ['Darío Ferrari'] },
  { role: 'Protesorero', names: ['Iván Stankievich'] },
  { role: 'Vocales titulares', names: ['Federico García', 'Clotilde Benéitez', 'Rubén Juménez'] },
  {
    role: 'Vocales suplentes',
    names: ['Gustavo Del Curto', 'Edith Silva', 'Nicolás Cabral', 'Juan Wallace'],
  },
  { role: 'Revisores de cuentas titulares', names: ['Silvio Ciuffardi', 'Federico Belleza'] },
  { role: 'Revisores de cuentas suplentes', names: ['Cristian Severiens', 'Pablo Santillán'] },
]);
