// Mide la altura inicial de cada herramienta y escribe src/styles/tool-heights.css.
// Esa altura se reserva hasta que la herramienta monta (ToolHost marca .tool con
// data-ready), para que el texto de abajo no salte (CLS). Se mide al ancho mayor de cada
// tramo de app.css: así la reserva nunca supera la altura real y no deja huecos.
//
// Uso: pnpm build && pnpm preview, y en otra terminal: pnpm tool-heights [url-base]
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const IDS = readdirSync('src/tools').filter((id) => existsSync(`src/tools/${id}/Tool.tsx`));
// [ancho medido, media query del tramo]
const RANGES = [
  [1280, null],
  [960, '(max-width: 960px)'],
  [720, '(max-width: 720px)'],
  [420, '(max-width: 420px)'],
];

const browser = await chromium.launch();
const rules = new Map();
for (const [width, query] of RANGES) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const lines = [];
  for (const id of IDS) {
    await page.goto(`${BASE}/es/${id}/`);
    await page.locator('#toolRoot[data-ready]').waitFor();
    await page.waitForLoadState('networkidle');
    const h = await page.locator('#toolRoot').evaluate((el) => Math.floor(el.offsetHeight));
    lines.push(`  .tool:not([data-ready])[data-tool-id='${id}'] {\n    min-height: ${h}px;\n  }`);
  }
  rules.set(query, lines);
  await page.close();
}
await browser.close();

const css = [
  '/* Generado por scripts/tool-heights.mjs: altura inicial de cada herramienta por tramo. */',
  ...[...rules].map(([query, lines]) =>
    query
      ? `@media ${query} {\n${lines.join('\n')}\n}`
      : lines.map((l) => l.replace(/^ {2}/gm, '')).join('\n'),
  ),
  '',
].join('\n');
writeFileSync('src/styles/tool-heights.css', css);
console.log('src/styles/tool-heights.css actualizado');
