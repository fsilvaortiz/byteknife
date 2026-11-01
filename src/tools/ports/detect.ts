// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

/** «puerto 5432», «:8080» o «port 443». Un número solo es ambiguo y no se detecta. */
export const looksLikePort = (input: string) =>
  /^(?:(?:puerto|port|porta)\s+|:)\d{1,5}$/i.test(input.trim()) &&
  Number(input.replace(/\D/g, '')) <= 65535;
