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

test.describe('YAML ⇄ JSON', () => {
  test('convierte el ejemplo, cambia de dirección y avisa errores', async ({ page }) => {
    await open(page, '/es/yaml/');
    const out = region(page, 'Salida JSON');
    await expect(out).toContainText('"imagen": "registry.ejemplo.dev/pagos:2.14.0"');
    await expect(page.locator('.pill.neu')).toHaveText('1 documento YAML');

    await page.getByRole('button', { name: 'JSON → YAML' }).click();
    await expect(page.getByLabel('Entrada JSON')).toHaveValue(/"servicio": "pagos-api"/);
    await expect(region(page, 'Salida YAML')).toContainText('servicio: pagos-api');

    await page.getByRole('button', { name: 'YAML → JSON' }).click();
    await page.getByLabel('Entrada YAML').fill('a: [1, 2\nb: 3');
    await expect(page.locator('.pill.bad')).toContainText('línea');
  });
});

test.describe('Formatear SQL', () => {
  test('formatea, cambia mayúsculas y reporta errores', async ({ page }) => {
    await open(page, '/es/sql/');
    const out = region(page, 'SQL formateado');
    await expect(out).toContainText('LEFT JOIN items i ON i.pedido_id = p.id');
    await expect(page.locator('.pill.neu')).toHaveText('1 sentencia');

    await page.getByRole('button', { name: 'minúsculas' }).click();
    await expect(out).toContainText('left join items i on i.pedido_id = p.id');

    await page.getByLabel('Consulta SQL').fill("select a from t where x = 'abc");
    await expect(page.locator('.pill.bad')).toContainText('línea 1, columna');
  });
});

test.describe('Diff de JSON', () => {
  test('muestra cambios y respeta «ignorar orden»', async ({ page }) => {
    await open(page, '/es/jsondiff/');
    await expect(page.locator('.pill.ok')).toHaveText('+2');
    await expect(page.locator('.pill.bad')).toHaveText('−1');
    await expect(page.locator('.pill.warn')).toHaveText('~3');
    await expect(region(page, 'Diferencias')).toContainText('$.limites.timeoutMs');

    await page.getByLabel('Original').fill('{"roles": ["a", "b"]}');
    await page.getByLabel('Modificado').fill('{"roles": ["b", "a"]}');
    await expect(page.locator('.pill.warn')).toHaveText('~2');
    await page.getByLabel('Ignorar el orden en arreglos').check();
    await expect(page.locator('.pill.neu')).toHaveText('Sin diferencias');
  });
});

test.describe('JSON → tipos', () => {
  test('genera TypeScript, Java y Go', async ({ page }) => {
    await open(page, '/es/jsontypes/');
    const out = region(page, 'Tipos generados');
    await expect(out).toContainText('export interface Cliente {');
    await expect(out).toContainText('cupon?: string;');

    await page.getByRole('button', { name: 'Go' }).click();
    await expect(out).toContainText('AvatarURL any');

    await page.getByRole('button', { name: 'Java' }).click();
    await page.getByLabel('Nombre raíz').fill('Customer');
    await expect(out).toContainText('public record Customer(');

    await page.getByLabel('Entrada JSON').fill('{"a":');
    await expect(page.locator('.pill.bad')).toBeVisible();
  });
});

test.describe('curl → código', () => {
  test('convierte el ejemplo a cada lenguaje y avisa errores', async ({ page }) => {
    await open(page, '/es/curl/');
    const out = region(page, 'Código generado');
    await expect(out).toContainText(
      'await fetch("https://api.ejemplo.dev/v2/pedidos?notificar=true"',
    );
    await expect(page.locator('.pill.neu')).toHaveText('POST api.ejemplo.dev');

    await page.getByRole('button', { name: 'Python requests' }).click();
    await expect(out).toContainText('"regalo": False');
    await page.getByRole('button', { name: 'Go net/http' }).click();
    await expect(out).toContainText('http.NewRequest("POST"');
    await page.getByRole('button', { name: 'Java HttpClient' }).click();
    await expect(out).toContainText('HttpRequest.newBuilder()');

    await page.getByLabel('Comando curl').fill("curl 'https://x.dev");
    await expect(page.locator('.pill.bad')).toHaveText('Hay una comilla sin cerrar');
  });

  test('abre con el comando pegado en el home', async ({ page }) => {
    await open(page, '/es/');
    await page.getByLabel('Pega cualquier cosa').fill('curl -I https://ejemplo.dev');
    await page.getByLabel('Pega cualquier cosa').press('Enter');
    await expect(page).toHaveURL(/\/es\/curl\/$/);
    await expect(page.locator('.pill.neu')).toHaveText('HEAD ejemplo.dev');
  });
});

test.describe('chmod', () => {
  test('octal, casillas y modos simbólicos', async ({ page }) => {
    await open(page, '/es/chmod/');
    const kv = page.locator('.kv');
    await expect(kv).toContainText('rwxr-xr-x');

    await page.getByLabel('Otros: Ejecutar').uncheck();
    await page.getByLabel('Otros: Leer').uncheck();
    await expect(page.getByLabel('Permisos: octal, simbólico o comando')).toHaveValue('750');
    await expect(kv).toContainText('chmod u=rwx,g=rx,o= archivo');

    const input = page.getByLabel('Permisos: octal, simbólico o comando');
    await input.fill('drwxrwxrwt');
    await expect(kv).toContainText('1777');
    await input.fill('777');
    await expect(page.locator('.pill.warn')).toHaveText('Cualquiera puede escribir');
    await input.fill('9');
    await expect(page.locator('.pill.bad')).toHaveText('No es un modo válido');
  });
});
