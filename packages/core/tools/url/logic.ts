export { isHttpUrl } from './detect';

export type UrlMode = 'dec' | 'enc' | 'encu';

/** Secuencia % mal formada: la interfaz arma el mensaje en el idioma del usuario. */
export class UrlError extends Error {
  constructor(readonly code: 'malformed') {
    super(code);
    this.name = 'UrlError';
  }
}

/** Decodifica (con + como espacio), codifica un componente o una URL completa. */
export function transformUrl(input: string, mode: UrlMode): string {
  try {
    if (mode === 'enc') return encodeURIComponent(input);
    if (mode === 'encu') return encodeURI(input);
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch {
    throw new UrlError('malformed');
  }
}

export interface UrlParts {
  protocol: string;
  host: string;
  /** Vacío si es el puerto por defecto del protocolo. */
  port: string;
  path: string;
  hash: string;
  origin: string;
  params: [key: string, value: string][];
}

/** Desglosa una URL absoluta; null si no lo es. La ruta se muestra decodificada si se puede. */
export function parseUrl(input: string): UrlParts | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  let path = u.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Ruta con % suelto: se muestra tal cual.
  }
  return {
    protocol: u.protocol,
    host: u.hostname,
    port: u.port,
    path,
    hash: u.hash,
    origin: u.origin,
    params: [...u.searchParams],
  };
}
