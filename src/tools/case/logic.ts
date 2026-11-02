/**
 * Separa en palabras: cortes entre minúscula/dígito y mayúscula (`camelCase`), al final de un
 * acrónimo (`HTTPResponse` → HTTP Response) y en todo lo que no sea letra o número.
 */
export function splitWords(input: string, stripAccents: boolean): string[] {
  const s = stripAccents ? input.normalize('NFD').replace(/\p{M}/gu, '') : input.normalize('NFC');
  return s
    .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Primera letra en mayúscula y el resto en minúscula; respeta caracteres fuera del BMP. */
export function capitalize(word: string): string {
  const [first = '', ...rest] = [...word];
  return first.toUpperCase() + rest.join('').toLowerCase();
}

export const CASES = [
  'camel',
  'pascal',
  'snake',
  'constant',
  'kebab',
  'dot',
  'path',
  'title',
  'sentence',
  'lower',
  'upper',
] as const;
export type CaseId = (typeof CASES)[number];

export function convertCase(input: string, stripAccents: boolean): Record<CaseId, string> {
  const w = splitWords(input, stripAccents);
  const lw = w.map((x) => x.toLowerCase());
  return {
    camel: lw.map((x, i) => (i ? capitalize(x) : x)).join(''),
    pascal: w.map(capitalize).join(''),
    snake: lw.join('_'),
    constant: lw.join('_').toUpperCase(),
    kebab: lw.join('-'),
    dot: lw.join('.'),
    path: lw.join('/'),
    title: w.map(capitalize).join(' '),
    sentence: capitalize(lw.join(' ')),
    lower: lw.join(' '),
    upper: lw.join(' ').toUpperCase(),
  };
}
