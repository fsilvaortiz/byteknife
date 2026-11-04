import { cryptoRandom, type RandomFill } from '../uuid/logic';

export const CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
} as const;

export type Charset = keyof typeof CHARSETS;

export interface PasswordOptions {
  length: number;
  sets: Charset[];
  /** Quita caracteres que se confunden al leer: I l 1 O 0. */
  avoidAmbiguous: boolean;
}

export class PasswordError extends Error {
  constructor(readonly code: 'noSets') {
    super(code);
    this.name = 'PasswordError';
  }
}

/** Entero uniforme en [0, n) por muestreo con rechazo: sin sesgo de módulo. */
export function randomInt(n: number, random: RandomFill = cryptoRandom): number {
  const limit = Math.floor(2 ** 32 / n) * n;
  const buf = new Uint8Array(4);
  for (;;) {
    random(buf);
    const x = new DataView(buf.buffer).getUint32(0);
    if (x < limit) return x % n;
  }
}

export function charGroups(opts: Pick<PasswordOptions, 'sets' | 'avoidAmbiguous'>): string[] {
  return opts.sets
    .map((k) => (opts.avoidAmbiguous ? CHARSETS[k].replace(/[Il1O0]/g, '') : CHARSETS[k]))
    .filter(Boolean);
}

const MAX_ATTEMPTS = 100;

/**
 * Contraseña con al menos un carácter de cada grupo elegido. Se reintenta hasta cumplirlo
 * para no sesgar la distribución; si no se logra, se fuerza y se mezcla (Fisher–Yates).
 */
export function generatePassword(opts: PasswordOptions, random: RandomFill = cryptoRandom): string {
  const groups = charGroups(opts);
  if (!groups.length) throw new PasswordError('noSets');
  const pool = groups.join('');
  const pick = (s: string) => s[randomInt(s.length, random)]!;
  const covers = (p: string[]) => groups.every((g) => p.some((c) => g.includes(c)));
  let chars: string[] = [];
  for (let t = 0; t < MAX_ATTEMPTS; t++) {
    chars = Array.from({ length: opts.length }, () => pick(pool));
    if (opts.length < groups.length || covers(chars)) return chars.join('');
  }
  groups.forEach((g, i) => (chars[i] = pick(g)));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
}

export function entropyBits(opts: PasswordOptions): number {
  const size = charGroups(opts).join('').length;
  return size ? opts.length * Math.log2(size) : 0;
}

export type Strength = 'weak' | 'fair' | 'strong' | 'excellent';

export const strength = (bits: number): Strength =>
  bits < 50 ? 'weak' : bits < 80 ? 'fair' : bits < 128 ? 'strong' : 'excellent';
