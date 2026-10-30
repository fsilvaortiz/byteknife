/** Decodifica Base64 estándar o URL-safe, con o sin relleno. Lanza error si no es válido. */
export function base64ToBytes(input: string): Uint8Array {
  let s = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const PRINTABLE = /^[\t\n\r\x20-\x7e\u00a0-\uffff]*$/;

/** Detección: parece Base64 y al decodificarlo da texto UTF-8 legible. */
export function isBase64Text(s: string): boolean {
  if (s.length < 12 || s.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return false;
  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(s));
    return PRINTABLE.test(decoded);
  } catch {
    return false;
  }
}
