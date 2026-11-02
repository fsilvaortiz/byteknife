import { describe, expect, it } from 'vitest';
import { canonical, diffJson, parseSide, preview, summary, type Json } from './logic';

const ordered = { ignoreOrder: false };
const unordered = { ignoreOrder: true };

describe('diffJson', () => {
  it('iguales → sin cambios, aunque cambie el orden de las claves', () => {
    expect(diffJson({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 }, ordered)).toEqual([]);
  });

  it('agregados, quitados y cambiados con su ruta', () => {
    const a: Json = { id: 1, nombre: 'Ana', plan: 'free', tags: ['a'], 'clave rara': true };
    const b: Json = { id: 1, nombre: 'Ana P.', tags: ['a', 'b'], 'clave rara': false, nuevo: null };
    expect(diffJson(a, b, ordered)).toEqual([
      { path: '$.nombre', kind: 'changed', before: 'Ana', after: 'Ana P.' },
      { path: '$.plan', kind: 'removed', before: 'free' },
      { path: '$.tags[1]', kind: 'added', after: 'b' },
      { path: '$["clave rara"]', kind: 'changed', before: true, after: false },
      { path: '$.nuevo', kind: 'added', after: null },
    ]);
  });

  it('elementos quitados al final de un arreglo', () => {
    expect(diffJson([1, 2, 3], [1], ordered)).toEqual([
      { path: '$[1]', kind: 'removed', before: 2 },
      { path: '$[2]', kind: 'removed', before: 3 },
    ]);
  });

  it('cambio de tipo y de raíz', () => {
    expect(diffJson({ a: [1] }, { a: { 0: 1 } }, ordered)).toEqual([
      { path: '$.a', kind: 'changed', before: [1], after: { 0: 1 } },
    ]);
    expect(diffJson(1, '1', ordered)).toEqual([
      { path: '$', kind: 'changed', before: 1, after: '1' },
    ]);
  });

  it('sin orden: solo cuenta lo que falta o sobra', () => {
    expect(diffJson([3, 1, 2], [1, 2, 3], unordered)).toEqual([]);
    expect(diffJson([{ a: 1 }, { b: 2 }], [{ b: 2 }, { a: 1 }], unordered)).toEqual([]);
    expect(diffJson([1, 1, 2], [2, 1, 4], unordered)).toEqual([
      { path: '$[1]', kind: 'removed', before: 1 },
      { path: '$[2]', kind: 'added', after: 4 },
    ]);
  });

  it('sin orden también en arreglos anidados', () => {
    expect(diffJson({ x: { y: [1, 2] } }, { x: { y: [2, 1] } }, unordered)).toEqual([]);
  });
});

describe('utilidades', () => {
  it('canonical ordena claves', () => {
    expect(canonical({ b: 1, a: [true, null, { d: 'x', c: 2 }] })).toBe(
      '{"a":[true,null,{"c":2,"d":"x"}],"b":1}',
    );
  });

  it('parseSide con error y BOM', () => {
    expect(parseSide('﻿{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
    const r = parseSide('{"a":}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.line).toBe(1);
  });

  it('preview recorta', () => {
    expect(preview(undefined)).toBe('');
    expect(preview({ a: 'x' })).toBe('{"a":"x"}');
    expect(preview('x'.repeat(200), 10)).toBe('"xxxxxxxx…');
  });

  it('summary cuenta por tipo', () => {
    expect(
      summary([
        { path: '$.a', kind: 'added', after: 1 },
        { path: '$.b', kind: 'added', after: 1 },
        { path: '$.c', kind: 'changed', before: 1, after: 2 },
      ]),
    ).toEqual({ added: 2, removed: 0, changed: 1 });
  });
});
