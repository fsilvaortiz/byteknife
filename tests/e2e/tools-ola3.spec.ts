import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const region = (page: Page, name: string) => page.getByRole('region', { name });

test('Códigos y cabeceras HTTP: busca códigos y cabeceras', async ({ page }) => {
  await open(page, '/es/http/');
  const search = page.getByLabel('Buscar en la referencia');
  await search.fill('429');
  await expect(region(page, 'Códigos de estado')).toContainText('Too Many Requests');
  await page.getByRole('button', { name: 'Cabeceras' }).click();
  await search.fill('cors origin');
  await expect(region(page, 'Cabeceras')).toContainText('Access-Control-Allow-Origin');
});

test('Analizar cabeceras: revisa el ejemplo', async ({ page }) => {
  await open(page, '/es/headers/');
  await expect(page.locator('.pill.ok').first()).toHaveText('200 OK');
  const review = region(page, 'Revisión');
  await expect(review).toContainText('Falta Content-Security-Policy');
  await expect(review).toContainText('Server revela la versión: «nginx/1.24.0»');
  await expect(region(page, 'Cabeceras recibidas')).toContainText('strict-transport-security');
});

test('Analizar CSP: marca unsafe-inline y lista directivas', async ({ page }) => {
  await open(page, '/es/csp/');
  await expect(region(page, 'Revisión')).toContainText("script-src permite 'unsafe-inline'");
  await page
    .getByLabel('Política (cabecera, valor o <meta>)')
    .fill(
      "default-src 'self'; script-src 'nonce-a' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; report-to x",
    );
  await expect(page.locator('.pill').first()).toHaveText('0 graves · 0 avisos');
});

test('Analizar cookies: atributos y errores', async ({ page }) => {
  await open(page, '/es/cookie/');
  await expect(page.getByText('El valor parece un JWT').first()).toBeVisible();
  await expect(
    page.getByText('SameSite=None sin Secure: el navegador la rechaza', { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('Set-Cookie o Cookie (una cabecera por línea)')
    .fill('Cookie: a=1; tema=oscuro%20azul');
  await expect(page.locator('.kv')).toHaveCount(1);
  await expect(page.locator('.kv')).toContainText('oscuro azul');
});

test('Registros DNS: SPF, DMARC y zona', async ({ page }) => {
  await open(page, '/es/dns/');
  const input = page.getByLabel('Registro TXT, archivo de zona o salida de dig');
  await expect(region(page, 'Revisión')).toContainText('3 de 10 consultas DNS');
  await input.fill('v=DMARC1; p=none');
  await expect(region(page, 'Revisión')).toContainText('p=none solo monitorea');
  await input.fill('www 300 IN CNAME ejemplo.dev.\nwww 300 IN A 203.0.113.10');
  await expect(region(page, 'Revisión')).toContainText('www tiene CNAME y otros registros');
});

test('User-Agent: identifica el ejemplo y un bot', async ({ page }) => {
  await open(page, '/es/useragent/');
  const kv = page.locator('.kv');
  await expect(kv).toContainText('Safari 18.1');
  await expect(kv).toContainText('iOS 18.1');
  await page.getByLabel('Cadena User-Agent').fill('curl/8.7.1');
  await expect(kv).toContainText('curl');
  await page.getByRole('button', { name: 'Usar el de mi navegador' }).click();
  await expect(kv).toContainText('Chrome');
});

test('Puertos conocidos: número y categoría', async ({ page }) => {
  await open(page, '/es/ports/');
  const search = page.getByLabel('Buscar puerto o servicio');
  await search.fill('5432');
  await expect(region(page, 'Puertos')).toContainText('PostgreSQL');
  await expect(page.locator('.bar .pill')).toHaveText('Puerto registrado (1024–49151)');
  await search.fill('correo');
  await expect(region(page, 'Puertos').locator('tbody tr')).toHaveCount(7);
});

test('Dirección MAC: formatos y fabricante', async ({ page }) => {
  await open(page, '/es/mac/');
  const kv = page.locator('.kv');
  await expect(kv).toContainText('Apple, Inc.');
  await expect(kv).toContainText('fe80::3e22:fbff:fe7a:910e');
  await page.getByLabel('Dirección MAC').fill('da:a1:19:5c:00:07');
  await expect(page.getByText('Administrada localmente', { exact: true })).toBeVisible();
});

test('Vista previa Markdown: renderiza sin ejecutar HTML', async ({ page }) => {
  await open(page, '/es/markdown/');
  const preview = region(page, 'Vista previa');
  await expect(preview.locator('h1')).toHaveText('Notas de la versión 2.15');
  await expect(preview.locator('table')).toBeVisible();
  await page
    .getByLabel('Texto Markdown')
    .fill('<img src=x onerror="window.pwned=1">\n\n![a](https://x.dev/a.png)');
  await expect(preview).toContainText('<img src=x');
  await expect(preview).toContainText('[imagen externa no cargada: a]');
  expect(
    await page.evaluate(() => (window as unknown as { pwned?: number }).pwned),
  ).toBeUndefined();
});

test('Generador de QR: texto y Wi-Fi', async ({ page }) => {
  await open(page, '/es/qr/');
  await expect(page.locator('.qr svg')).toBeVisible();
  await expect(page.locator('.pill.neu')).toContainText('Versión 2');
  await page.getByRole('button', { name: 'Wi-Fi' }).click();
  await page.getByLabel('Contraseña').fill('clave-larga-de-prueba');
  await expect(page.locator('.qr svg')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'SVG' }).click();
  expect((await download).suggestedFilename()).toBe('qr.svg');
});

test('Validar JSON Schema: errores y documento válido', async ({ page }) => {
  await open(page, '/es/jsonschema/');
  await expect(page.locator('.pill.bad')).toHaveText('5 errores');
  await expect(region(page, 'Errores de validación')).toContainText('/plan');
  await page
    .getByLabel('Documento JSON')
    .fill('{"id": 42, "email": "ana@ejemplo.dev", "plan": "pro"}');
  await expect(page.locator('.pill.ok')).toHaveText('El documento cumple el esquema');
});
