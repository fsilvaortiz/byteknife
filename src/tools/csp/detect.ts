// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const looksLikeCsp = (input: string) =>
  /(?:^|[;\s:])(?:default|script|style|img|connect|frame|object)-src\s/i.test(input) ||
  /^content-security-policy(?:-report-only)?\s*:/i.test(input.trim());
