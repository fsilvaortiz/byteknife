import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TOOL_IDS } from './tools';

test.describe('la raíz con navegador en español de Chile', () => {
  test.use({ locale: 'es-CL' });

  test('redirige al home en español', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es\/$/);
  });
});

test.describe('la raíz con navegador en alemán', () => {
  test.use({ locale: 'de-DE' });

  test('redirige al home en inglés', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});

test('el selector de idioma lleva a la misma herramienta y la raíz recuerda la elección', async ({
  page,
}) => {
  await page.goto('/en/jwt/');
  await page
    .getByRole('navigation', { name: 'Language' })
    .getByRole('link', { name: 'PT' })
    .click();
  await expect(page).toHaveURL(/\/pt\/jwt\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
  await expect(page.getByRole('heading', { name: 'Perguntas frequentes' })).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/pt\/$/);
});

for (const path of ['/es/', ...TOOL_IDS.map((id) => `/es/${id}/`), '/en/cron/', '/pt/jwt/']) {
  test(`${path} no tiene violaciones de accesibilidad`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    // .swatch es la vista previa del color del usuario: muestra texto blanco y negro encima
    // justamente para enseñar cuándo el contraste no alcanza (la tabla al lado lo informa).
    const results = await new AxeBuilder({ page }).exclude('.swatch').analyze();
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
