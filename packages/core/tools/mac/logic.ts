import { macBytes } from './detect';

export { looksLikeMac, macBytes } from './detect';

const hex2 = (b: number) => b.toString(16).padStart(2, '0');

export function formats(bytes: number[]) {
  const h = bytes.map(hex2);
  return {
    colon: h.join(':'),
    colonUpper: h.join(':').toUpperCase(),
    hyphen: h.join('-').toUpperCase(),
    cisco: [h[0]! + h[1]!, h[2]! + h[3]!, h[4]! + h[5]!].join('.'),
    bare: h.join(''),
  };
}

export interface MacInfo {
  /** Bit I/G: el primer byte impar es una dirección de grupo. */
  multicast: boolean;
  /** Bit U/L: administrada localmente (aleatoria en móviles, VMs, contenedores). */
  local: boolean;
  broadcast: boolean;
  zero: boolean;
}

export function info(bytes: number[]): MacInfo {
  return {
    multicast: (bytes[0]! & 1) === 1,
    local: (bytes[0]! & 2) === 2,
    broadcast: bytes.every((b) => b === 0xff),
    zero: bytes.every((b) => b === 0),
  };
}

/** EUI-64 modificado (RFC 4291): FFFE en el medio y el bit U/L invertido. */
export function eui64(bytes: number[]): string {
  const b = [bytes[0]! ^ 2, bytes[1]!, bytes[2]!, 0xff, 0xfe, bytes[3]!, bytes[4]!, bytes[5]!];
  return b.map(hex2).join(':');
}

/** Dirección IPv6 link-local que SLAAC deriva de la MAC (sin extensiones de privacidad). */
export function linkLocal(bytes: number[]): string {
  const b = [bytes[0]! ^ 2, bytes[1]!, bytes[2]!, 0xff, 0xfe, bytes[3]!, bytes[4]!, bytes[5]!];
  const groups = [0, 2, 4, 6].map((i) => ((b[i]! << 8) | b[i + 1]!).toString(16));
  return `fe80::${groups.join(':')}`;
}

export type OuiTable = Map<string, string>;

/** Lee el texto de virtual:oui («PREFIJO<TAB>Fabricante» por línea). */
export function parseOui(text: string): OuiTable {
  const map: OuiTable = new Map();
  for (const line of text.split('\n')) {
    const tab = line.indexOf('\t');
    if (tab > 0) map.set(line.slice(0, tab).toUpperCase(), line.slice(tab + 1));
  }
  return map;
}

/** Fabricante por el prefijo más largo: MA-S (36 bits), MA-M (28) y MA-L (24). */
export function vendor(bytes: number[], table: OuiTable): string | null {
  const hex = bytes.map(hex2).join('').toUpperCase();
  return (
    table.get(hex.slice(0, 9)) ?? table.get(hex.slice(0, 7)) ?? table.get(hex.slice(0, 6)) ?? null
  );
}

export class MacError extends Error {
  constructor() {
    super('invalid');
    this.name = 'MacError';
  }
}

export function parseMac(input: string): number[] {
  const bytes = macBytes(input);
  if (!bytes) throw new MacError();
  return bytes;
}
