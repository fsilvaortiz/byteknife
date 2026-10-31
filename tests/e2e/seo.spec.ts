import { expect, test, type Page } from '@playwright/test';

// Valida en el sitio compilado lo que el gate de F3 pide: sitemap, hreflang y JSON-LD.
const SITE = 'https://byteknife.dev';
const local = (url: string) => url.replace(SITE, '');

async function sitemapUrls(page: Page): Promise<string[]> {
  const res = await page.request.get('/sitemap.xml');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toContain('xml');
  return [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
}

test('robots.txt permite todo y declara el sitemap', async ({ page }) => {
  const res = await page.request.get('/robots.txt');
  expect(await res.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

test('el sitemap lista home y herramientas en los tres idiomas', async ({ page }) => {
  const urls = await sitemapUrls(page);
  expect(urls).toHaveLength(17 * 3);
  for (const locale of ['es', 'en', 'pt']) {
    expect(urls).toContain(`${SITE}/${locale}/`);
    expect(urls).toContain(`${SITE}/${locale}/jwt/`);
  }
});

test('cada página del sitemap es canónica, recíproca en hreflang y con JSON-LD válido', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const urls = await sitemapUrls(page);
  const alternatesOf = new Map<string, Record<string, string>>();

  for (const url of urls) {
    const res = await page.request.get(local(url));
    expect(res.status(), url).toBe(200);
    await page.setContent(await res.text());

    const lang = await page.locator('html').getAttribute('lang');
    expect(url, 'la URL empieza con el idioma de la página').toContain(`/${lang}/`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
    expect((await page.locator('title').textContent())?.length).toBeGreaterThan(10);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length, url).toBeGreaterThanOrEqual(50);
    await expect(page.locator('h1')).toHaveCount(1);

    const alts: Record<string, string> = {};
    for (const link of await page.locator('link[rel="alternate"][hreflang]').all()) {
      alts[(await link.getAttribute('hreflang'))!] = (await link.getAttribute('href'))!;
    }
    expect(Object.keys(alts).sort()).toEqual(['en', 'es', 'pt', 'x-default']);
    expect(alts[lang!], 'hreflang se incluye a sí misma').toBe(url);
    alternatesOf.set(url, alts);

    const types: string[] = [];
    for (const script of await page.locator('script[type="application/ld+json"]').all()) {
      const data = JSON.parse((await script.textContent())!);
      expect(data['@context']).toBe('https://schema.org');
      expect(data.inLanguage).toBe(lang);
      types.push(data['@type']);
      if (data['@type'] === 'FAQPage') {
        expect(data.mainEntity.length).toBeGreaterThanOrEqual(3);
        // Cada pregunta del JSON-LD tiene que estar visible en la página.
        for (const q of data.mainEntity) {
          await expect(page.getByRole('heading', { name: q.name, exact: true })).toHaveCount(1);
        }
      }
    }
    const isHome = new URL(url).pathname.split('/').filter(Boolean).length === 1;
    expect(types.sort(), url).toEqual(isHome ? ['WebSite'] : ['FAQPage', 'SoftwareApplication']);
  }

  // Reciprocidad: si A dice que B es su versión en otro idioma, B dice lo mismo de A.
  for (const [url, alts] of alternatesOf) {
    for (const [lang, href] of Object.entries(alts)) {
      if (lang === 'x-default') continue;
      expect(alternatesOf.get(href), `${href} está en el sitemap`).toEqual(alts);
      expect(alts[lang]).toBe(href);
    }
    expect(Object.values(alts)).toContain(url);
  }
});
