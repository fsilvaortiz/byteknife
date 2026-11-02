import { bytesToHex } from '../../ui/format';
import { normalizeUuid, UUID_RE } from './detect';
export { isUuid, normalizeUuid } from './detect';

/** Llena el arreglo con bytes aleatorios. Se inyecta para poder probar sin azar. */
export type RandomFill = (bytes: Uint8Array<ArrayBuffer>) => void;

export const cryptoRandom: RandomFill = (b) => {
  crypto.getRandomValues(b);
};

export const MAX_BATCH = 500;

const hyphenate = (h: string) =>
  `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

export function uuidV4(random: RandomFill = cryptoRandom): string {
  const b = new Uint8Array(16);
  random(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  return hyphenate(bytesToHex(b));
}

/** Estado entre llamadas: último milisegundo usado y contador de 12 bits (rand_a). */
export interface V7State {
  ms: number;
  counter: number;
}

/**
 * UUID v7 monótono (RFC 9562 §6.2, método 1): si el reloj no avanzó desde el anterior,
 * incrementa el contador; si se desborda, adelanta el milisegundo. Así un lote queda ordenado.
 */
export function uuidV7(
  now: number,
  random: RandomFill = cryptoRandom,
  prev?: V7State,
): { uuid: string; state: V7State } {
  const b = new Uint8Array(16);
  random(b);
  let ms = now;
  // Contador inicial aleatorio con el bit alto en 0, para dejar margen antes de desbordar.
  let counter = ((b[6]! & 0x07) << 8) | b[7]!;
  if (prev && ms <= prev.ms) {
    ms = prev.ms;
    counter = prev.counter + 1;
    if (counter > 0xfff) {
      ms++;
      counter = 0;
    }
  }
  for (let i = 0; i < 6; i++) b[i] = Math.floor(ms / 2 ** (8 * (5 - i))) % 256;
  b[6] = 0x70 | (counter >> 8);
  b[7] = counter & 0xff;
  b[8] = (b[8]! & 0x3f) | 0x80;
  return { uuid: hyphenate(bytesToHex(b)), state: { ms, counter } };
}

export interface GenerateOptions {
  version: 'v4' | 'v7';
  upper: boolean;
  noHyphens: boolean;
}

export const clampCount = (n: number) =>
  Number.isFinite(n) ? Math.min(MAX_BATCH, Math.max(1, Math.floor(n))) : 1;

export function generateUuids(
  n: number,
  opts: GenerateOptions,
  now: number = Date.now(),
  random: RandomFill = cryptoRandom,
): string[] {
  let state: V7State | undefined;
  return Array.from({ length: clampCount(n) }, () => {
    let u: string;
    if (opts.version === 'v7') {
      const r = uuidV7(now, random, state);
      state = r.state;
      u = r.uuid;
    } else u = uuidV4(random);
    if (opts.noHyphens) u = u.replace(/-/g, '');
    return opts.upper ? u.toUpperCase() : u;
  });
}

export type Variant = 'ncs' | 'rfc' | 'microsoft' | 'reserved';

export interface UuidInfo {
  /** null para Nil y Max, que no tienen versión. */
  version: number | null;
  special: 'nil' | 'max' | null;
  variant: Variant;
  canonical: string;
  /** Fecha embebida en v1, v6 y v7. */
  date: Date | null;
}

// Diferencia entre el inicio del calendario gregoriano (1582-10-15) y 1970, en ms.
const GREGORIAN_OFFSET_MS = 12_219_292_800_000;

const gregorianToDate = (ticks: bigint) => new Date(Number(ticks / 10_000n) - GREGORIAN_OFFSET_MS);

export function inspectUuid(raw: string): UuidInfo | null {
  const s = normalizeUuid(raw);
  if (!UUID_RE.test(s)) return null;
  const h = s.replace(/-/g, '').toLowerCase();
  const special = /^0+$/.test(h) ? 'nil' : /^f+$/.test(h) ? 'max' : null;
  const version = special ? null : parseInt(h[12]!, 16);
  const vb = parseInt(h[16]!, 16);
  const variant: Variant = vb >= 14 ? 'reserved' : vb >= 12 ? 'microsoft' : vb >= 8 ? 'rfc' : 'ncs';
  const hex = (a: number, b: number) => BigInt(`0x${h.slice(a, b)}`);
  let date: Date | null = null;
  if (version === 7) date = new Date(parseInt(h.slice(0, 12), 16));
  else if (version === 1)
    date = gregorianToDate((hex(13, 16) << 48n) | (hex(8, 12) << 32n) | hex(0, 8));
  else if (version === 6)
    date = gregorianToDate((hex(0, 8) << 28n) | (hex(8, 12) << 12n) | hex(13, 16));
  return { version, special, variant, canonical: hyphenate(h), date };
}
