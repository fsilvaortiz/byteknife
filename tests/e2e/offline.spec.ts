import { expect, test, type Page } from '@playwright/test';

// PWA: el service worker precachea el shell y guarda cada herramienta visitada
// (integrations/sw.js). Sin conexión, el sitio sigue sirviendo ambos.

async function controlled(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  // La primera carga ocurre antes de que el worker controle la página: se recarga para que
  // la herramienta y sus chunks pasen por él y queden guardados.
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

test('sin conexión funcionan la herramienta visitada y el shell de los tres idiomas', async ({
  page,
  context,
}) => {
  await page.goto('/es/json/');
  await controlled(page);
  await context.setOffline(true);

  await page.reload();
  await page.getByLabel('Entrada').fill('{"offline":true}');
  await expect(page.getByRole('region', { name: 'Resultado' })).toContainText('"offline": true');

  const homes: [string, string][] = [
    ['/es/', 'Todas las herramientas'],
    ['/en/', 'All tools'],
    ['/pt/', 'Todas as ferramentas'],
  ];
  for (const [path, title] of homes) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }
});

test('sin conexión, una herramienta no visitada cae en el home de su idioma', async ({
  page,
  context,
}) => {
  await page.goto('/en/');
  await controlled(page);
  await context.setOffline(true);

  await page.goto('/en/regex/');
  await expect(page.getByRole('heading', { name: 'All tools' })).toBeVisible();
});
