/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import ouiData from '@byteknife/core/vite/oui-data.mjs';

// Shell SPA de la app de escritorio. Tauri sirve dist/ en producción y abre devUrl en
// desarrollo (puerto fijo 1420, el que espera tauri.conf.json).
export default defineConfig({
  plugins: [preact(), ouiData()],
  // Rutas con hash (#/es/json/): navegar no recarga la página (core/paths.ts). En Vitest no
  // se define: los proyectos comparten import.meta.env y cambiaría las rutas de core y web.
  define: process.env['VITEST']
    ? {}
    : { 'import.meta.env.VITE_BK_ROUTE_PREFIX': JSON.stringify('#') },
  resolve: {
    alias: {
      // La app cambia de idioma sin recargar: carga los tres diccionarios, no solo el de
      // la página como la web (messages.browser.ts).
      '#i18n/messages': fileURLToPath(
        new URL('../../packages/core/i18n/messages.ts', import.meta.url),
      ),
    },
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  preview: { port: 1421, strictPort: true },
  // virtual:oui (~1,7 MB) solo se carga con import() en la herramienta MAC.
  build: { target: 'safari16', outDir: 'dist', chunkSizeWarningLimit: 2000 },
  test: { name: 'desktop', include: ['src/**/*.test.ts'] },
});
