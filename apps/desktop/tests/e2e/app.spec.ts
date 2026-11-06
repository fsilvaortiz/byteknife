import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

async function open(page: Page, hash = '') {
  await page.goto(`/${hash}`);
  await expect(page.getByRole('banner')).toBeVisible();
}

/** Marca la página para saber si una navegación la recargó (no debería: es una SPA). */
const mark = (page: Page) => page.evaluate(() => ((window as { bk?: number }).bk = 1));
const stillSamePage = (page: Page) => page.evaluate(() => (window as { bk?: number }).bk === 1);

test('abre en el idioma del sistema y el selector cambia de idioma sin salir de la herramienta', async ({
  page,
}) => {
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { name: 'Todas las herramientas' })).toBeVisible();

  await page.getByRole('link', { name: /Decodificador JWT/ }).click();
  await expect(page).toHaveURL(/#\/es\/jwt\/$/);
  await page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/#\/en\/jwt\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation', { name: 'Tools' })).toBeVisible();

  // La elección queda guardada: al volver a abrir la app sin ruta, sigue en inglés.
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('pegar en el inicio detecta el formato y abre la herramienta sin recargar', async ({
  page,
}) => {
  await open(page, '#/es/');
  await mark(page);
  await page.getByLabel('Pega cualquier cosa').fill('0 9 * * 1-5');
  await expect(page.getByTestId('detect')).toContainText('Cron → Expresiones cron');
  await page.getByLabel('Pega cualquier cosa').press('Enter');
  await expect(page).toHaveURL(/#\/es\/cron\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Expresiones cron');
  expect(await stillSamePage(page)).toBe(true);
});

test('⌘/Ctrl K con un JWT lleva la entrada a la herramienta', async ({ page }) => {
  await open(page, '#/es/');
  await page.keyboard.press('Control+k');
  await page.keyboard.insertText(JWT);
  await expect(page.getByRole('option').first()).toContainText('Abrir en Decodificador JWT');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/es\/jwt\/$/);
  await expect(page.locator('.tool')).toContainText('John Doe');
});

test('favoritos y recientes aparecen en el inicio', async ({ page }) => {
  await open(page, '#/es/uuid/');
  await page.getByRole('button', { name: '☆ Favorito' }).click();
  await expect(page.getByRole('button', { name: '★ En favoritos' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Herramientas' }).getByText('Regex').click();
  await expect(page).toHaveURL(/#\/es\/regex\/$/);
  await page.getByRole('link', { name: 'ByteKnife, inicio' }).click();
  await expect(page.getByTestId('favorites')).toHaveText('★ UUID');
  await expect(page.getByTestId('recents')).toContainText('Regex');
  await expect(page.locator('[data-tool="uuid"] i')).toBeVisible();
});

test('un link externo no saca a la app de su página', async ({ page }) => {
  await open(page, '#/es/markdown/');
  await mark(page);
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = 'https://example.com/';
    a.textContent = 'externo';
    a.id = 'ext';
    document.body.append(a);
  });
  await page.locator('#ext').click();
  await expect(page).toHaveURL(/#\/es\/markdown\/$/);
  expect(await stillSamePage(page)).toBe(true);
});

for (const hash of ['#/es/', '#/es/jwt/', '#/pt/cron/']) {
  test(`${hash} no tiene violaciones de accesibilidad`, async ({ page }) => {
    await open(page, hash);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
