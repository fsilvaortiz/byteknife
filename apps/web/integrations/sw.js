// Service worker de ByteKnife. Plantilla: service-worker.mjs reemplaza VERSION y PRECACHE
// al compilar y la escribe en dist/sw.js.
//
// - Shell (raíz y home de cada idioma, con sus scripts, estilos y fuentes): precache.
// - Páginas: red primero; cada página visitada queda guardada para usarla sin conexión.
// - /_astro/: los nombres llevan hash, así que caché primero y red si falta.
// Solo intercepta GET del mismo origen: nunca toca otros dominios.

const VERSION = '__VERSION__';
const PRECACHE = /* PRECACHE */ [];
const SHELL = `byteknife-shell-${VERSION}`;
const RUNTIME = 'byteknife-runtime';
const LOCALES = ['es', 'en', 'pt'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('byteknife-shell-') && k !== SHELL)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') event.respondWith(page(request, url));
  else if (url.pathname.startsWith('/_astro/')) event.respondWith(asset(request));
  else event.respondWith(networkFirst(request, url.pathname));
});

async function save(key, response) {
  const cache = await caches.open(RUNTIME);
  await cache.put(key, response);
}

/** Red primero; sin conexión, la copia guardada o el home del idioma. */
async function page(request, url) {
  try {
    return await networkFirst(request, url.pathname, true);
  } catch {
    const locale = LOCALES.find((l) => url.pathname.startsWith(`/${l}/`)) ?? 'en';
    return (await caches.match(`/${locale}/`)) ?? Response.error();
  }
}

async function networkFirst(request, key, rethrow = false) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await save(key, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(key);
    if (cached) return cached;
    if (rethrow) throw error;
    return Response.error();
  }
}

async function asset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await save(request, response.clone());
  return response;
}
