// En cada página de herramienta agrega <link rel="modulepreload"> al chunk de la herramienta
// y a sus imports estáticos. ToolHost los carga con import() después de hidratarse; con el
// preload el navegador los pide en paralelo al HTML y la herramienta aparece antes (LCP).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scriptSeeds, toolChunk, withStaticImports } from './asset-graph.mjs';

const LOCALES = ['es', 'en', 'pt'];

export default function toolPreload() {
  return {
    name: 'byteknife:tool-preload',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const ids = readdirSync(join(dist, LOCALES[0]), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);
        let pages = 0;
        for (const id of ids) {
          const chunk = toolChunk(dist, id);
          if (!chunk.length) continue;
          for (const locale of LOCALES) {
            const file = join(dist, locale, id, 'index.html');
            if (!existsSync(file)) continue;
            const html = readFileSync(file, 'utf8');
            const loaded = new Set(withStaticImports(dist, scriptSeeds(dist, html)));
            const links = withStaticImports(dist, chunk)
              .filter((f) => !loaded.has(f))
              .map(
                (f) =>
                  `<link rel="modulepreload" href="/${relative(dist, f).split(sep).join('/')}">`,
              )
              .join('');
            writeFileSync(file, html.replace('</head>', `${links}</head>`));
            pages++;
          }
        }
        logger.info(`modulepreload del chunk de la herramienta en ${pages} páginas`);
      },
    },
  };
}
