import { describe, expect, it } from 'vitest';
import {
  HEADERS,
  headerInfo,
  isStatusCode,
  searchHeaders,
  searchStatuses,
  STATUSES,
  statusClass,
} from './logic';

describe('datos', () => {
  it('códigos únicos, ordenados y con texto en los tres idiomas', () => {
    const codes = STATUSES.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual([...codes].sort((a, b) => a - b));
    for (const s of STATUSES)
      for (const l of ['es', 'en', 'pt'] as const) expect(s.text[l]).not.toBe('');
  });

  it('cabeceras únicas, ordenadas y con texto', () => {
    const names = HEADERS.map((h) => h.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual([...names].sort());
    for (const h of HEADERS)
      for (const l of ['es', 'en', 'pt'] as const) expect(h.text[l]).not.toBe('');
  });
});

describe('statusClass', () => {
  it.each([
    [101, 'info'],
    [204, 'success'],
    [308, 'redirect'],
    [429, 'client'],
    [503, 'server'],
    [999, 'server'],
  ])('%i → %s', (code, c) => {
    expect(statusClass(code)).toBe(c);
  });
});

describe('búsqueda', () => {
  it('por código y prefijo', () => {
    expect(searchStatuses('404', 'es').map((s) => s.code)).toEqual([404]);
    expect(searchStatuses('30', 'es').map((s) => s.code)).toEqual([
      300, 301, 302, 303, 304, 307, 308,
    ]);
    expect(searchStatuses('', 'es')).toHaveLength(STATUSES.length);
  });

  it('por nombre o descripción, sin acentos', () => {
    expect(searchStatuses('teapot', 'en').map((s) => s.code)).toEqual([418]);
    expect(searchStatuses('redireccion permanente', 'es').map((s) => s.code)).toEqual([301, 308]);
    expect(searchStatuses('limite de taxa', 'pt').map((s) => s.code)).toEqual([429]);
  });

  it('cabeceras', () => {
    expect(searchHeaders('cors origin', 'en').map((h) => h.name)).toEqual([
      'Access-Control-Allow-Origin',
      'Origin',
    ]);
    expect(searchHeaders('', 'es')).toHaveLength(HEADERS.length);
    expect(headerInfo('content-type')?.name).toBe('Content-Type');
    expect(headerInfo('x-nada')).toBeUndefined();
  });
});

describe('isStatusCode', () => {
  it.each(['200', '404', '503'])('sí: %s', (s) => expect(isStatusCode(s)).toBe(true));
  it.each(['755', '999', '40', '4040', 'abc'])('no: %s', (s) =>
    expect(isStatusCode(s)).toBe(false),
  );
});
