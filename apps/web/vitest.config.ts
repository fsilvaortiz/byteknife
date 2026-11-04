/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';

// Pruebas de lo que solo existe en la web (SEO, contador de visitas, service worker).
// La cobertura se configura en el vitest.config.ts de la raíz. Se fija la raíz porque
// vitest corre desde la raíz del workspace.
const root = fileURLToPath(new URL('.', import.meta.url));

export default getViteConfig(
  { root, test: { name: 'web', include: ['src/**/*.test.ts'] } },
  { root },
);
