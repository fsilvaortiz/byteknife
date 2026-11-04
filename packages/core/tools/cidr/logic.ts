import { parseIPv4, parseIPv6 } from './detect';

export { isIpOrCidr, parseIPv4, parseIPv6 } from './detect';

export type Family = 4 | 6;

export const BITS: Record<Family, number> = { 4: 32, 6: 128 };

export interface Network {
  family: Family;
  /** La dirección tal como se escribió (puede no ser la de red). */
  address: bigint;
  prefix: number;
}

export type Parsed =
  ({ kind: 'cidr' } & Network) | { kind: 'range'; family: Family; start: bigint; end: bigint };

export type CidrErrorCode = 'invalid' | 'prefix' | 'mask' | 'mixed' | 'order';

export class CidrError extends Error {
  constructor(readonly code: CidrErrorCode) {
    super(code);
    this.name = 'CidrError';
  }
}

function parseAddress(s: string): { family: Family; value: bigint } {
  const v4 = parseIPv4(s);
  if (v4 !== null) return { family: 4, value: v4 };
  const v6 = parseIPv6(s);
  if (v6 !== null) return { family: 6, value: v6 };
  throw new CidrError('invalid');
}

/** Largo del prefijo de una máscara como 255.255.240.0; error si los unos no son contiguos. */
export function maskToPrefix(mask: bigint, family: Family): number {
  const bits = BITS[family];
  const ones = mask.toString(2).replace(/^0+/, '');
  if (mask !== 0n && (ones.length !== bits || /01/.test(ones))) throw new CidrError('mask');
  return ones.replace(/0+$/, '').length;
}

function isMask(s: string): boolean {
  const v = parseIPv4(s);
  return v !== null && v >= 0x80000000n && /^1+0*$/.test(v.toString(2));
}

/**
 * Acepta 10.0.0.0/8, 192.168.1.10/255.255.255.0, una dirección sola (prefijo completo),
 * «192.168.1.0 255.255.255.0», 2001:db8::/32 y rangos «inicio - fin».
 */
export function parseInput(input: string): Parsed {
  let s = input.trim();
  // «192.168.1.0 255.255.255.0» (máscara separada por espacio, como en Cisco) → con barra.
  const spaced = s.match(/^(\S+)\s+(\S+)$/);
  if (spaced && !s.includes('/') && isMask(spaced[2]!)) s = `${spaced[1]}/${spaced[2]}`;
  const range = s.split(/\s*(?:-|–|\s)\s*/).filter(Boolean);
  if (range.length === 2 && !s.includes('/')) {
    const a = parseAddress(range[0]!);
    const b = parseAddress(range[1]!);
    if (a.family !== b.family) throw new CidrError('mixed');
    if (a.value > b.value) throw new CidrError('order');
    return { kind: 'range', family: a.family, start: a.value, end: b.value };
  }
  const [addr, suffix, extra] = s.split('/');
  if (extra !== undefined || !addr) throw new CidrError('invalid');
  const { family, value } = parseAddress(addr);
  if (suffix === undefined) return { kind: 'cidr', family, address: value, prefix: BITS[family] };
  if (/^\d{1,3}$/.test(suffix)) {
    const prefix = Number(suffix);
    if (prefix > BITS[family]) throw new CidrError('prefix');
    return { kind: 'cidr', family, address: value, prefix };
  }
  const mask = family === 4 ? parseIPv4(suffix) : null;
  if (mask === null) throw new CidrError('prefix');
  return { kind: 'cidr', family, address: value, prefix: maskToPrefix(mask, family) };
}

export const maskOf = (prefix: number, family: Family): bigint => {
  const bits = BigInt(BITS[family]);
  return ((1n << BigInt(prefix)) - 1n) << (bits - BigInt(prefix));
};

const allOnes = (family: Family) => (1n << BigInt(BITS[family])) - 1n;

export interface NetworkInfo {
  network: bigint;
  last: bigint;
  mask: bigint;
  wildcard: bigint;
  firstHost: bigint;
  lastHost: bigint;
  total: bigint;
  usable: bigint;
}

export function networkInfo({ family, address, prefix }: Network): NetworkInfo {
  const mask = maskOf(prefix, family);
  const wildcard = allOnes(family) ^ mask;
  const network = address & mask;
  const last = network | wildcard;
  const total = wildcard + 1n;
  // En IPv4 la red y el broadcast no se asignan, salvo en /31 (RFC 3021) y /32.
  const reserves = family === 4 && prefix < 31;
  return {
    network,
    last,
    mask,
    wildcard,
    firstHost: reserves ? network + 1n : network,
    lastHost: reserves ? last - 1n : last,
    total,
    usable: reserves ? total - 2n : total,
  };
}

export function formatIPv4(v: bigint): string {
  return [24n, 16n, 8n, 0n].map((s) => String((v >> s) & 0xffn)).join('.');
}

/** Forma canónica de RFC 5952: minúsculas y «::» en la racha de ceros más larga (≥ 2). */
export function formatIPv6(v: bigint): string {
  const words = Array.from({ length: 8 }, (_, i) => Number((v >> BigInt(112 - i * 16)) & 0xffffn));
  let best = { at: -1, len: 1 };
  for (let i = 0; i < 8;) {
    let j = i;
    while (j < 8 && words[j] === 0) j++;
    if (j - i > best.len) best = { at: i, len: j - i };
    i = j === i ? i + 1 : j;
  }
  const hex = words.map((w) => w.toString(16));
  if (best.at < 0) return hex.join(':');
  const left = hex.slice(0, best.at).join(':');
  const right = hex.slice(best.at + best.len).join(':');
  return `${left}::${right}`;
}

