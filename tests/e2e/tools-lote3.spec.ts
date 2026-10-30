import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const region = (page: Page, name: string) => page.getByRole('region', { name });

test.describe('Regex', () => {
  test('el ejemplo encuentra correos, agrupa y reemplaza', async ({ page }) => {
    await open(page, '/es/regex/');
    await expect(page.locator('.pill.ok')).toHaveText('4 coincidencias');
    await expect(region(page, 'Coincidencias').locator('mark')).toHaveCount(4);
    const groups = region(page, 'Grupos');
    await expect(groups.locator('th')).toHaveText(['#', 'Coincidencia', 'usuario', 'dominio']);
    await expect(groups.locator('tbody tr').nth(2)).toContainText('carla@EJEMPLO.cl');
    await expect(region(page, 'Resultado del reemplazo')).toContainText('soporte en acme.dev');

    await page.getByLabel('ignorar mayúsculas').uncheck();
    await expect(page.getByLabel('Flags')).toHaveValue('g');

    await page.getByLabel('Patrón').fill('(');
    await expect(page.locator('.pill.bad')).toBeVisible();
  });

  test('un patrón catastrófico no congela la pestaña', async ({ page }) => {
    await open(page, '/es/regex/');
    await page.getByLabel('Texto de prueba').fill(`${'a'.repeat(40)}b`);
    await page.getByLabel('Patrón').fill('^(a+)+$');
    await expect(page.locator('.pill.warn')).toContainText('tardó más de 1 s', { timeout: 5000 });
    // La página sigue respondiendo y un patrón nuevo vuelve a funcionar con otro worker.
    await page.getByLabel('Patrón').fill('a+');
    await expect(page.locator('.pill.ok')).toHaveText('1 coincidencia');
  });
});

test.describe('Diff', () => {
  test('cuenta cambios, filtra y detecta textos iguales', async ({ page }) => {
    await open(page, '/es/diff/');
    await expect(page.locator('.pill.ok')).toHaveText('+3');
    await expect(page.locator('.pill.bad')).toHaveText('−2');
    const table = region(page, 'Diferencias');
    await expect(table.locator('tr')).toHaveCount(11);

    await page.getByLabel('Solo cambios').check();
    await expect(table.locator('tr')).toHaveCount(5);

    await page.getByLabel('Modificado').fill(await page.getByLabel('Original').inputValue());
    await expect(page.locator('.pill.neu')).toHaveText('Sin diferencias');
  });
});

test.describe('Mayúsculas', () => {
  test('convierte el ejemplo y respeta acentos si se pide', async ({ page }) => {
    await open(page, '/es/case/');
    const kv = page.locator('.kv');
    await expect(kv).toContainText('fechaDeUltimaSincronizacionHttpResponse');
    await expect(kv).toContainText('FECHA_DE_ULTIMA_SINCRONIZACION_HTTP_RESPONSE');
    await page.getByLabel('Quitar acentos').uncheck();
    await expect(kv).toContainText('fechaDeÚltimaSincronizaciónHttpResponse');
  });
});

test.describe('Colores', () => {
  test('formatos, contraste, escala y colores con nombre', async ({ page }) => {
    await open(page, '/es/color/');
    const kv = page.locator('.kv');
    await expect(kv.nth(1)).toContainText('rgb(42 79 214)');
    await expect(kv.nth(1)).toContainText('oklch(49.2% 0.211 266.4)');
    await expect(kv.first()).toContainText('6.59 : 1');
    await expect(page.locator('.scale button')).toHaveCount(10);

    await page.getByLabel('Color', { exact: true }).fill('tomato');
    await expect(kv.nth(1)).toContainText('#ff6347');

    await page.getByLabel('Selector de color').fill('#00ff00');
    await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#00ff00');

    await page.getByLabel('Color', { exact: true }).fill('no-es-color');
    await expect(page.locator('.pill.bad')).toHaveText('Color no reconocido por CSS');
  });

  test('abre con lo que se pegó en el home', async ({ page }) => {
    await open(page, '/es/');
    await page.getByLabel('Pega cualquier cosa').fill('#2a4fd6');
    await page.getByLabel('Pega cualquier cosa').press('Enter');
    await expect(page).toHaveURL(/\/es\/color\/$/);
    await expect(page.getByLabel('Color', { exact: true })).toHaveValue('#2a4fd6');
  });
});

test.describe('Bases numéricas', () => {
  test('convierte y avisa con dígitos inválidos', async ({ page }) => {
    await open(page, '/es/base/');
    const kv = page.locator('.kv');
    await expect(kv).toContainText('3.405.705.229');
    await expect(kv).toContainText('CAFE F00D');
    await expect(page.locator('.pill.neu')).toHaveText('32 bits · 4 bytes');

    await page.getByLabel('Número', { exact: true }).fill('128640');
    await expect(kv).toContainText('U+1F680');

    await page.getByLabel('Base de entrada').selectOption('2');
    await expect(page.locator('.pill.bad')).toHaveText('Dígitos no válidos para esa base');
  });

  test('separador de miles en inglés', async ({ page }) => {
    await open(page, '/en/base/');
    await expect(page.locator('.kv')).toContainText('3,405,705,229');
  });
});
