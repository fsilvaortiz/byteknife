import { locales, type Locale } from '../i18n/locales';

export interface Alternate {
  hreflang: Locale | 'x-default';
  href: string;
}

export interface Faq {
  q: string;
  a: string;
}

/**
 * Versiones de una página en cada idioma, más x-default. `path` va sin idioma: '' para el
 * home y 'json/' para una herramienta. El x-default del home es la raíz, que elige el
 * idioma del visitante; el de una herramienta es la versión en inglés.
 */
export function alternates(site: string, path: string): Alternate[] {
  const url = (p: string) => new URL(p, site).href;
  return [
    ...locales.map((l) => ({ hreflang: l, href: url(`/${l}/${path}`) })),
    { hreflang: 'x-default', href: url(path ? `/en/${path}` : '/') },
  ];
}

/** JSON para incrustar en un <script> (JSON-LD o datos): sin "</script>" ni "<!--" posibles. */
export function scriptJson(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function websiteLd(o: { url: string; locale: Locale; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ByteKnife',
    url: o.url,
    inLanguage: o.locale,
    description: o.description,
  };
}

export function softwareApplicationLd(o: {
  name: string;
  url: string;
  locale: Locale;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: o.name,
    url: o.url,
    inLanguage: o.locale,
    description: o.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function faqPageLd(o: { url: string; locale: Locale; faq: Faq[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: o.url,
    inLanguage: o.locale,
    mainEntity: o.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** sitemap.xml con una entrada por página e idioma, cada una con sus alternativas hreflang. */
export function sitemap(site: string, paths: string[]): string {
  const urls = paths.flatMap((path) => {
    const alts = alternates(site, path);
    const links = alts
      .map(
        (a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xml(a.href)}"/>`,
      )
      .join('\n');
    return alts
      .filter((a) => a.hreflang !== 'x-default')
      .map((a) => `  <url>\n    <loc>${xml(a.href)}</loc>\n${links}\n  </url>`);
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
