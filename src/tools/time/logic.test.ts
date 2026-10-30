import { describe, expect, it } from 'vitest';
import { DEFAULT_ZONES, formats, isTimestamp, localZone, parseTime, zoneRows } from './logic';

const now = new Date('2026-10-30T12:00:00Z');
const iso = (raw: string) => parseTime(raw, now)?.date.toISOString();

describe('parseTime', () => {
  it.each([
    ['1793318400', 's', '2026-10-30T00:00:00.000Z'],
    ['1793318400000', 'ms', '2026-10-30T00:00:00.000Z'],
    ['1793318400000000', 'us', '2026-10-30T00:00:00.000Z'],
    ['1793318400000000000', 'ns', '2026-10-30T00:00:00.000Z'],
    ['1793318400.5', 's', '2026-10-30T00:00:00.500Z'],
    ['-86400', 's', '1969-12-31T00:00:00.000Z'],
    ['0', 's', '1970-01-01T00:00:00.000Z'],
    ['2026-10-29T12:00:00Z', 'date', '2026-10-29T12:00:00.000Z'],
    ['2026-10-29T12:00:00-03:00', 'date', '2026-10-29T15:00:00.000Z'],
    ['Thu, 29 Oct 2026 00:00:00 GMT', 'date', '2026-10-29T00:00:00.000Z'],
  ])('%s → %s', (raw, unit, expected) => {
    const r = parseTime(raw, now);
    expect(r?.unit).toBe(unit);
    expect(r?.date.toISOString()).toBe(expected);
    expect(r?.zoneless).toBe(false);
  });

  it.each(['', '  ', 'now', 'AHORA', 'agora'])('«%s» es ahora', (raw) => {
    expect(parseTime(raw, now)).toEqual({ date: now, unit: 'now', zoneless: false });
  });

  it('marca las fechas con hora sin zona', () => {
    expect(parseTime('2026-10-29T12:00', now)?.zoneless).toBe(true);
    expect(parseTime('2026-10-29 12:00:30.5', now)?.zoneless).toBe(true);
    // Solo fecha: la especificación la lee en UTC.
    expect(parseTime('2026-10-29', now)).toMatchObject({ zoneless: false });
    expect(iso('2026-10-29')).toBe('2026-10-29T00:00:00.000Z');
  });

  it.each(['mañana', '2026-13-45', '99999999999999999999999'])('null con %s', (raw) => {
    expect(parseTime(raw, now)).toBeNull();
  });

  it('null fuera del rango de Date', () => {
    // 22 dígitos se leen como ns: 9e15 ms supera el máximo de Date (8.64e15).
    expect(parseTime('9000000000000000000000', now)).toBeNull();
    expect(parseTime('8000000000000000000000', now)).not.toBeNull();
  });
});

describe('formats', () => {
  const date = new Date('2026-10-30T00:00:00.500Z');
  const map = Object.fromEntries(formats(date, now, 'en'));

  it('Unix, ISO y RFC 7231', () => {
    expect(map).toMatchObject({
      unixS: '1793318400',
      unixMs: '1793318400500',
      iso: '2026-10-30T00:00:00.500Z',
      rfc7231: 'Fri, 30 Oct 2026 00:00:00 GMT',
      isoWeek: '2026-W44',
    });
  });

  it('relativo e idioma', () => {
    expect(map['relative']).toBe('12 hours ago');
    expect(Object.fromEntries(formats(date, now, 'es'))['relative']).toBe('hace 12 horas');
  });

  it('Unix en segundos redondea hacia abajo antes de 1970', () => {
    expect(Object.fromEntries(formats(new Date(-1500), now, 'en'))['unixS']).toBe('-2');
  });

  it('local y día del año tienen valor', () => {
    expect(map['local']).toMatch(/2026/);
    expect(Number(map['dayOfYear'])).toBeGreaterThanOrEqual(301);
  });
});

describe('zoneRows', () => {
  const date = new Date('2026-07-01T12:00:00Z');

  it('da la hora y el offset de cada zona', () => {
    const rows = zoneRows(date, ['UTC', 'America/Santiago', 'Asia/Kolkata'], 'en');
    expect(rows.map((r) => r.offset)).toEqual(['GMT', 'GMT-4', 'GMT+5:30']);
    expect(rows[2]!.text).toMatch(/5:30/);
  });

  it('omite zonas desconocidas y repetidas', () => {
    expect(zoneRows(date, ['UTC', 'Marte/Olympus', 'UTC'], 'es')).toHaveLength(1);
  });

  it('las zonas por defecto existen y la local se conoce', () => {
    expect(zoneRows(date, DEFAULT_ZONES, 'pt')).toHaveLength(DEFAULT_ZONES.length);
    expect(localZone()).toBeTruthy();
  });
});

describe('isTimestamp', () => {
  it.each([
    ['1793318400', true],
    ['1793318400000', true],
    ['2026-10-30', true],
    ['2026-10-30T12:00:00Z', true],
    ['179331840', false],
    ['2026-13-45', false],
    ['hola', false],
  ])('%s → %s', (s, r) => {
    expect(isTimestamp(s)).toBe(r);
  });
});
