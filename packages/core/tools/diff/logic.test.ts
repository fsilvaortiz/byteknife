import { describe, expect, it } from 'vitest';
import { DiffError, diffLines, MAX_CELLS, toLines } from './logic';

const A =
  'server:\n  port: 8080\n  timeout: 30s\ndatabase:\n  host: db.interno\n  pool: 10\nlogging:\n  level: info';
const B =
  'server:\n  port: 8443\n  timeout: 30s\n  tls: true\ndatabase:\n  host: db.interno\n  pool: 25\nlogging:\n  level: info';

const ws = { ignoreTrailingWs: true };
const exact = { ignoreTrailingWs: false };
const compact = (r: ReturnType<typeof diffLines>) =>
  r.rows.map((x) => `${x.type === 'eq' ? ' ' : x.type === 'add' ? '+' : '-'}${x.text}`);

describe('diffLines', () => {
  it('el ejemplo del prototipo', () => {
    const r = diffLines(A, B, ws);
    expect(r).toMatchObject({ added: 3, removed: 2 });
    expect(compact(r)).toEqual([
      ' server:',
      '+  port: 8443',
      '-  port: 8080',
      '   timeout: 30s',
      '+  tls: true',
      ' database:',
      '   host: db.interno',
      '+  pool: 25',
      '-  pool: 10',
      ' logging:',
      '   level: info',
    ]);
  });

  it('numera líneas de cada lado', () => {
    const r = diffLines('a\nb\nc', 'a\nc\nd', exact);
    expect(r.rows).toEqual([
      { type: 'eq', text: 'a', aLine: 1, bLine: 1 },
      { type: 'del', text: 'b', aLine: 2, bLine: null },
      { type: 'eq', text: 'c', aLine: 3, bLine: 2 },
      { type: 'add', text: 'd', aLine: null, bLine: 3 },
    ]);
  });

  it('textos iguales no tienen cambios', () => {
    expect(diffLines(A, A, exact)).toMatchObject({ added: 0, removed: 0 });
  });

  it('uno vacío: todo agregado o todo eliminado', () => {
    expect(diffLines('', 'x\ny', exact)).toMatchObject({ added: 2, removed: 0 });
    expect(diffLines('x', '', exact)).toMatchObject({ added: 0, removed: 1 });
    expect(diffLines('', '', exact).rows).toEqual([]);
  });

  it('CRLF y LF son iguales', () => {
    expect(diffLines('a\r\nb\r\n', 'a\nb\n', exact)).toMatchObject({ added: 0, removed: 0 });
  });

  it('espacios al final cuentan solo si no se ignoran', () => {
    expect(diffLines('a  \nb', 'a\nb', ws)).toMatchObject({ added: 0, removed: 0 });
    expect(diffLines('a  \nb', 'a\nb', exact)).toMatchObject({ added: 1, removed: 1 });
  });

  it('archivo largo con un cambio no topa con el límite gracias al recorte', () => {
    const big = Array.from({ length: 10_000 }, (_, i) => `línea ${i}`);
    const changed = [...big];
    changed[5000] = 'cambiada';
    const r = diffLines(big.join('\n'), changed.join('\n'), exact);
    expect(r).toMatchObject({ added: 1, removed: 1 });
    expect(r.rows).toHaveLength(10_001);
    expect(r.rows.at(-1)).toEqual({ type: 'eq', text: 'línea 9999', aLine: 10_000, bLine: 10_000 });
  });

  it('lanza DiffError si la parte distinta es demasiado grande', () => {
    const side = (p: string) => Array.from({ length: 2500 }, (_, i) => `${p}${i}`).join('\n');
    expect(() => diffLines(side('a'), side('b'), exact)).toThrow(DiffError);
    try {
      diffLines(side('a'), side('b'), exact);
    } catch (e) {
      expect((e as DiffError).params['lines']).toBe(Math.floor(Math.sqrt(MAX_CELLS)));
    }
  });
});

describe('toLines', () => {
  it('vacío es cero líneas y un salto final deja una línea vacía', () => {
    expect(toLines('')).toEqual([]);
    expect(toLines('a\n')).toEqual(['a', '']);
    expect(toLines('a\rb')).toEqual(['a', 'b']);
  });
});
