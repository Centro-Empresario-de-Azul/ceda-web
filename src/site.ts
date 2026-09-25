export const site = {
  /** Acronym. The everyday brand mark — nav, titles, running prose. */
  acronym: 'CEDA',
  /** Canonical institutional name. Use wherever the full identity is stated. */
  name: 'Centro Empresario de Azul',
  /** What CEDA is, in one line. Feeds meta descriptions and structured data. */
  description:
    'Cámara empresarial que representa al comercio, la industria y los servicios de Azul, Buenos Aires.',
  /** CEDA's own slogan, taken from its campaign artwork. */
  slogan: 'Juntos es mejor',

  founded: 1917,
  /** ISO form of the founding date, for structured data. */
  foundedISO: '1917-10-12',
  /** Spelled out, for running prose. */
  foundedLong: '12 de octubre de 1917',
  /** The name CEDA was founded under. */
  foundingName: 'Liga Comercial e Industrial de Azul',

  affiliations: [
    { name: 'Confederación Argentina de la Mediana Empresa', acronym: 'CAME' },
    { name: 'Federación Económica de la Provincia de Buenos Aires', acronym: 'FEBA' },
  ],

  street: 'España 620',
  city: 'Azul',
  region: 'Buenos Aires',
  postalCode: '7300',
  country: 'AR',
  /** CEDA's own Google Maps pin. */
  maps: 'https://maps.app.goo.gl/wm79RpjkYaq1nQ999',
  /** Coordinates the pin above resolves to, for structured data. */
  latitude: -36.782205,
  longitude: -59.857174,

  /* CEDA's only phone line, WhatsApp included. Attention hours as printed in Revista Imagen
     CEDA N.º 316 (julio 2026); walk-in hours are not published. */
  officeHours: 'de 8 a 15 h',
  whatsappDisplay: '2281 58-3969',
  whatsappUrl: 'https://wa.me/5492281583969',
  whatsappE164: '+5492281583969',
  email: 'comunicacionceda@gmail.com',
  instagram: 'https://www.instagram.com/cedaazul/',
  facebook: 'https://www.facebook.com/Centroempresariodeazul/',
  /* Google Form behind CEDA's bit.ly/sumate-azul. Linked directly: on the web the shortener
     only adds redirect hops and a "bit.ly" hover that reads like phishing. */
  registryForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSeYq-jbdI4PbgsA10942-rma6IayJVcBI1T-cho1z5eXNZKyw/viewform',

  // Stand-in domain while an ARCA/NIC.AR administrative issue blocks registering
  // ceda.org.ar. Switch back once that's resolved (see wrangler.jsonc's commented route).
  origin: 'https://www.centroempresariodeazul.org.ar',

  /* Google Search Console verification token. Prefer the DNS TXT method once ceda.org.ar
     is delegated — it verifies the whole domain and needs no markup. This meta-tag
     fallback exists for the case where DNS is not available; leave empty to omit it. */
  googleSiteVerification: '',
} as const;

/** "España 620, Azul, Buenos Aires" */
export const address = `${site.street}, ${site.city}, ${site.region}`;

/** WhatsApp chat opened with a joining message already typed. */
export const whatsappJoinUrl = `${site.whatsappUrl}?text=${encodeURIComponent(
  `Hola, quiero asociarme al ${site.acronym}.`,
)}`;

/** "la Confederación … (CAME) y la Federación … (FEBA)" */
export const affiliationsProse = site.affiliations
  .map((a) => `la ${a.name} (${a.acronym})`)
  .join(' y ');

/** Page <title>, suffixed with the acronym. Home passes its own. */
export const pageTitle = (section: string) => `${section} — ${site.acronym}`;

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/programas', label: 'Programas' },
  { href: '/beneficios', label: 'Beneficios' },
  { href: '/revista', label: 'Revista' },
  { href: '/contacto', label: 'Contacto' },
] as const;
