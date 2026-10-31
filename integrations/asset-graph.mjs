// Qué archivos de dist/ necesita una página para funcionar. Lo usan el presupuesto de JS
// (.size-limit.js) y la lista de precache del service worker (service-worker.mjs).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (file) => readFileSync(file, 'utf8');

/** Ruta en disco de una URL absoluta del sitio (/_astro/x.js → dist/_astro/x.js). */
export const assetPath = (dist, url) => join(dist, url.replace(/^\//, ''));

/** Scripts e islas (component-url, renderer-url) que carga el HTML. */
export function scriptSeeds(dist, html) {
  const urls = [
    ...html.matchAll(/<script[^>]*\ssrc="([^"]+\.js)"/g),
    ...html.matchAll(/(?:component|renderer|before-hydration)-url="([^"]+\.js)"/g),
  ].map((m) => m[1]);
  return [...new Set(urls)].map((u) => assetPath(dist, u));
}

/** Hojas de estilo enlazadas desde el HTML. */
export function styleSeeds(dist, html) {
  const urls = [...html.matchAll(/<link[^>]*\shref="([^"]+\.css)"/g)].map((m) => m[1]);
  return [...new Set(urls)].map((u) => assetPath(dist, u));
}

/** Cierra la lista con los imports estáticos entre chunks (no los import() dinámicos). */
export function withStaticImports(dist, seeds) {
  const astro = join(dist, '_astro');
  const seen = new Set();
  const stack = [...seeds];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const m of read(file).matchAll(/(?:\bfrom|\bimport)\s*["']\.\/([^"']+\.js)["']/g)) {
      stack.push(join(astro, m[1]));
    }
  }
  return [...seen];
}

/**
 * Chunk de una herramienta: ToolHost lo carga con import(), así que no aparece en el HTML.
 * El mapa de import() puede quedar en el chunk de ToolHost o en el compartido. Devuelve []
 * si la herramienta aún no tiene Tool.tsx.
 */
export function toolChunk(dist, id) {
  if (!existsSync(join('src', 'tools', id, 'Tool.tsx'))) return [];
  const astro = join(dist, '_astro');
  const re = new RegExp(`"\\.\\./tools/${id}/Tool\\.tsx":[^\`]*?import\\(\`\\./([^\`]+)\``);
  const m = readdirSync(astro)
    .filter((f) => f.endsWith('.js'))
    .map((f) => read(join(astro, f)).match(re))
    .find(Boolean);
  if (!m) throw new Error(`No se encontró el chunk de ${id}: revisa integrations/asset-graph.mjs`);
  return [join(astro, m[1])];
}
