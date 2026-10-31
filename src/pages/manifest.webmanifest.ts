import type { APIRoute } from 'astro';
import { t } from '../i18n';

// Manifest de la PWA. Uno solo para los tres idiomas: la raíz elige el idioma al abrir.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: 'ByteKnife',
      short_name: 'ByteKnife',
      description: t('en', 'site.tagline'),
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#edf1ee',
      theme_color: '#13201a',
      icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