export const formatIp = (v: bigint, family: Family) =>
  family === 4 ? formatIPv4(v) : formatIPv6(v);

export const formatCidr = (v: bigint, prefix: number, family: Family) =>
  `${formatIp(v, family)}/${prefix}`;

/** IPv6 con los 8 grupos de 4 dígitos, sin abreviar. */
export function expandIPv6(v: bigint): string {
  return v.toString(16).padStart(32, '0').match(/.{4}/g)!.join(':');
}

export function binary(v: bigint, family: Family): string {
  const bits = v.toString(2).padStart(BITS[family], '0');
  return family === 4 ? bits.match(/.{8}/g)!.join('.') : bits.match(/.{16}/g)!.join(':');
}

export function reverseDns(v: bigint, family: Family): string {
  if (family === 4) return `${formatIPv4(v).split('.').reverse().join('.')}.in-addr.arpa`;
  return `${v.toString(16).padStart(32, '0').split('').reverse().join('.')}.ip6.arpa`;
}

export type AddressType =
  | 'public'
  | 'private'
  | 'loopback'
  | 'linkLocal'
  | 'multicast'
  | 'cgnat'
  | 'documentation'
  | 'benchmark'
  | 'unspecified'
  | 'broadcast'
  | 'reserved'
  | 'thisNetwork'
  | 'ipv4Mapped'
  | 'nat64'
  | 'uniqueLocal'
  | 'sixToFour'
  | 'teredo';

type Block = [cidr: string, type: AddressType];

// Más específicos primero: gana el primero que contiene la dirección.
const V4_BLOCKS: Block[] = [
  ['255.255.255.255/32', 'broadcast'],
  ['0.0.0.0/32', 'unspecified'],
  ['0.0.0.0/8', 'thisNetwork'],
  ['10.0.0.0/8', 'private'],
  ['100.64.0.0/10', 'cgnat'],
  ['127.0.0.0/8', 'loopback'],
  ['169.254.0.0/16', 'linkLocal'],
  ['172.16.0.0/12', 'private'],
  ['192.0.2.0/24', 'documentation'],
  ['192.168.0.0/16', 'private'],
  ['198.18.0.0/15', 'benchmark'],
  ['198.51.100.0/24', 'documentation'],
  ['203.0.113.0/24', 'documentation'],
  ['224.0.0.0/4', 'multicast'],
  ['240.0.0.0/4', 'reserved'],
];

const V6_BLOCKS: Block[] = [
  ['::/128', 'unspecified'],
  ['::1/128', 'loopback'],
  ['::ffff:0:0/96', 'ipv4Mapped'],
  ['64:ff9b::/96', 'nat64'],
  ['2001::/32', 'teredo'],
  ['2001:db8::/32', 'documentation'],
  ['2002::/16', 'sixToFour'],
  ['2000::/3', 'public'],
  ['fc00::/7', 'uniqueLocal'],
  ['fe80::/10', 'linkLocal'],
  ['ff00::/8', 'multicast'],
];

const compiled = (blocks: Block[]) =>
  blocks.map(([cidr, type]) => {
    const p = parseInput(cidr) as Network;
    return { mask: maskOf(p.prefix, p.family), net: p.address, type };
  });

let tables: Record<Family, ReturnType<typeof compiled>> | undefined;

export function addressType(v: bigint, family: Family): AddressType {
  tables ??= { 4: compiled(V4_BLOCKS), 6: compiled(V6_BLOCKS) };
  const hit = tables[family].find((b) => (v & b.mask) === b.net);
  return hit?.type ?? (family === 4 ? 'public' : 'reserved');
}

export interface Subnet {
  network: bigint;
  last: bigint;
}

/** Divide la red en subredes de `newPrefix`; devuelve como máximo `limit`. */
export function subnets(net: Network, newPrefix: number, limit = 256): Subnet[] {
  const { network } = networkInfo(net);
  if (newPrefix < net.prefix || newPrefix > BITS[net.family]) return [];
  const size = 1n << BigInt(BITS[net.family] - newPrefix);
  const count = 1n << BigInt(newPrefix - net.prefix);
  const n = count < BigInt(limit) ? Number(count) : limit;
  return Array.from({ length: n }, (_, i) => {
    const start = network + BigInt(i) * size;
    return { network: start, last: start + size - 1n };
  });
}

export const subnetCount = (net: Network, newPrefix: number): bigint =>
  1n << BigInt(newPrefix - net.prefix);

/** Lista mínima de bloques CIDR que cubre exactamente el rango [start, end]. */
export function rangeToCidrs(start: bigint, end: bigint, family: Family): Network[] {
  const bits = BITS[family];
  const out: Network[] = [];
  let cur = start;
  while (cur <= end) {
    // El bloque más grande alineado en `cur` que no se pasa de `end`.
    let size = 0;
    while (size < bits && (cur & ((1n << BigInt(size + 1)) - 1n)) === 0n) {
      if (cur + (1n << BigInt(size + 1)) - 1n > end) break;
      size++;
    }
    out.push({ family, address: cur, prefix: bits - size });
    cur += 1n << BigInt(size);
  }
  return out;
}

/** Dirección IPv4 dentro de IPv6 (::ffff:a.b.c.d) y la inversa, si aplica. */
export function mappedPeer(v: bigint, family: Family): string | null {
  if (family === 4) return `::ffff:${formatIPv4(v)}`;
  if (v >> 32n === 0xffffn) return formatIPv4(v & 0xffffffffn);
  return null;
}

/** Cantidad con separador de miles; las enormes de IPv6 como potencia de 2. */
export function formatCount(n: bigint, group: string): string {
  if (n > 10n ** 15n) return `2^${n.toString(2).length - 1}`;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, group);
}
