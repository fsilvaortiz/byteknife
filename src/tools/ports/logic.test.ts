import { describe, expect, it } from 'vitest';
import { isRisky, looksLikePort, PORTS, rangeOf, searchPorts } from './logic';

describe('datos', () => {
  it('ordenados y sin duplicados', () => {
    const ports = PORTS.map((p) => p.port);
    expect(ports).toEqual([...ports].sort((a, b) => a - b));
    expect(new Set(ports).size).toBe(ports.length);
  });
});

describe('rangeOf', () => {
  it.each([
    [22, 'wellKnown'],
    [1023, 'wellKnown'],
    [1024, 'registered'],
    [49151, 'registered'],
    [49152, 'dynamic'],
    [65535, 'dynamic'],
    [65536, 'invalid'],
    [-1, 'invalid'],
    [1.5, 'invalid'],
  ])('%s → %s', (n, r) => {
    expect(rangeOf(n)).toBe(r);
  });
});

describe('searchPorts', () => {
  it('por número exacto o prefijo corto', () => {
    expect(searchPorts('5432').map((p) => p.service)).toEqual(['PostgreSQL']);
    expect(searchPorts(':443').map((p) => p.port)).toEqual([443]);
    expect(searchPorts('puerto 22').map((p) => p.port)).toEqual([22]);
    expect(searchPorts('99').map((p) => p.port)).toEqual([990, 993, 995]);
    expect(searchPorts('12345')).toEqual([]);
  });

  it('por nombre, categoría o etiqueta traducida', () => {
    expect(searchPorts('redis').map((p) => p.port)).toEqual([6379]);
    expect(searchPorts('mail').map((p) => p.port)).toEqual([25, 110, 143, 465, 587, 993, 995]);
    expect(searchPorts('correo', (p) => (p.category === 'mail' ? 'Correo' : '')).length).toBe(7);
    expect(searchPorts('')).toHaveLength(PORTS.length);
  });

  it('isRisky', () => {
    expect(isRisky(PORTS.find((p) => p.port === 6379)!)).toBe(true);
    expect(isRisky(PORTS.find((p) => p.port === 443)!)).toBe(false);
  });
});

describe('looksLikePort', () => {
  it.each(['puerto 5432', 'port 22', ':8080', 'porta 3306'])('sí: %s', (s) => {
    expect(looksLikePort(s)).toBe(true);
  });
  it.each(['5432', 'puerto 70000', 'hola'])('no: %s', (s) => {
    expect(looksLikePort(s)).toBe(false);
  });
});
