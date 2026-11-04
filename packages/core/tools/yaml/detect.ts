// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

const KEY_LINE = /^\s*(?:- )?[\w"'.-][\w"' .-]*:(?:\s|$)/;

/**
 * YAML con forma de configuración: empieza con «---» o tiene al menos dos líneas «clave:».
 * No intenta parsear: el parser vive en un chunk aparte.
 */
export function looksLikeYaml(input: string): boolean {
  if (/^[[{]/.test(input) || /^https?:\/\//i.test(input)) return false;
  if (/^---\s*\n/.test(input)) return true;
  const lines = input.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  return lines.length >= 2 && lines.filter((l) => KEY_LINE.test(l)).length >= 2;
}
