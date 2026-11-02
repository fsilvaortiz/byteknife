// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

/** Detección: empieza como objeto o arreglo; distingue válido de inválido. */
export function detectJson(input: string): 'valid' | 'invalid' | null {
  if (!/^[[{]/.test(input)) return null;
  try {
    JSON.parse(input);
    return 'valid';
  } catch {
    return 'invalid';
  }
}
