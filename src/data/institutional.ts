import { z } from 'zod';
import { site } from '../site';

const benefitSchema = z.object({
  name: z.string().min(1),
  body: z.string().min(1),
  tag: z.string().min(1),
  /** Shown in the short teaser on the home page. */
  featured: z.boolean().optional(),
});

const seatSchema = z.object({
  role: z.string().min(1),
  names: z.array(z.string().min(1)).nonempty(),
});

export const subcommittees = [
  {
    // "Jóvenes en Movimiento" is the subcomisión's motto, not its name.
    name: 'Subcomisión de Jóvenes',
    motto: 'Jóvenes en Movimiento',
    body: 'La subcomisión de jóvenes del CEDA, que sigue sumando integrantes. Impulsa la formación y los proyectos de la próxima generación de empresarios —entre ellos el programa Herramientas Digitales para tu Negocio— y acompaña iniciativas de emprendedurismo junto a la Facultad de Agronomía. Hoy está construyendo la guía de comercios, oficios y servicios del partido de Azul, a partir del padrón de negocios registrados.',
  },
  {
    name: 'Centro Comercial a Cielo Abierto',
    body: 'Trabaja en la puesta en valor del centro de Azul junto al municipio y en línea con la iniciativa de CAME. El proyecto tiene gerenta propia, Lorena Triviño, y una primera etapa de intervención sobre las calles Yrigoyen y San Martín.',
  },
  {
    // CEDA does not sit on the Ente Mixto de Turismo; its role is articulating the private
    // side of the offer. Worded to state that positively, without claiming membership.
    name: 'CEDA Turismo',
    body: 'Articula la oferta turística de Azul para que funcione de manera integrada: hoteles, gastronomía, agencias de viaje y prestadores de servicios, junto al comercio local.',
  },
];

// Officers of Fundación CEDA — a separate legal entity from CEDA, with its own
// leadership. Ramiro Layús presides it while also serving as CEDA's secretario.
export const foundationOfficers = [
  { role: 'Presidente', name: 'Ramiro Layús' },
  { role: 'Secretario administrativo', name: 'Gastón Mocciaro' },
  { role: 'Contadora', name: 'Silvina Giorgetti' },
];

// Working lines the Fundación set out with the Municipality and local institutions.
export const foundationAgenda = [
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
];

// From the Fundación's own roll-up banner.
export const foundationMembers = [
  site.name,
  'Sociedad Rural de Azul',
  'Cooperativa Farmacéutica Ltda.',
  'Cooperativa Eléctrica de Azul Ltda.',
  'Banco Industrial',
  'Municipalidad de Azul',
];

/* Benefits exactly as published in Revista Imagen CEDA N.º 316 (julio 2026). This is the
   only list — the home page teaser derives from `featured` below rather than restating it.
   An earlier hardcoded teaser kept advertising Medife and Banco Credicoop after both were
   removed here for lacking a source. */
export const benefits = z.array(benefitSchema).parse([
  {
    name: 'Salón para reuniones y eventos',
    body: 'Espacio para reuniones, entrevistas y capacitaciones, y salón para charlas y eventos, en la sede de España 620.',
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
    name: 'Banco Provincia',
    body: 'Extracciones en la sede: hasta $800.000 con Banco Provincia de Buenos Aires; otros bancos según su propio límite.',
    tag: 'Pagos',
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
