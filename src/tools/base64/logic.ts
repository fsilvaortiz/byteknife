import { bytesToBase64, bytesToHex, toBase64Url, utf8Bytes } from '../../ui/format';

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

/** Codifica texto como UTF-8 en Base64 estándar o URL-safe (sin + / =). */
export function encodeText(text: string, urlSafe: boolean): string {
  const b64 = bytesToBase64(utf8Bytes(text));
  return urlSafe ? toBase64Url(b64) : b64;
}

export const HEX_PREVIEW_BYTES = 512;

export type Decoded =
  | { kind: 'text'; text: string; bytes: number }
  | { kind: 'binary'; hex: string; bytes: number; truncated: boolean };

/** Decodifica; si los bytes no son UTF-8 válido devuelve una vista hex de 16 bytes por línea. */
export function decodeBase64(input: string): Decoded {
  const bytes = base64ToBytes(input);
  try {
    return {
      kind: 'text',
      text: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
      bytes: bytes.length,
    };
  } catch {
    const head = bytes.subarray(0, HEX_PREVIEW_BYTES);
    const lines: string[] = [];
    for (let i = 0; i < head.length; i += 16) {
      lines.push(bytesToHex(head.subarray(i, i + 16)).replace(/(..)(?!$)/g, '$1 '));
    }
    return {
      kind: 'binary',
      hex: lines.join('\n'),
      bytes: bytes.length,
      truncated: bytes.length > HEX_PREVIEW_BYTES,
    };
  }
}
