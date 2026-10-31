// Presupuesto del plan: ≤ 50 KB (gzip) de JS inicial POR PÁGINA.
// Para cada página se siguen los scripts, las islas (component-url, renderer-url) y sus
// imports estáticos. El chunk de la herramienta llega por import() desde ToolHost, pero se
// cuenta igual porque la página no sirve sin él. El worker de hash queda fuera: solo se
// carga al elegir un archivo.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { scriptSeeds, toolChunk, withStaticImports } from './integrations/asset-graph.mjs';

const DIST = 'dist';
const LIMIT = '50 KB';

const read = (file) => readFileSync(file, 'utf8');

const locale = 'es';
const pages = readdirSync(join(DIST, locale), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

export default [
  { name: `/${locale}/`, html: join(DIST, locale, 'index.html'), extra: [] },
  ...pages.map((id) => ({
    name: `/${locale}/${id}/`,
    html: join(DIST, locale, id, 'index.html'),
    extra: toolChunk(DIST, id),
  })),
].map(({ name, html, extra }) => ({
  name,
  path: withStaticImports(DIST, [...scriptSeeds(DIST, read(html)), ...extra]),
  limit: LIMIT,
  gzip: true,
}));
