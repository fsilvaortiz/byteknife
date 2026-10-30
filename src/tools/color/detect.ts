// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const isColor = (input: string) =>
  /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(input) ||
  /^(rgb|hsl|oklch|lab|hwb)a?\(.+\)$/i.test(input);
