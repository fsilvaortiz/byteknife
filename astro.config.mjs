// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import serviceWorker from './integrations/service-worker.mjs';
import ouiData from './integrations/oui-data.mjs';
import toolPreload from './integrations/tool-preload.mjs';

export default defineConfig({
  site: 'https://byteknife.dev',
  integrations: [preact(), toolPreload(), serviceWorker()],
  // Los textos SEO no tienen bloques de código; Shiki usaría estilos en línea que la CSP bloquea.
  markdown: { syntaxHighlight: false },
  // CSS en línea: una request menos antes del primer render (Astro calcula su hash para la CSP).
  build: { inlineStylesheets: 'always' },
  vite: {
    plugins: [ouiData()],
    build: {
      rolldownOptions: {
        output: {
          // Un solo chunk para lo que comparten las islas del shell, en vez de ~20 de 1 KB:
          // en 4G cada request suma latencia antes del primer render. El código de cada
          // herramienta sigue en su propio chunk, cargado con import() desde ToolHost.
          codeSplitting: {
            groups: [
              {
                name: 'app',
                test: /node_modules[\\/](preact|@preact)|src[\\/](core|i18n|components)[\\/]/,
              },
              // Componentes de src/ui: solo los usan las herramientas, juntos en un chunk.
              { name: 'ui', test: /src[\\/]ui[\\/]/ },
            ],
          },
        },
      },
    },
  },
  security: {
    // Astro agrega a cada página un <meta> con script-src y style-src por hash. El resto de
    // las directivas cierra todo a 'self': ningún dato puede salir del navegador.
    csp: {
      directives: [
        "default-src 'self'",
        "connect-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "worker-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
});
