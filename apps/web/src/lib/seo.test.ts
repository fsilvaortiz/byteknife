import { describe, expect, it } from 'vitest';
import { alternates, faqPageLd, scriptJson, sitemap, softwareApplicationLd } from './seo';

const SITE = 'https://byteknife.dev';

describe('alternates', () => {
  it('lista los tres idiomas y x-default a la raíz en el home', () => {
    expect(alternates(SITE, '')).toEqual([
      { hreflang: 'es', href: 'https://byteknife.dev/es/' },
      { hreflang: 'en', href: 'https://byteknife.dev/en/' },
      { hreflang: 'pt', href: 'https://byteknife.dev/pt/' },
      { hreflang: 'x-default', href: 'https://byteknife.dev/' },
    ]);
  });

  it('apunta x-default al inglés en una herramienta', () => {
    expect(alternates(SITE, 'jwt/').at(-1)).toEqual({
      hreflang: 'x-default',
      href: 'https://byteknife.dev/en/jwt/',
    });
  });
});

describe('scriptJson', () => {
  it('no permite cerrar el <script> desde un texto', () => {
    const out = scriptJson({ a: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ a: '</script><script>alert(1)</script>' });
  });
});

describe('datos estructurados', () => {
  it('SoftwareApplication gratuita, de desarrollo y en el idioma de la página', () => {
    const ld = softwareApplicationLd({
      name: 'JWT',
      url: `${SITE}/pt/jwt/`,
      locale: 'pt',
      description: 'd',
    });
    expect(ld).toMatchObject({
      '@type': 'SoftwareApplication',
      applicationCategory: 'DeveloperApplication',
      inLanguage: 'pt',
      offers: { price: '0' },
    });
  });

  it('FAQPage con una Question por pregunta', () => {
    const ld = faqPageLd({ url: SITE, locale: 'es', faq: [{ q: '¿Qué?', a: 'Esto.' }] });
    expect(ld.mainEntity).toEqual([
      { '@type': 'Question', name: '¿Qué?', acceptedAnswer: { '@type': 'Answer', text: 'Esto.' } },
    ]);
  });
});

describe('sitemap', () => {
  const out = sitemap(SITE, ['', 'json/']);

  it('tiene una <url> por página e idioma', () => {
    expect(out.match(/<url>/g)).toHaveLength(6);
    expect(out).toContain('<loc>https://byteknife.dev/pt/json/</loc>');
    expect(out).not.toContain('<loc>https://byteknife.dev/</loc>');
  });

  it('cada <url> declara sus alternativas, incluida ella misma', () => {
    const entry = out.split('<url>')[1]!;
    expect(entry).toContain('<loc>https://byteknife.dev/es/</loc>');
    expect(entry.match(/xhtml:link/g)).toHaveLength(4);
    expect(entry).toContain('hreflang="es" href="https://byteknife.dev/es/"');
  });

  it('escapa caracteres XML en las URL', () => {
    expect(sitemap('https://x.dev', ['a&b/'])).toContain('/es/a&amp;b/');
  });
});
