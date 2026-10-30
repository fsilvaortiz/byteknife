export { isNumberLiteral } from './detect';

export type InputBase = 'auto' | 2 | 8 | 10 | 16;

export class BaseError extends Error {
  constructor(readonly code: 'digits') {
    super(code);
    this.name = 'BaseError';
  }
}

const DIGITS: Record<2 | 8 | 10 | 16, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^\d+$/,
  16: /^[0-9a-f]+$/,
};
const PREFIX: Record<string, 2 | 8 | 16> = { '0b': 2, '0o': 8, '0x': 16 };
const PREFIX_OF: Record<2 | 8 | 10 | 16, string> = { 2: '0b', 8: '0o', 10: '', 16: '0x' };

export interface ParsedInteger {
  negative: boolean;
  /** Valor absoluto. */
  magnitude: bigint;
}

/**
 * Entero de tamaño arbitrario. Acepta `_` y espacios como separadores, signo `-` y los
 * prefijos 0x/0b/0o (en modo auto, o si coinciden con la base elegida). null si está vacío.
 */
export function parseInteger(raw: string, base: InputBase): ParsedInteger | null {
  let s = raw.trim().replace(/[_\s]/g, '').toLowerCase();
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);
  if (!s) return null;
  const prefixed = PREFIX[s.slice(0, 2)];
  let b: 2 | 8 | 10 | 16;
  if (base === 'auto') b = prefixed ?? 10;
  else if (prefixed && prefixed !== base) throw new BaseError('digits');
  else b = base;
  const digits = prefixed ? s.slice(2) : s;
  if (!DIGITS[b].test(digits)) throw new BaseError('digits');
  return { negative, magnitude: BigInt(PREFIX_OF[b] + digits) };
}

/** Separa en grupos de `size` desde la derecha. */
export const group = (digits: string, size: number, sep: string) =>
  digits.replace(new RegExp(`\\B(?=(.{${size}})+$)`, 'g'), sep);

export type RepresentationId = 'dec' | 'hex' | 'bin' | 'oct';

export interface Representation {
  id: RepresentationId;
  /** Valor para copiar, sin agrupar y con prefijo. */
  raw: string;
  /** Valor agrupado para leer. */
  shown: string;
}

export function representations(
  { negative, magnitude }: ParsedInteger,
  decimalSeparator: string,
): Representation[] {
  const sign = negative && magnitude !== 0n ? '-' : '';
  const dec = magnitude.toString(10);
  const hex = magnitude.toString(16).toUpperCase();
  const bin = magnitude.toString(2);
  const oct = magnitude.toString(8);
  return [
    { id: 'dec', raw: sign + dec, shown: sign + group(dec, 3, decimalSeparator) },
    { id: 'hex', raw: `${sign}0x${hex}`, shown: sign + group(hex, 4, ' ') },
    { id: 'bin', raw: `${sign}0b${bin}`, shown: sign + group(bin, 4, ' ') },
    { id: 'oct', raw: `${sign}0o${oct}`, shown: sign + oct },
  ];
}

export function bitInfo(magnitude: bigint): { bits: number; bytes: number } {
  const bits = magnitude === 0n ? 1 : magnitude.toString(2).length;
  return { bits, bytes: Math.ceil(bits / 8) };
}

/** Carácter Unicode si el número es un punto de código imprimible (sin controles ni sustitutos). */
export function codePointInfo({ negative, magnitude }: ParsedInteger) {
  if (negative || magnitude < 0x20n || magnitude > 0x10ffffn) return null;
  const cp = Number(magnitude);
  if ((cp >= 0x7f && cp <= 0x9f) || (cp >= 0xd800 && cp <= 0xdfff)) return null;
  return {
    char: String.fromCodePoint(cp),
    label: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
  };
}
