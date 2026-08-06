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

  /* Phone attention hours, printed in Revista Imagen CEDA N.º 316 (julio 2026). This is
     when the office answers the phone; walk-in hours are not published. */
  officeHours: 'de 8 a 15 h',
  whatsappDisplay: '2281 47-7297',
  whatsappUrl: 'https://wa.me/5492281477297',
  whatsappE164: '+5492281477297',
  email: 'comunicacionceda@gmail.com',
  instagram: 'https://www.instagram.com/cedaazul/',
  facebook: 'https://www.facebook.com/Centroempresariodeazul/',
  /* Google Form behind CEDA's bit.ly/sumate-azul. Linked directly here: the shortener
     earns its place on print and in the Instagram bio, but on the web it only adds two
     redirect hops, a third party in the click path, and a "bit.ly" hover that reads like
     phishing. It is also a single point of failure for the primary CTA. */
  registryForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSeYq-jbdI4PbgsA10942-rma6IayJVcBI1T-cho1z5eXNZKyw/viewform',

  origin: 'https://www.ceda.org.ar',

  /* Google Search Console verification token. Prefer the DNS TXT method once ceda.org.ar
     is delegated — it verifies the whole domain and needs no markup. This meta-tag
     fallback exists for the case where DNS is not available; leave empty to omit it. */
  googleSiteVerification: '',
} as const;

/** "España 620, Azul, Buenos Aires" */
export const address = `${site.street}, ${site.city}, ${site.region}`;

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
