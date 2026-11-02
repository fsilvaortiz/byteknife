// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

const HEAD = /^\s*["']?(openapi|swagger)["']?\s*:\s*["']?(\d+\.\d+)/m;

/** «3.1», «2.0»… si el texto declara openapi o swagger en sus primeras líneas. */
export function declaredVersion(input: string): string | null {
  const m = input.slice(0, 2000).match(HEAD);
  if (!m) return null;
  const v = m[2]!;
  return (m[1] === 'swagger') === (v === '2.0') ? v : null;
}
