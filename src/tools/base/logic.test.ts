import { describe, expect, it } from 'vitest';
import {
  BaseError,
  bitInfo,
  codePointInfo,
  group,
  isNumberLiteral,
  parseInteger,
  representations,
  type InputBase,
} from './logic';

const p = (s: string, base: InputBase = 'auto') => parseInteger(s, base);

describe('parseInteger', () => {
  it.each([
    ['0xCAFE_F00D', 'auto', 3405705229n, false],
    ['0b1010', 'auto', 10n, false],
    ['0o777', 'auto', 511n, false],
    ['  1 000 000 ', 'auto', 1_000_000n, false],
    ['-0x1F', 'auto', 31n, true],
    ['ff', 16, 255n, false],
    ['0xff', 16, 255n, false],
    ['0101', 2, 5n, false],
    ['0010', 10, 10n, false],
    ['-0', 10, 0n, true],
  ] as const)('%s (base %s)', (s, base, magnitude, negative) => {
    expect(p(s, base)).toEqual({ magnitude, negative });
  });

  it('números de cientos de dígitos', () => {
    const big = '9'.repeat(300);
    expect(p(big)?.magnitude.toString()).toBe(big);
  });

  it('vacío o solo signo es null', () => {
    expect(p('')).toBeNull();
    expect(p(' - ')).toBeNull();
  });

  it.each([
    ['12', 2],
    ['8', 8],
    ['ff', 10],
    ['0x', 'auto'],
    ['0x1', 2],
    ['1.5', 'auto'],
    ['12g', 16],
  ] as const)('lanza BaseError con %s en base %s', (s, base) => {
    expect(() => p(s, base)).toThrow(BaseError);
  });
});

describe('representations', () => {
  it('agrupa y deja el valor crudo con prefijo', () => {
    expect(representations(p('0xCAFE_F00D')!, '.')).toEqual([
      { id: 'dec', raw: '3405705229', shown: '3.405.705.229' },
      { id: 'hex', raw: '0xCAFEF00D', shown: 'CAFE F00D' },
      {
        id: 'bin',
        raw: '0b11001010111111101111000000001101',
        shown: '1100 1010 1111 1110 1111 0000 0000 1101',
      },
      { id: 'oct', raw: '0o31277570015', shown: '31277570015' },
    ]);
  });

  it('negativos y -0', () => {
    expect(representations(p('-255')!, ',')[1]).toEqual({ id: 'hex', raw: '-0xFF', shown: '-FF' });
    expect(representations(p('-0')!, ',')[0]!.raw).toBe('0');
  });

  it('group', () => {
    expect(group('1234567', 3, ',')).toBe('1,234,567');
    expect(group('123', 3, ',')).toBe('123');
  });
});

describe('bitInfo y codePointInfo', () => {
  it.each([
    [0n, 1, 1],
    [255n, 8, 1],
    [256n, 9, 2],
  ])('%s → %i bits, %i bytes', (n, bits, bytes) => {
    expect(bitInfo(n)).toEqual({ bits, bytes });
  });

  it('carácter imprimible', () => {
    expect(codePointInfo(p('0x1F680')!)).toEqual({ char: '🚀', label: 'U+1F680' });
    expect(codePointInfo(p('65')!)).toEqual({ char: 'A', label: 'U+0041' });
  });

  it.each(['31', '0x7F', '0x9F', '0xD800', '0xDFFF', '0x110000', '-65'])(
    'sin carácter: %s',
    (s) => {
      expect(codePointInfo(p(s)!)).toBeNull();
    },
  );
});

describe('isNumberLiteral', () => {
  it.each([
    ['0xCAFE', true],
    ['0b101', true],
    ['0o17', true],
    ['123', false],
    ['0x', false],
  ])('%s → %s', (s, r) => {
    expect(isNumberLiteral(s)).toBe(r);
  });
});
