// Contador de visitas: el navegador envía solo la ruta de la página y el dominio desde el
// que llegó (sin cookies, IP ni nada de lo que el usuario escribe). Lo usan el cliente
// (countVisit) y el Worker (worker/index.ts), que valida antes de guardar.

export interface Visit {
  /** Ruta de una página del sitio: /, /es/ o /es/json/. */
  path: string;
  /** Dominio de origen (news.ycombinator.com) o '' si se llegó directo o desde el sitio. */
  ref: string;
}

const PAGE = /^\/(?:(?:es|en|pt)\/(?:[a-z0-9-]{1,32}\/)?)?$/;
const HOST = /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;

/** Valida lo que llega al Worker. Cualquier otra cosa se descarta. */
export function parseVisit(body: unknown): Visit | null {
  if (typeof body !== 'object' || body === null) return null;
  const { p, r } = body as { p?: unknown; r?: unknown };
  if (typeof p !== 'string' || !PAGE.test(p)) return null;
  const ref = typeof r === 'string' ? r.toLowerCase() : '';
  return { path: p, ref: ref.length <= 253 && HOST.test(ref) ? ref : '' };
}

/** Lo que el navegador envía: la ruta y el dominio de origen si es externo. */
export function visitFor(pathname: string, referrer: string, host: string): Visit {
  let ref = '';
  try {
    ref = referrer ? new URL(referrer).hostname : '';
  } catch {
    // referrer inválido: se cuenta como visita directa
  }
  return { path: pathname, ref: ref === host ? '' : ref };
}

/** Cuenta la visita a la página actual. Solo en el build; sin conexión, no hace nada. */
export function countVisit() {
  if (!import.meta.env.PROD || !navigator.sendBeacon) return;
  const { path, ref } = visitFor(location.pathname, document.referrer, location.hostname);
  navigator.sendBeacon('/api/visit', JSON.stringify({ p: path, r: ref }));
}
