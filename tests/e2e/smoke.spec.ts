import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('el home carga con título y sin violaciones de accesibilidad', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('ByteKnife');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ByteKnife');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('el home no hace requests a otros orígenes', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (!req.url().startsWith(baseURL!)) external.push(req.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(external).toEqual([]);
});
