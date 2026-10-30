// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const isHttpUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);
