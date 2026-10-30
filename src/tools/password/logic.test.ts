import { describe, expect, it } from 'vitest';
import type { RandomFill } from '../uuid/logic';
import {
  charGroups,
  CHARSETS,
  entropyBits,
  generatePassword,
  PasswordError,
  randomInt,
  strength,
  type PasswordOptions,
} from './logic';

/** Devuelve los uint32 dados en orden (big-endian), en ciclo. */
const sequence = (values: number[]): RandomFill => {
  let i = 0;
  return (b) => new DataView(b.buffer).setUint32(0, values[i++ % values.length]!);
};

const all: PasswordOptions = {
  length: 24,
  sets: ['upper', 'lower', 'digits', 'symbols'],
  avoidAmbiguous: false,
};

describe('randomInt', () => {
  it('rechaza los valores del tramo final para no sesgar', () => {
    // Con n = 3, el límite es 4294967295: ese valor se descarta y se usa el siguiente.
    expect(randomInt(3, sequence([0xffffffff, 4]))).toBe(1);
  });

  it('cubre todo el rango de forma pareja', () => {
    const counts = new Array(10).fill(0);
    for (let i = 0; i < 10_000; i++) counts[randomInt(10)]++;
    for (const c of counts) expect(c).toBeGreaterThan(800);
  });
});

describe('generatePassword', () => {
  it('respeta el largo y usa solo los grupos elegidos', () => {
    const p = generatePassword({ ...all, length: 40, sets: ['digits'] });
    expect(p).toMatch(/^\d{40}$/);
  });

  it('incluye al menos un carácter de cada grupo', () => {
    for (let i = 0; i < 50; i++) {
      const p = generatePassword({ ...all, length: 8 });
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
      expect(p).toMatch(/[^A-Za-z\d]/);
    }
  });

  it('con un generador que nunca cubre los grupos, los fuerza igual', () => {
    const p = generatePassword({ ...all, length: 6 }, sequence([0]));
    expect(p).toHaveLength(6);
    for (const g of charGroups(all)) expect([...p].some((c) => g.includes(c))).toBe(true);
  });

  it('largo menor que la cantidad de grupos no se cuelga', () => {
    expect(generatePassword({ ...all, length: 2 })).toHaveLength(2);
  });

  it('evita caracteres ambiguos', () => {
    for (let i = 0; i < 20; i++) {
      expect(generatePassword({ ...all, length: 128, avoidAmbiguous: true })).not.toMatch(
        /[Il1O0]/,
      );
    }
  });

  it('sin grupos lanza PasswordError', () => {
    expect(() => generatePassword({ ...all, sets: [] })).toThrow(PasswordError);
  });
});

describe('entropía y fuerza', () => {
  it('calcula bits según el tamaño del conjunto', () => {
    expect(entropyBits({ ...all, length: 10, sets: ['digits'] })).toBeCloseTo(33.22, 2);
    const pool = Object.values(CHARSETS).join('').length;
    expect(entropyBits(all)).toBeCloseTo(24 * Math.log2(pool), 6);
    expect(entropyBits({ ...all, sets: [] })).toBe(0);
  });

  it('los ambiguos reducen el conjunto', () => {
    expect(charGroups({ sets: ['digits'], avoidAmbiguous: true })).toEqual(['23456789']);
  });

  it.each([
    [0, 'weak'],
    [49.9, 'weak'],
    [50, 'fair'],
    [80, 'strong'],
    [128, 'excellent'],
  ] as const)('%d bits → %s', (bits, s) => {
    expect(strength(bits)).toBe(s);
  });
});
