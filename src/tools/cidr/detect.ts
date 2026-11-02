// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

const V4_OCTET = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const V4 = `${V4_OCTET}(?:\\.${V4_OCTET}){3}`;
const RE_V4 = new RegExp(`^${V4}$`);

export function parseIPv4(s: string): bigint | null {
  if (!RE_V4.test(s)) return null;
  return s.split('.').reduce((acc, o) => (acc << 8n) | BigInt(o), 0n);
}

/** IPv6 con «::» y, opcionalmente, IPv4 embebida al final (::ffff:192.0.2.1). */
export function parseIPv6(input: string): bigint | null {
  if (!/^[0-9a-f:.]+$/i.test(input)) return null;
  // La IPv4 final se reescribe como dos grupos hex: ::ffff:192.0.2.1 → ::ffff:c000:201.
  const v4 = input.match(new RegExp(`:(${V4})$`));
  const n = v4 ? parseIPv4(v4[1]!)! : 0n;
  const s = v4
    ? `${input.slice(0, -v4[1]!.length)}${(n >> 16n).toString(16)}:${(n & 0xffffn).toString(16)}`
    : input;
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const groups = (part: string) => (part === '' ? [] : part.split(':'));
  const left = groups(halves[0]!);
  const right = halves.length === 2 ? groups(halves[1]!) : [];
  const all = [...left, ...right];
  if (!all.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
  if (halves.length === 2 ? all.length > 7 : all.length !== 8) return null;
  const words = [...left, ...Array<string>(8 - all.length).fill('0'), ...right];
  return words.reduce((acc, g) => (acc << 16n) | BigInt(parseInt(g, 16)), 0n);
}

/** Dirección IPv4 o IPv6, con o sin /prefijo. */
export function isIpOrCidr(input: string): boolean {
  const [addr, prefix, extra] = input.trim().split('/');
  if (extra !== undefined || !addr) return false;
  if (prefix !== undefined && !/^\d{1,3}$/.test(prefix)) return false;
  if (parseIPv4(addr) !== null) return prefix === undefined || Number(prefix) <= 32;
  if (parseIPv6(addr) !== null) return prefix === undefined || Number(prefix) <= 128;
  return false;
}
