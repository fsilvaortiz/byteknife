// Presupuesto del plan: ≤ 50 KB (gzip) de JS inicial POR PÁGINA.
// Para cada página se siguen los scripts, las islas (component-url, renderer-url) y sus
// imports estáticos. El chunk de la herramienta llega por import() desde ToolHost, pero se
// cuenta igual porque la página no sirve sin él. El worker de hash queda fuera: solo se
// carga al elegir un archivo.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const ASTRO = join(DIST, '_astro');
const LIMIT = '50 KB';

const read = (file) => readFileSync(file, 'utf8');
const assetPath = (url) => join(DIST, url.replace(/^\//, ''));

function pageSeeds(html) {
  const urls = [
    ...html.matchAll(/<script[^>]*\ssrc="([^"]+\.js)"/g),
    ...html.matchAll(/(?:component|renderer|before-hydration)-url="([^"]+\.js)"/g),
  ].map((m) => m[1]);
  return [...new Set(urls)].map(assetPath);
}

/** Chunk de la herramienta que ToolHost importa para este id. */
function toolChunk(id) {
  if (!existsSync(join('src', 'tools', id, 'Tool.tsx'))) return [];
  const host = readdirSync(ASTRO).find((f) => /^ToolHost\..+\.js$/.test(f));
  const re = new RegExp(`"\\.\\./tools/${id}/Tool\\.tsx":[^\`]*?import\\(\`\\./([^\`]+)\``);
  const m = host && read(join(ASTRO, host)).match(re);
  if (!m) throw new Error(`No se encontró el chunk de ${id} en ToolHost: revisa .size-limit.js`);
  return [join(ASTRO, m[1])];
}

/** Cierra la lista con los imports estáticos (no los import() dinámicos). */
function withStaticImports(seeds) {
  const seen = new Set();
  const stack = [...seeds];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const m of read(file).matchAll(/(?:\bfrom|\bimport)\s*["']\.\/([^"']+\.js)["']/g)) {
      stack.push(join(ASTRO, m[1]));
    }
  }
  return [...seen];
}

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
    extra: toolChunk(id),
  })),
].map(({ name, html, extra }) => ({
  name,
  path: withStaticImports([...pageSeeds(read(html)), ...extra]),
  limit: LIMIT,
  gzip: true,
}));
