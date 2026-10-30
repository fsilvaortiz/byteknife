import { describe, expect, it } from 'vitest';
import { bytesToBase64, bytesToHex, fmtBytes, toBase64Url, utf8Bytes } from './format';

describe('fmtBytes', () => {
  it.each([
    [0, '0 B'],
    [1023, '1023 B'],
    [1536, '1.5 KB'],
    [2 * 1048576, '2.00 MB'],
  ])('%i → %s', (n, s) => {
    expect(fmtBytes(n)).toBe(s);
  });
});

describe('bytes', () => {
  it('hex', () => {
    expect(bytesToHex(new Uint8Array([0, 15, 255]))).toBe('000fff');
  });

  it('base64 de UTF-8 y su variante URL-safe', () => {
    expect(bytesToBase64(utf8Bytes('¿?>'))).toBe('wr8/Pg==');
    expect(toBase64Url('wr8/Pg==')).toBe('wr8_Pg');
  });

  it('base64 de entradas mayores que un bloque', () => {
    const big = new Uint8Array(0x8000 * 2 + 3).fill(65);
    expect(atob(bytesToBase64(big))).toHaveLength(big.length);
  });
});
