// Genera dist/sw.js al terminar el build: la plantilla integrations/sw.js con la lista de
// precache del shell y una versión que cambia cuando cambia cualquiera de esos archivos.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetPath, scriptSeeds, styleSeeds, withStaticImports } from './asset-graph.mjs';

const LOCALES = ['es', 'en', 'pt'];
const TEMPLATE = fileURLToPath(new URL('./sw.js', import.meta.url));

/**
 * Fuentes que usa un CSS (en línea en el HTML o en una hoja aparte). Solo el subconjunto
 * latin: latin-ext cubre caracteres que es, en y pt casi no usan y se pide si hace falta.
 */
function latinFonts(dist, css) {
  const urls = [...css.matchAll(/url\((\/_astro\/[^)]+\.woff2)\)/g)];
  return urls
    .map((m) => m[1])
    .filter((u) => /-latin-(?!ext-)/.test(u))
    .map((u) => assetPath(dist, u));
}

/** Archivos del shell: la raíz, el home de cada idioma y lo que necesitan para funcionar. */
export function shellFiles(dist) {
  const pages = ['index.html', ...LOCALES.map((l) => join(l, 'index.html'))];
  const files = new Set([join(dist, 'favicon.svg'), join(dist, 'manifest.webmanifest')]);
  for (const page of pages) {
    const file = join(dist, page);
    const html = readFileSync(file, 'utf8');
    files.add(file);
    for (const js of withStaticImports(dist, scriptSeeds(dist, html))) files.add(js);
    for (const font of latinFonts(dist, html)) files.add(font);
    for (const css of styleSeeds(dist, html)) {
      files.add(css);
      for (const font of latinFonts(dist, readFileSync(css, 'utf8'))) files.add(font);
    }
  }
  return [...files].sort();
}

/** URL pública de un archivo de dist/ (dist/es/index.html → /es/). */
const toUrl = (dist, file) =>
  '/' +
  relative(dist, file)
    .split(sep)
    .join('/')
    .replace(/(^|\/)index\.html$/, '$1');

export default function serviceWorker() {
  return {
    name: 'byteknife:service-worker',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const files = shellFiles(dist);
        const hash = createHash('sha256');
        for (const f of files) hash.update(f).update(readFileSync(f));
        const version = hash.digest('hex').slice(0, 12);
        const sw = readFileSync(TEMPLATE, 'utf8')
          .replace('__VERSION__', version)
          .replace('/* PRECACHE */ []', JSON.stringify(files.map((f) => toUrl(dist, f))));
        writeFileSync(join(dist, 'sw.js'), sw);
        logger.info(`sw.js ${version}: ${files.length} archivos en el precache`);
      },
    },
  };
}
