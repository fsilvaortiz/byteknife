import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { bytesToHex, utf8Bytes } from '../../ui/format';
import { ALGORITHMS, formatDigest, hashAll, md5 } from './logic';

const nodeHash = (alg: string, b: Uint8Array) =>
  createHash(alg.replace('-', '').toLowerCase()).update(b).digest('hex');

describe('md5', () => {
  it.each([
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['The quick brown fox jumps over the lazy dog', '9e107d9d372bb6826bd81d3542a419d6'],
  ])('vector RFC 1321 «%s»', (s, hex) => {
    expect(bytesToHex(md5(utf8Bytes(s)))).toBe(hex);
  });

  // 55, 56 y 64 bytes cruzan el borde donde el relleno necesita un bloque extra.
  it.each([55, 56, 63, 64, 65, 119, 120, 1000])('coincide con node:crypto para %i bytes', (n) => {
    const b = Uint8Array.from({ length: n }, (_, i) => (i * 31 + 7) & 0xff);
    expect(bytesToHex(md5(b))).toBe(nodeHash('md5', b));
  });

  it('texto UTF-8 multibyte', () => {
    const b = utf8Bytes('Ñandú 🚀');
    expect(bytesToHex(md5(b))).toBe(nodeHash('md5', b));
  });
});

describe('hashAll', () => {
  it('calcula los cinco algoritmos', async () => {
    const b = utf8Bytes('abc');
    const d = await hashAll(b);
    expect(Object.keys(d)).toEqual([...ALGORITHMS]);
    for (const alg of ALGORITHMS) expect(bytesToHex(d[alg])).toBe(nodeHash(alg, b));
    expect(bytesToHex(d['SHA-256'])).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('entrada vacía', async () => {
    expect(bytesToHex((await hashAll(new Uint8Array()))['SHA-1'])).toBe(
      'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    );
  });
});

describe('formatDigest', () => {
  const b = new Uint8Array([0xab, 0xff, 0x01]);

  it('hex en minúsculas o mayúsculas', () => {
    expect(formatDigest(b, 'hex', false)).toBe('abff01');
    expect(formatDigest(b, 'hex', true)).toBe('ABFF01');
  });

  it('Base64 ignora mayúsculas', () => {
    expect(formatDigest(b, 'b64', true)).toBe('q/8B');
  });
});
