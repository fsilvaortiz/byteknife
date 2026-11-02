// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

/** Permisos como los muestra ls -l: -rwxr-xr-x, drwxr-sr-t, con «.» o «+» opcional al final. */
export const LS_MODE = /^[-dlcbps]?[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-][.+@]?$/;

export function detectChmod(input: string): 'ls' | 'octal' | 'command' | null {
  const s = input.trim();
  if (/^chmod\s+(?:-\w+\s+)*[0-7ugoa+=,rwxXst-]+\s/.test(s)) return 'command';
  if (LS_MODE.test(s) && s.length >= 9) return 'ls';
  if (/^0[0-7]{3}$/.test(s)) return 'octal';
  return null;
}
