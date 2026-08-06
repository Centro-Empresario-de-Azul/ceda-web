// Institutional advocacy. Every entry traces to a named public source — keep it that way.
import { z } from 'zod';

const entrySchema = z.object({
  /** ISO date. Orders the list, and the displayed year is derived from it. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
  title: z.string().min(1),
  body: z.string().min(1),
  // A claim without a source is the one thing that must never ship here. Most are
  // external; the magazine is cited as an internal path.
  source: z.object({
    label: z.string().min(1),
    href: z.union([z.url(), z.string().startsWith('/')]),
  }),
});

const entries = z.array(entrySchema).parse([
  {
    title: '2.ª Ronda de Negocios',
    date: '2026-04-10',
    body: 'CEDA organizó la segunda Ronda de Negocios multisectorial en la Sociedad Rural de Azul, con alrededor de cien inscriptos. Acompañaron CAME, FEBA, la Cooperativa Eléctrica de Azul y el Municipio.',
    source: {
      label: 'CAME',
      href: 'https://www.redcame.org.ar/novedades/14495/excelente-oportunidad-conecta-con-proveedores-y-clientes-en-la-2-ronda-de-negocios-multisectorial-azul-2026',
    },
  },
  {
    title: 'Intervención urbana del centro',
    date: '2026-04-21',
    body: 'La subcomisión de gestión del centro presentó, junto al Municipio y a los comerciantes, el proyecto de intervención de las calles Yrigoyen y San Martín: ordenamiento del tránsito y del estacionamiento, sendas peatonales, mobiliario urbano y espacios verdes, con proyección al resto del radio céntrico.',
    source: { label: 'CEDA, abril de 2026', href: 'https://www.instagram.com/cedaazul/' },
  },
  {
    title: '1.ª Ronda de Negocios',
    date: '2025-05-30',
    body: 'La primera Ronda de Negocios de Azul, impulsada desde la Fundación CEDA para fortalecer el entramado económico local.',
    source: {
      label: 'Municipio de Azul',
      href: 'https://azuldigital.gob.ar/se-desarrolla-la-primera-ronda-de-negocios-en-azul/',
    },
  },
  {
    title: 'Planificación urbana',
    date: '2026-06-05',
    body: 'La Fundación CEDA participó de una nueva reunión con la Municipalidad de Azul para avanzar en proyectos de planificación urbana y desarrollo de la ciudad.',
    source: {
      label: 'Revista Imagen CEDA N.º 316, julio 2026',
      href: '/revista',
    },
  },
  {
    title: 'Tasa de Seguridad e Higiene',
    date: '2026-06-30',
    body: 'CEDA presentó ante el Concejo Deliberante un proyecto de ordenanza para crear un fondo destinado a obras de infraestructura, con asignación progresiva y un comité de gestión. Está en análisis conjunto de las comisiones de Interpretación, Legislación y Seguridad Pública y de Presupuesto y Hacienda.',
    source: {
      label: 'Concejo Deliberante de Azul, 30/06/2026',
      href: 'https://concejodeliberantedeazul.gob.ar/index.php/2026/06/30/tasa-de-seguridad-e-higiene-se-analizo-un-proyecto-presentado-por-el-ceda/',
    },
  },
  {
    title: 'Ordenanza del centro comercial',
    date: '2025-05-21',
    body: 'CEDA participó del trabajo sobre el uso del espacio público, veredas, fachadas y publicidad en el centro de Azul, y convocó a los comerciantes a una reunión informativa sobre el proyecto.',
    source: {
      label: 'Concejo Deliberante de Azul, 21/05/2025',
      href: 'https://concejodeliberantedeazul.gob.ar/index.php/2025/05/21/el-concejo-deliberante-continua-trabajando-en-el-proyecto-de-ordenanza-sobre-el-centro/',
    },
  },
  {
    title: 'Convenio del Centro Comercial a Cielo Abierto',
    date: '2024-10-01',
    body: 'Se firmó el convenio que da inicio al desarrollo del primer centro comercial a cielo abierto de la ciudad, entre la Municipalidad de Azul, CEDA, CAME y FEBA.',
    source: {
      label: 'Municipio de Azul',
      href: 'https://azuldigital.gob.ar/se-firmo-un-convenio-para-la-creacion-del-centro-comercial-abierto-en-azul/',
    },
  },
  {
    title: 'ExpoAzul 2032',
    date: '2024-11-30',
    body: 'CEDA fue una de las diez instituciones de la comunidad que acompañaron la muestra de producción, comercio e innovación organizada por el municipio, camino al Bicentenario de Azul.',
    source: {
      label: 'Municipio de Azul',
      href: 'https://azuldigital.gob.ar/instituciones-de-la-comunidad-acompanan-la-expo-azul-2032/',
    },
  },
]);

/**
 * Newest first, so the array above can be edited in any order. `year` is derived rather
 * than stored — it used to be a second field that could disagree with `date`.
 */
export const advocacy = [...entries]
  .sort((a, b) => b.date.localeCompare(a.date))
  .map((entry) => ({ ...entry, year: entry.date.slice(0, 4) }));
