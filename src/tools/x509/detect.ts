// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const PEM_RE =
  /-----BEGIN ((?:NEW )?CERTIFICATE(?: REQUEST)?)-----([\s\S]*?)-----END \1-----/g;

/** 'cert' o 'csr' según el primer bloque PEM que encuentre. */
export function pemKind(input: string): 'cert' | 'csr' | null {
  const m = input.match(/-----BEGIN ((?:NEW )?CERTIFICATE(?: REQUEST)?)-----/);
  if (!m) return null;
  return m[1]!.endsWith('REQUEST') ? 'csr' : 'cert';
}
