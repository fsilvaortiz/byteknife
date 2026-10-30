import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const result = (page: Page, name = 'Resultado') => page.getByRole('region', { name });

test.describe('JSON', () => {
  test('formatea el ejemplo, minifica y muestra el error con posición', async ({ page }) => {
    await open(page, '/es/json/');
    await expect(page.locator('.pill.ok')).toHaveText('JSON válido');
    await expect(result(page)).toContainText('"servicio": "pagos-api"');

    await page.getByRole('button', { name: 'Minificar' }).click();
    await expect(result(page)).toContainText('{"id":4821,"servicio"');

    await page.getByLabel('Entrada').fill('{\n  "a": 1,\n}');
    await expect(page.locator('.pill.bad')).toContainText('línea 3, columna 1');
    await expect(result(page)).toHaveText('');
  });
});

test.describe('JSON ⇄ CSV', () => {
  test('convierte a CSV y de vuelta a JSON', async ({ page }) => {
    await open(page, '/es/csv/');
    await expect(result(page, 'Salida CSV')).toContainText('id,nombre,plan,mrr,activo');
    await expect(result(page, 'Salida CSV')).toContainText('2,"Bruno, Díaz",free,0,false');
    await expect(page.locator('.pill.neu')).toHaveText('3 filas · 5 columnas');

    await page.getByRole('button', { name: 'CSV → JSON' }).click();
    await expect(page.getByLabel('Entrada CSV')).toHaveValue(/^id,nombre/);
    await expect(result(page, 'Salida JSON')).toContainText('"nombre": "Carla \\"CJ\\" Rojas"');
    await expect(page.locator('.pill.neu')).toHaveText('3 objetos');

    await page.getByLabel('Entrada CSV').fill('a,b\n"sin cerrar,2');
    await expect(page.locator('.pill.bad')).toHaveText('Comilla sin cerrar desde la línea 2');
  });
});

test.describe('Base64', () => {
  test('codifica, intercambia y detecta entradas inválidas', async ({ page }) => {
    await open(page, '/es/base64/');
    await expect(result(page)).toHaveText(
      'wqFIb2xhLCBtdW5kbyEgw5FhbmTDuiDwn5qAIOKAlCBjb25zdCB4ID0gNDI7',
    );

    await page.getByRole('button', { name: 'Intercambiar ⇄' }).click();
    await expect(page.getByRole('button', { name: 'Decodificar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(result(page)).toHaveText('¡Hola, mundo! Ñandú 🚀 — const x = 42;');

    await page.getByLabel('Entrada').fill('no es base64!');
    await expect(page.locator('.pill.bad')).toHaveText('No es Base64 válido');
  });

  test('archivo a data URI sin salir del navegador', async ({ page }) => {
    await open(page, '/es/base64/');
    await page.getByLabel('Archivo → data URI').setInputFiles({
      name: 'hola.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hola'),
    });
    await expect(result(page)).toHaveText('data:text/plain;base64,aG9sYQ==');
  });
});

test.describe('URL', () => {
  test('decodifica y desglosa partes y parámetros', async ({ page }) => {
    await open(page, '/es/url/');
    await expect(result(page)).toContainText('q=café con leche#perfil');
    const kv = page.locator('.kv');
    await expect(kv.first()).toContainText('api.ejemplo.dev');
    await expect(kv.first()).toContainText('8443');
    await expect(page.getByText('Parámetros (3)')).toBeVisible();

    await page.getByLabel('Entrada').fill('100%');
    await expect(page.getByRole('alert')).toContainText('Secuencia % mal formada');
  });
});

test.describe('JWT', () => {
  test('decodifica el ejemplo y verifica la firma con el secreto demo', async ({ page }) => {
    await open(page, '/es/jwt/');
    await expect(page.locator('.pill.ok', { hasText: 'Firma válida' })).toBeVisible();
    await expect(result(page, 'Payload')).toContainText('"name": "Ada Lovelace"');
    await expect(page.locator('#toolRoot').getByText('Expira (exp)')).toBeVisible();

    await page.getByLabel('Secreto HMAC').fill('otro-secreto');
    await expect(page.locator('.pill.bad', { hasText: 'Firma no coincide' })).toBeVisible();

    await page.getByLabel('Token').fill('no-es-un-token');
    await expect(page.locator('.pill.bad')).toContainText('Token ilegible');
  });

  test('abre con lo que se pegó en el home, sin el secreto demo', async ({ page }) => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGYzYTIxIn0.80xahJwPRarA9O2w9o-NaTMcwxhsChNjaL6o7UjBXII';
    await open(page, '/es/');
    await page.getByLabel('Pega cualquier cosa').fill(jwt);
    await expect(page.getByTestId('detect')).toContainText('JWT');
    await page.getByLabel('Pega cualquier cosa').press('Enter');
    await expect(page).toHaveURL(/\/es\/jwt\/$/);
    await expect(page.getByLabel('Token')).toHaveValue(jwt);
    await expect(result(page, 'Payload')).toContainText('"sub": "usr_8f3a21"');
    await expect(page.getByLabel('Secreto HMAC')).toHaveValue('');
  });
});

test.describe('Escapar cadenas', () => {
  test('escapa HTML y desescapa Unicode', async ({ page }) => {
    await open(page, '/es/escape/');
    await expect(result(page)).toContainText(
      '&lt;a href=&quot;/buscar?q=café&amp;orden=1&quot;&gt;',
    );

    await page.getByRole('button', { name: 'Unicode \\u' }).click();
    await page.getByRole('button', { name: 'Desescapar' }).click();
    await page.getByLabel('Entrada').fill('\\u00f1 \\u{1F680}');
    await expect(result(page)).toHaveText('ñ 🚀');

    await page.getByLabel('Entrada').fill('\\u{110000}');
    await expect(page.locator('.pill.bad')).toBeVisible();
  });
});

test('las herramientas funcionan en inglés', async ({ page }) => {
  await open(page, '/en/json/');
  await expect(page.locator('.pill.ok')).toHaveText('Valid JSON');
  await expect(page.getByRole('button', { name: 'Sort keys' })).toBeVisible();
});
