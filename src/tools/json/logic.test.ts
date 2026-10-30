import { describe, expect, it } from 'vitest';
import {
  countNodes,
  depth,
  detectJson,
  formatJson,
  parseErrorPosition,
  positionAt,
  sortKeys,
} from './logic';

describe('formatJson', () => {
  const src = '{"b":1,"a":[true,null,{"c":"x"}]}';

  it('formatea con 2 espacios por defecto', () => {
    const r = formatJson(src, 'fmt');
    expect(r.ok && r.output).toBe(
      '{\n  "b": 1,\n  "a": [\n    true,\n    null,\n    {\n      "c": "x"\n    }\n  ]\n}',
    );
  });

  it('formatea con tab y con 4 espacios', () => {
    const tab = formatJson('{"a":1}', 'fmt', '\t');
    expect(tab.ok && tab.output).toBe('{\n\t"a": 1\n}');
    const four = formatJson('{"a":1}', 'fmt', 4);
    expect(four.ok && four.output).toBe('{\n    "a": 1\n}');
  });

  it('minifica', () => {
    const r = formatJson('{ "a" : [ 1 , 2 ] }', 'min');
    expect(r).toMatchObject({ ok: true, output: '{"a":[1,2]}', bytes: 11 });
  });

  it('ordena claves en todos los niveles', () => {
    const r = formatJson('{"z":{"y":1,"b":2},"a":[{"d":1,"c":2}]}', 'sort');
    expect(r.ok && r.output.replace(/\s/g, '')).toBe('{"a":[{"c":2,"d":1}],"z":{"b":2,"y":1}}');
  });

  it('cuenta nodos y profundidad', () => {
    expect(formatJson(src, 'fmt')).toMatchObject({ nodes: 6, depth: 3 });
  });

  it('acepta escalares en la raíz', () => {
    expect(formatJson('42', 'fmt')).toMatchObject({ ok: true, output: '42', nodes: 0, depth: 0 });
    expect(formatJson('"x"', 'min')).toMatchObject({ ok: true, output: '"x"' });
  });

  it('ignora el BOM inicial', () => {
    expect(formatJson('﻿{"a":1}', 'min')).toMatchObject({ ok: true, output: '{"a":1}' });
  });

  it('cuenta bytes en UTF-8', () => {
    expect(formatJson('"ñ"', 'min')).toMatchObject({ bytes: 4 });
  });

  it('reporta línea y columna del error', () => {
    const r = formatJson('{\n  "a": 1,\n  "b" 2\n}', 'fmt');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatchObject({ line: 3, column: 7 });
  });

  it('un JSON cortado apunta al final', () => {
    const r = formatJson('[1,\n2,', 'fmt');
    expect(!r.ok && r.error).toMatchObject({ line: 2, column: 3 });
  });

  it('entrada vacía es error', () => {
    expect(formatJson('   ', 'fmt').ok).toBe(false);
  });
});

describe('parseErrorPosition', () => {
  it('lee el formato de V8 con posición y línea', () => {
    const e = new SyntaxError(
      "Expected ':' after property name in JSON at position 6 (line 2 column 5)",
    );
    expect(parseErrorPosition(e, '{\n"a" 1}')).toEqual({
      detail: "Expected ':' after property name",
      line: 2,
      column: 5,
    });
  });

  it('lee el formato de Firefox', () => {
    const e = new SyntaxError(
      "JSON.parse: expected property name or '}' at line 3 column 2 of the JSON data",
    );
    expect(parseErrorPosition(e, '')).toEqual({
      detail: "expected property name or '}'",
      line: 3,
      column: 2,
    });
  });

  it('lee el formato antiguo de V8 solo con posición', () => {
    const e = new SyntaxError('Unexpected token } in JSON at position 8');
    expect(parseErrorPosition(e, '{"a":\n1,}')).toMatchObject({ line: 2, column: 3 });
  });

  it('acepta errores que no son Error', () => {
    expect(parseErrorPosition('raro', 'ab')).toEqual({ detail: 'raro', line: 1, column: 3 });
  });
});

describe('helpers', () => {
  it('sortKeys deja escalares intactos y ordena por código Unicode', () => {
    expect(sortKeys(3)).toBe(3);
    expect(Object.keys(sortKeys({ ñ: 1, z: 2, a: 3 }) as object)).toEqual(['a', 'z', 'ñ']);
  });

  it('depth de contenedores vacíos es 1', () => {
    expect(depth([])).toBe(1);
    expect(depth({ a: [] })).toBe(2);
    expect(depth(null)).toBe(0);
  });

  it('countNodes suma hijos de todos los niveles', () => {
    expect(countNodes({ a: { b: [1, 2] } })).toBe(4);
  });

  it('positionAt cuenta desde 1', () => {
    expect(positionAt('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
  });
});

describe('detectJson', () => {
  it.each([
    ['{"a":1}', 'valid'],
    ['[1,2]', 'valid'],
    ['{a:1}', 'invalid'],
    ['hola', null],
    ['42', null],
  ] as const)('%s → %s', (s, r) => {
    expect(detectJson(s)).toBe(r);
  });
});
