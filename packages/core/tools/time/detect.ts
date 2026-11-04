// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

/** Detección: Unix de 10 o 13 dígitos, o una fecha ISO que el navegador entiende. */
export const isTimestamp = (input: string) =>
  /^\d{10}(\d{3})?$/.test(input) ||
  (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/.test(input) && !Number.isNaN(Date.parse(input)));
