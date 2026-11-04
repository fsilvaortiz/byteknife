// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export const isNumberLiteral = (input: string) => /^(0x[0-9a-f]+|0b[01]+|0o[0-7]+)$/i.test(input);
