// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const isCurlCommand = (input: string) => /^\s*(?:\$\s*)?curl\s+\S/.test(input);
