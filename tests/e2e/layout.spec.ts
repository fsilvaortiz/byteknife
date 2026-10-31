import { expect, test } from '@playwright/test';
import { TOOL_IDS } from './tools';

// Cada herramienta reserva su altura inicial hasta montar (src/styles/tool-heights.css) para
// que el texto de abajo no salte. Si una herramienta cambia de alto, hay que regenerarla
// con `pnpm tool-heights`: la reserva no puede superar la altura real (dejaría un hueco que
// se cierra de golpe) ni quedarse muy corta (volvería el salto).
const TOLERANCE = 48;

for (const width of [1280, 420]) {
  test(`la altura reservada de cada herramienta está al día a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const id of TOOL_IDS) {
      await page.goto(`/es/${id}/`);
      const root = page.locator('#toolRoot[data-ready]');
      await root.waitFor();
      await page.waitForLoadState('networkidle');
      const [reserved, real] = await root.evaluate((el: HTMLElement) => {
        const real = el.offsetHeight;
        el.removeAttribute('data-ready');
        const reserved = parseFloat(getComputedStyle(el).minHeight) || 0;
        el.setAttribute('data-ready', '');
        return [reserved, real];
      });
      expect(reserved, `${id}: reserva ${reserved}px > real ${real}px`).toBeLessThanOrEqual(
        real + 1,
      );
      expect(real - reserved, `${id}: reserva ${reserved}px, real ${real}px`).toBeLessThan(
        TOLERANCE,
      );
    }
  });
}
