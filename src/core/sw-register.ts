// Registra el service worker (integrations/sw.js) solo en el build: en dev no existe sw.js.
export function registerServiceWorker() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}
