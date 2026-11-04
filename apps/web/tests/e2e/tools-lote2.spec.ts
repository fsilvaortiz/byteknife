import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test.describe('UUID', () => {
  test('genera, cambia opciones e inspecciona', async ({ page }) => {
    await open(page, '/es/uuid/');
    const items = page.getByRole('list', { name: 'UUID generados' }).getByRole('listitem');
    await expect(items).toHaveCount(8);
    await expect(items.first().locator('code')).toHaveText(UUID_V4);

    await page.getByRole('button', { name: 'v7 ordenable por tiempo' }).click();
    await page.getByLabel('Sin guiones').check();
    await page.getByLabel('Mayúsculas').check();
    await expect(items.first().locator('code')).toHaveText(/^[0-9A-F]{12}7[0-9A-F]{19}$/);

    await page.getByLabel('Cantidad').fill('3');
    await page.getByRole('button', { name: 'Generar', exact: true }).click();
    await expect(items).toHaveCount(3);

    const probe = page.getByLabel('Inspeccionar un UUID');
    await probe.fill('{1EC9414C-232A-6B00-B3C8-9F6BDECED846}');
    await expect(page.locator('.kv')).toContainText('v6');
    await expect(page.locator('.kv')).toContainText('2022-02-22T19:22:22.000Z');
    await probe.fill('no-es-uuid');
    await expect(page.getByRole('alert')).toContainText('No es un UUID');
  });
});

test.describe('Hash', () => {
  test('resume texto y un archivo local', async ({ page }) => {
    await open(page, '/es/hash/');
    await expect(page.locator('.kv')).toContainText('9e107d9d372bb6826bd81d3542a419d6');

    await page.getByLabel('Texto a resumir').fill('abc');
    await expect(page.locator('.kv')).toContainText(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    await page.getByLabel('Mayúsculas').check();
    await expect(page.locator('.kv')).toContainText('900150983CD24FB0D6963F7D28E17F72');

    await page.getByLabel('Elegir archivo').setInputFiles({
      name: 'abc.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('abc'),
    });
    await expect(page.getByTestId('hash-source')).toHaveText('abc.txt · 3 B');
    await expect(page.locator('.kv')).toContainText('A9993E364706816ABA3E25717850C26C9CD0D89D');
  });
});

test.describe('Contraseñas', () => {
  test('genera 6, cambia la fuerza y avisa sin conjuntos', async ({ page }) => {
    await open(page, '/es/password/');
    const items = page.getByRole('list', { name: 'Contraseñas generadas' }).getByRole('listitem');
    await expect(items).toHaveCount(6);
    await expect(items.first().locator('code')).toHaveText(/^.{24}$/);
    // 24 caracteres de 87 posibles = 155 bits
    await expect(page.locator('.pill.ok')).toHaveText('Excelente · 155 bits de entropía');

    await page.getByLabel('Largo').fill('8');
    await expect(page.locator('.pill.warn')).toHaveText('Aceptable · 52 bits de entropía');
    await expect(items.first().locator('code')).toHaveText(/^.{8}$/);

    for (const name of ['A–Z', 'a–z', 'Símbolos'])
      await page.getByLabel(name, { exact: true }).uncheck();
    await expect(page.locator('.pill.bad')).toHaveText('Débil · 27 bits de entropía');
    await expect(items.first().locator('code')).toHaveText(/^\d{8}$/);

    await page.getByLabel('0–9', { exact: true }).uncheck();
    await expect(page.getByRole('alert')).toHaveText('Elige al menos un conjunto de caracteres.');
  });
});

test.describe('Timestamps', () => {
  test('convierte Unix y avisa con entradas inválidas', async ({ page }) => {
    await open(page, '/es/time/');
    await expect(page.locator('.pill.neu')).toHaveText('Leído como segundos');
    await expect(page.locator('.kv').first()).toContainText('2026-10-30T00:00:00.000Z');
    await expect(page.locator('.kv').nth(1)).toContainText('Asia/Kolkata');

    await page.getByLabel('Entrada: Unix o fecha').fill('1793318400000');
    await expect(page.locator('.pill.neu')).toHaveText('Leído como milisegundos');

    await page.getByLabel('Entrada: Unix o fecha').fill('mañana');
    await expect(page.locator('.pill.bad')).toHaveText('Fecha no reconocida');
  });

  test('abre con lo que se pegó en el home', async ({ page }) => {
    await open(page, '/es/');
    await page.getByLabel('Pega cualquier cosa').fill('1793318400');
    await expect(page.getByTestId('detect')).toContainText('Timestamps');
    await page.getByLabel('Pega cualquier cosa').press('Enter');
    await expect(page).toHaveURL(/\/es\/time\/$/);
    await expect(page.getByLabel('Entrada: Unix o fecha')).toHaveValue('1793318400');
  });
});

test.describe('Cron', () => {
  test('explica, lista ejecuciones y detecta lo imposible', async ({ page }) => {
    await open(page, '/es/cron/');
    await expect(page.getByTestId('cron-desc')).toHaveText('A las 09:00, de lunes a viernes.');
    await expect(page.getByRole('listitem')).toHaveCount(8);

    await page.getByRole('button', { name: /Cada 5 min/ }).click();
    await expect(page.getByTestId('cron-desc')).toHaveText('Cada 5 minutos.');

    await page.getByLabel('Expresión').fill('0 0 31 2 *');
    await expect(page.getByRole('alert')).toContainText('nunca se ejecuta');

    await page.getByLabel('Expresión').fill('0 25 * * *');
    await expect(page.getByRole('alert')).toHaveText('25 está fuera de rango en hora (0–23)');
  });

  test('en inglés', async ({ page }) => {
    await open(page, '/en/cron/');
    await expect(page.getByTestId('cron-desc')).toHaveText('At 09:00, Monday through Friday.');
  });
});
