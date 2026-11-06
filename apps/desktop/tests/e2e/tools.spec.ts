import { expect, test } from '@playwright/test';
import { TOOL_IDS } from './tools';

// Cada herramienta debe montar en WebKit sin errores: es el motor de la app en macOS.
for (const id of TOOL_IDS) {
  test(`${id} monta en WebKit sin errores`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`/#/es/${id}/`);
    await expect(page.locator(`.tool[data-tool-id="${id}"]`)).toHaveAttribute('data-ready', '');
    await expect(page.locator('.tool .err')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}
