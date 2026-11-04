// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

const SEP = /^[0-9a-f]{2}([:-])(?:[0-9a-f]{2}\1){4}[0-9a-f]{2}$/i;
const CISCO = /^[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}$/i;

/** 48 bits como AA:BB:CC:DD:EE:FF, AA-BB-…, aabb.ccdd.eeff o 12 dígitos hex seguidos. */
export function macBytes(input: string): number[] | null {
  const s = input.trim();
  let hex: string;
  if (SEP.test(s)) hex = s.replace(/[:-]/g, '');
  else if (CISCO.test(s)) hex = s.replace(/\./g, '');
  else if (/^[0-9a-f]{12}$/i.test(s)) hex = s;
  else return null;
  return hex.match(/../g)!.map((b) => parseInt(b, 16));
}

/** Solo las formas con separador: 12 dígitos sueltos también podrían ser otra cosa. */
export const looksLikeMac = (input: string) => SEP.test(input.trim()) || CISCO.test(input.trim());
