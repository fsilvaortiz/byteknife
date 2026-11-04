// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/** Quita espacios, el prefijo urn:uuid: y las llaves de los GUID de Microsoft. */
export const normalizeUuid = (s: string) =>
  s
    .trim()
    .replace(/^urn:uuid:/i, '')
    .replace(/^\{(.*)\}$/, '$1');

export const isUuid = (s: string) => UUID_RE.test(normalizeUuid(s));
