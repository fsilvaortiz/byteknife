// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

const STATEMENT =
  /^(?:select\s[\s\S]+\sfrom\s|with\s+\w+\s+as\s*\(|insert\s+into\s|update\s+\S+\s+set\s|delete\s+from\s|create\s+(?:or\s+replace\s+)?(?:table|view|index|unique\s+index|function|procedure)\s|alter\s+table\s|drop\s+(?:table|view|index)\s)/i;

/** Sentencia SQL habitual: SELECT … FROM, WITH, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP. */
export const looksLikeSql = (input: string) => STATEMENT.test(input.trimStart());
