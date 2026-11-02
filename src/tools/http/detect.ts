// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

/** Códigos registrados más comunes; la lista completa vive en data.ts. */
const COMMON = new Set([
  100, 101, 200, 201, 202, 204, 206, 301, 302, 303, 304, 307, 308, 400, 401, 403, 404, 405, 406,
  408, 409, 410, 413, 415, 418, 422, 429, 431, 451, 500, 501, 502, 503, 504,
]);

export const isStatusCode = (input: string) => /^\d{3}$/.test(input) && COMMON.has(Number(input));
