import { describe, expect, it } from 'vitest';
import { dayOfYear, isoUtc, isoWeek, unixSeconds } from './now';

describe('isoWeek', () => {
  it.each([
    ['2026-10-30T12:00:00Z', 2026, 44],
    ['2021-01-03T12:00:00Z', 2020, 53],
    ['2024-12-30T12:00:00Z', 2025, 1],
    ['2026-01-01T12:00:00Z', 2026, 1],
  ])('%s → %i-W%i', (iso, year, week) => {
    expect(isoWeek(new Date(iso))).toEqual([year, week]);
  });
});

describe('dayOfYear', () => {
  it('1 de enero es el día 1 y 31 de diciembre de año bisiesto el 366', () => {
    expect(dayOfYear(new Date(2026, 0, 1, 12))).toBe(1);
    expect(dayOfYear(new Date(2024, 11, 31, 12))).toBe(366);
  });
});

describe('formatos', () => {
  const d = new Date('2026-10-30T12:34:56.789Z');
  it('unixSeconds trunca a segundos', () => expect(unixSeconds(d)).toBe(1793363696));
  it('isoUtc quita los milisegundos', () => expect(isoUtc(d)).toBe('2026-10-30T12:34:56Z'));
});
