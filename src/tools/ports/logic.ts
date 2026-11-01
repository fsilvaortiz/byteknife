import { PORTS, RISKY, type Port } from './data';

export { looksLikePort } from './detect';
export { PORTS, RISKY, type Port, type PortCategory, type PortNote } from './data';

export type Range = 'wellKnown' | 'registered' | 'dynamic' | 'invalid';

export const rangeOf = (n: number): Range =>
  !Number.isInteger(n) || n < 0 || n > 65535
    ? 'invalid'
    : n < 1024
      ? 'wellKnown'
      : n < 49152
        ? 'registered'
        : 'dynamic';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Filtra por número (exacto si es un número completo), nombre de servicio o categoría.
 * `labelOf` traduce la categoría para poder buscar por su nombre en el idioma actual.
 */
export function searchPorts(query: string, labelOf: (p: Port) => string = () => ''): Port[] {
  const q = norm(query.trim().replace(/^(?:puerto|port|porta)\s+|^:/i, ''));
  if (!q) return PORTS;
  if (/^\d+$/.test(q))
    return PORTS.filter(
      (p) => String(p.port) === q || (q.length < 3 && String(p.port).startsWith(q)),
    );
  const words = q.split(/\s+/);
  return PORTS.filter((p) => {
    const hay = norm(`${p.port} ${p.service} ${p.category} ${labelOf(p)}`);
    return words.every((w) => hay.includes(w));
  });
}

export const isRisky = (p: Port) => RISKY.has(p.port);
