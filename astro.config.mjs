// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://byteknife.dev',
  integrations: [preact()],
  // Hasta F3 (detección por Accept-Language), la raíz va al español.
  redirects: { '/': '/es/' },
});
