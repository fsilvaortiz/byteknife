// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const ATTRIBUTE =
  /;\s*(?:path|domain|expires|max-age|secure|httponly|samesite|partitioned|priority)\b/i;

export function detectCookie(input: string): 'setCookie' | 'cookie' | null {
  const s = input.trim();
  if (/^set-cookie\s*:/i.test(s)) return 'setCookie';
  if (/^cookie\s*:/i.test(s)) return 'cookie';
  if (/^[^\s=;]+=[^;]*/.test(s) && ATTRIBUTE.test(s)) return 'setCookie';
  return null;
}
