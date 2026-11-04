import { describe, expect, it } from 'vitest';
import {
  clampCount,
  generateUuids,
  inspectUuid,
  isUuid,
  MAX_BATCH,
  normalizeUuid,
  uuidV4,
  uuidV7,
  type RandomFill,
} from './logic';

/** Generador fijo: todos los bytes con el mismo valor. */
const fill =
  (v: number): RandomFill =>
  (b) => {
    b.fill(v);
  };

const MS = Date.UTC(2026, 9, 30, 12, 0, 0);

describe('uuidV4', () => {
  it('fija versión y variante', () => {
    expect(uuidV4(fill(0xff))).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
    expect(uuidV4(fill(0))).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('usa crypto por defecto', () => {
    expect(inspectUuid(uuidV4())?.version).toBe(4);
  });
});

describe('uuidV7', () => {
  it('codifica el milisegundo en los primeros 48 bits', () => {
    const { uuid } = uuidV7(MS, fill(0));
    expect(inspectUuid(uuid)).toMatchObject({ version: 7, variant: 'rfc' });
    expect(inspectUuid(uuid)?.date?.getTime()).toBe(MS);
  });

  it('incrementa el contador dentro del mismo milisegundo', () => {
    const a = uuidV7(MS, fill(0));
    const b = uuidV7(MS, fill(0), a.state);
    expect(b.state).toEqual({ ms: MS, counter: a.state.counter + 1 });
    expect(b.uuid > a.uuid).toBe(true);
  });

  it('no retrocede si el reloj va hacia atrás', () => {
    const a = uuidV7(MS, fill(0));
    expect(uuidV7(MS - 5, fill(0), a.state).state.ms).toBe(MS);
  });

  it('al desbordar el contador adelanta el milisegundo', () => {
    const r = uuidV7(MS, fill(0), { ms: MS, counter: 0xfff });
    expect(r.state).toEqual({ ms: MS + 1, counter: 0 });
  });

  it('milisegundo nuevo reinicia con contador aleatorio de 11 bits', () => {
    const r = uuidV7(MS + 1, fill(0xff), { ms: MS, counter: 5 });
    expect(r.state).toEqual({ ms: MS + 1, counter: 0x7ff });
  });
});

describe('generateUuids', () => {
  it('un lote de v7 en el mismo milisegundo queda ordenado y sin repetidos', () => {
    const ids = generateUuids(50, { version: 'v7', upper: false, noHyphens: false }, MS);
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(50);
  });

  it('aplica mayúsculas y quita guiones', () => {
    const [u] = generateUuids(1, { version: 'v4', upper: true, noHyphens: true }, MS, fill(0xab));
    expect(u).toBe('ABABABAB' + 'ABAB' + '4BAB' + 'ABAB' + 'ABABABABABAB');
  });

  it.each([
    [0, 1],
    [-3, 1],
    [NaN, 1],
    [7.9, 7],
    [10_000, MAX_BATCH],
  ])('acota la cantidad %d → %d', (n, expected) => {
    expect(clampCount(n)).toBe(expected);
  });
});

describe('inspectUuid', () => {
  it('lee la fecha de un v1', () => {
    // RFC 9562, apéndices A.1, A.5 y A.6: los tres ejemplos son del 2022-02-22 19:22:22 UTC
    const info = inspectUuid('C232AB00-9414-11EC-B3C8-9F6BDECED846');
    expect(info).toMatchObject({ version: 1, variant: 'rfc' });
    expect(info?.date?.toISOString()).toBe('2022-02-22T19:22:22.000Z');
  });

  it('lee la fecha de un v6', () => {
    const info = inspectUuid('1EC9414C-232A-6B00-B3C8-9F6BDECED846');
    expect(info?.version).toBe(6);
    expect(info?.date?.toISOString()).toBe('2022-02-22T19:22:22.000Z');
  });

  it('lee la fecha del ejemplo de v7 de la RFC', () => {
    const info = inspectUuid('017F22E2-79B0-7CC3-98C4-DC0C0C07398F');
    expect(info?.date?.toISOString()).toBe('2022-02-22T19:22:22.000Z');
  });

  it('v4 no tiene fecha', () => {
    expect(inspectUuid('919108f7-52d1-4320-9bac-f847db4148a8')).toMatchObject({
      version: 4,
      date: null,
    });
  });

  it('Nil y Max', () => {
    expect(inspectUuid('00000000-0000-0000-0000-000000000000')).toMatchObject({
      special: 'nil',
      version: null,
      variant: 'ncs',
    });
    expect(inspectUuid('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF')).toMatchObject({
      special: 'max',
      variant: 'reserved',
    });
  });

  it.each([
    ['0', 'ncs'],
    ['a', 'rfc'],
    ['c', 'microsoft'],
    ['e', 'reserved'],
  ])('variante con nibble %s → %s', (nibble, variant) => {
    expect(inspectUuid(`00000000-0000-4000-${nibble}000-000000000001`)?.variant).toBe(variant);
  });

  it('acepta sin guiones, con llaves y con urn:uuid:, y devuelve la forma canónica', () => {
    const canonical = '919108f7-52d1-4320-9bac-f847db4148a8';
    for (const s of [
      '919108F752D143209BACF847DB4148A8',
      '{919108f7-52d1-4320-9bac-f847db4148a8}',
      ' urn:uuid:919108f7-52d1-4320-9bac-f847db4148a8 ',
    ]) {
      expect(inspectUuid(s)?.canonical).toBe(canonical);
    }
  });

  it('null si no es un UUID', () => {
    expect(inspectUuid('919108f7-52d1-4320-9bac')).toBeNull();
    expect(inspectUuid('zz9108f7-52d1-4320-9bac-f847db4148a8')).toBeNull();
  });
});

describe('isUuid y normalizeUuid', () => {
  it('detecta', () => {
    expect(isUuid('0192b5a4-3c1e-7d2f-9a8b-6c5d4e3f2a1b')).toBe(true);
    expect(isUuid('{0192b5a4-3c1e-7d2f-9a8b-6c5d4e3f2a1b}')).toBe(true);
    expect(isUuid('hola')).toBe(false);
  });

  it('normaliza', () => {
    expect(normalizeUuid('URN:UUID:abc')).toBe('abc');
  });
});
