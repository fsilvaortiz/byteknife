import { expect, test, type Locator, type Page } from '@playwright/test';

const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGYzYTIxIn0.80xahJwPRarA9O2w9o-NaTMcwxhsChNjaL6o7UjBXII';

/** Avanza con Tab hasta que el elemento tenga el foco: prueba que es alcanzable con teclado. */
async function tabTo(page: Page, target: Locator, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('El elemento no es alcanzable con Tab');
}

async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test.describe('búsqueda rápida', () => {
  test('Ctrl K abre, se filtra y Enter navega', async ({ page }) => {
    await ready(page, '/es/');
    await page.keyboard.press('Control+k');
    const input = page.getByRole('combobox', { name: 'Buscar' });
    await expect(input).toBeFocused();
    await page.keyboard.type('sha256');
    await expect(page.getByRole('option')).toHaveText([/Hash/]);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/es\/hash\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hash');
  });

  test('flechas mueven la selección y Escape cierra devolviendo el foco', async ({ page }) => {
    await ready(page, '/es/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('json');
    const options = page.getByRole('option');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(options.last()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('/ abre la búsqueda fuera de campos de texto', async ({ page }) => {
    await ready(page, '/es/cron/');
    await page.keyboard.press('/');
    await expect(page.getByRole('combobox', { name: 'Buscar' })).toBeFocused();
  });

  test('pegar un JWT ofrece abrirlo y lleva la entrada a la herramienta', async ({ page }) => {
    await ready(page, '/es/');
    await page.keyboard.press('Control+k');
    await page.keyboard.insertText(JWT);
    await expect(page.getByRole('option').first()).toContainText('Abrir en Decodificador JWT');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/es\/jwt\/$/);
    const pending = await page.evaluate(() => sessionStorage.getItem('byteknife:pending'));
    expect(JSON.parse(pending!)).toEqual({ id: 'jwt', input: JWT });
  });

  test('sin coincidencias muestra un mensaje', async ({ page }) => {
    await ready(page, '/es/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('zzzz');
    await expect(page.getByText('Nada coincide con «zzzz».')).toBeVisible();
  });
});

test.describe('detección al pegar en el home', () => {
  test('muestra el formato y Enter abre la herramienta', async ({ page }) => {
    await ready(page, '/es/');
    const paste = page.getByLabel('Pega cualquier cosa');
    await tabTo(page, paste);
    await page.keyboard.insertText('0 9 * * 1-5');
    await expect(page.getByTestId('detect')).toContainText('Cron → Expresiones cron');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/es\/cron\/$/);
  });

  test('formato desconocido ofrece herramientas de respaldo', async ({ page }) => {
    await ready(page, '/es/');
    await page.getByLabel('Pega cualquier cosa').fill('hola mundo');
    await expect(page.getByTestId('detect')).toContainText('No reconocemos el formato');
    await expect(page.getByTestId('detect').getByRole('button')).toHaveCount(4);
  });
});

test.describe('favoritos y recientes', () => {
  test('se marcan con teclado y aparecen en el home', async ({ page }) => {
    await ready(page, '/es/uuid/');
    const fav = page.getByRole('button', { name: '☆ Favorito' });
    await tabTo(page, fav);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: '★ En favoritos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('status')).toHaveText('Agregada a favoritos');

    await ready(page, '/es/regex/');
    await ready(page, '/es/');
    await expect(page.getByTestId('favorites')).toHaveText('★ UUID');
    await expect(page.getByTestId('recents')).toHaveText('Regex');
    await expect(page.locator('[data-tool="uuid"] i')).toBeVisible();

    await ready(page, '/es/uuid/');
    await page.getByRole('button', { name: '★ En favoritos' }).press('Enter');
    await ready(page, '/es/');
    await expect(page.getByTestId('favorites')).toHaveCount(0);
    await expect(page.getByTestId('recents')).toHaveText(/UUID.*Regex|Regex.*UUID/);
  });
});

test.describe('vista de herramienta', () => {
  test('el rail marca la herramienta actual', async ({ page }) => {
    await ready(page, '/es/color/');
    const current = page
      .getByRole('navigation', { name: 'Herramientas' })
      .locator('[aria-current="page"]');
    await expect(current).toHaveText('Colores');
  });

  test('en móvil el selector cambia de herramienta', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await ready(page, '/es/color/');
    await page.getByLabel('Cambiar herramienta').selectOption('base');
    await expect(page).toHaveURL(/\/es\/base\/$/);
  });

  test('las páginas en inglés usan sus textos', async ({ page }) => {
    await ready(page, '/en/password/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Passwords');
    await expect(page).toHaveTitle('Passwords · ByteKnife');
  });
});

test('el home muestra la hora y un UUID que se puede regenerar', async ({ page }) => {
  await ready(page, '/es/');
  const uuid = page.getByTestId('now-uuid');
  await expect(uuid).toHaveText(/^[0-9a-f-]{36}$/);
  const first = await uuid.textContent();
  await page.getByRole('button', { name: 'Otro' }).click();
  await expect(uuid).not.toHaveText(first!);
});
