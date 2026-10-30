import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('la raíz redirige al home en español', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/es\/$/);
});

for (const path of [
  '/es/',
  '/en/',
  '/pt/',
  '/es/json/',
  '/es/csv/',
  '/es/base64/',
  '/es/url/',
  '/es/jwt/',
  '/es/escape/',
  '/en/cron/',
]) {
  test(`${path} no tiene violaciones de accesibilidad`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('la búsqueda abierta no tiene violaciones de accesibilidad', async ({ page }) => {
  await page.goto('/es/');
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('json');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('ninguna página hace requests a otros orígenes', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (!req.url().startsWith(baseURL!)) external.push(req.url());
  });
  await page.goto('/es/');
  await page.getByLabel('Pega cualquier cosa').fill('{"secreto": 1}');
  await page.waitForLoadState('networkidle');
  await page.goto('/es/json/');
  await page.waitForLoadState('networkidle');
  expect(external).toEqual([]);
});
