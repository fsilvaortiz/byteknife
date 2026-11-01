import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const region = (page: Page, name: string) => page.getByRole('region', { name });

test.describe('Par de claves', () => {
  test('genera Ed25519 en OpenSSH y cambia de formato y algoritmo', async ({ page }) => {
    await open(page, '/es/keypair/');
    const pub = region(page, 'Clave pública');
    const priv = region(page, 'Clave privada');
    await expect(pub).toHaveText(/^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA\S+$/);
    await expect(priv).toContainText('-----BEGIN OPENSSH PRIVATE KEY-----');
    await expect(page.locator('.pill.ok')).toHaveText(/^SHA256:[A-Za-z0-9+/]{43}$/);

    await page.getByLabel('Comentario de la clave OpenSSH').fill('ada@laptop');
    await expect(pub).toHaveText(/ ada@laptop$/);

    await page.getByRole('button', { name: 'PEM (PKCS#8 / SPKI)' }).click();
    await expect(pub).toContainText('-----BEGIN PUBLIC KEY-----');
    await expect(priv).toContainText('-----BEGIN PRIVATE KEY-----');

    await page.getByLabel('Algoritmo').selectOption('p256');
    await page.getByRole('button', { name: 'JWK' }).click();
    await expect(pub).toContainText('"crv": "P-256"');
    await expect(priv).toContainText('"d":');

    const before = await pub.textContent();
    await page.getByRole('button', { name: 'Generar otro par' }).click();
    await expect(pub).not.toHaveText(before!);
  });
});

test.describe('IP / CIDR', () => {
  test('calcula la red, divide en subredes y convierte rangos', async ({ page }) => {
    await open(page, '/es/cidr/');
    const kv = page.locator('.kv');
    await expect(kv).toContainText('192.168.8.0/22');
    await expect(kv).toContainText('255.255.252.0 (/22)');
    await expect(kv).toContainText('1.022');
    await expect(page.locator('.pill.ok')).toHaveText('Privada (RFC 1918)');

    const subnets = region(page, 'Subredes');
    await expect(subnets.locator('tbody tr')).toHaveCount(4);
    await page.getByLabel('Dividir en').selectOption('23');
    await expect(subnets.locator('tbody tr')).toHaveCount(2);
    await expect(subnets.locator('tbody tr').nth(1)).toContainText('192.168.10.0/23');

    const input = page.getByLabel('Dirección, CIDR o rango');
    await input.fill('10.0.0.1 - 10.0.0.9');
    await expect(page.getByRole('list', { name: 'Bloques CIDR del rango' })).toContainText(
      '10.0.0.8/31',
    );

    await input.fill('2001:db8::1/64');
    await expect(page.locator('.pill.neu')).toHaveText('IPv6');
    await expect(kv).toContainText('2001:db8::/64');

    await input.fill('10.0.0.0/33');
    await expect(page.locator('.pill.bad')).toContainText('Prefijo fuera de rango');
  });

  test('abre con la IP pegada en el home', async ({ page }) => {
    await open(page, '/es/');
    await page.getByLabel('Pega cualquier cosa').fill('172.16.5.4/12');
    await page.getByLabel('Pega cualquier cosa').press('Enter');
    await expect(page).toHaveURL(/\/es\/cidr\/$/);
    await expect(page.locator('.kv')).toContainText('172.16.0.0/12');
  });
});

test.describe('Certificados X.509', () => {
  test('decodifica el ejemplo y avisa con un PEM roto', async ({ page }) => {
    await open(page, '/es/x509/');
    await expect(page.locator('.kv').first()).toContainText('CN=api.ejemplo.dev');
    await expect(page.locator('.kv').first()).toContainText('EC · P-256 · 256 bits');
    await expect(page.locator('.kv').first()).toContainText(
      '94:A4:BA:5D:09:95:A6:C3:92:DE:FA:37:54:4F:BF:F3',
    );
    await expect(page.locator('.kv').nth(1)).toContainText('DNS:*.ejemplo.dev');
    await expect(page.locator('.pill.warn').first()).toBeVisible();

    await page
      .getByLabel('Certificado o CSR en PEM')
      .fill('-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----');
    await expect(page.locator('.pill.bad')).toHaveText('DER dañado o truncado');
  });
});
