import { describe, expect, it } from 'vitest';
import { castCell, CsvError, csvCell, csvToJson, jsonToCsv, parseCsv } from './logic';

describe('csvCell', () => {
  it.each([
    [null, ''],
    [undefined, ''],
    [42, '42'],
    ['simple', 'simple'],
    ['a,b', '"a,b"'],
    ['di "hola"', '"di ""hola"""'],
    ['dos\nlíneas', '"dos\nlíneas"'],
    [{ a: 1 }, '"{""a"":1}"'],
  ])('%j → %s', (v, s) => {
    expect(csvCell(v, ',')).toBe(s);
  });

  it('solo cita el delimitador activo', () => {
    expect(csvCell('a,b', ';')).toBe('a,b');
    expect(csvCell('a;b', ';')).toBe('"a;b"');
  });
});

describe('jsonToCsv', () => {
  it('convierte un arreglo de objetos', () => {
    expect(jsonToCsv('[{"id":1,"n":"Ana"},{"id":2,"n":"Bruno, D"}]', ',')).toEqual({
      ok: true,
      csv: 'id,n\n1,Ana\n2,"Bruno, D"',
      rows: 2,
      cols: 2,
    });
  });

  it('un objeto suelto es una fila', () => {
    expect(jsonToCsv('{"a":1}', ',')).toMatchObject({ csv: 'a\n1', rows: 1 });
  });

  it('une claves heterogéneas y deja vacías las que faltan', () => {
    expect(jsonToCsv('[{"a":1},{"b":2}]', ';')).toMatchObject({ csv: 'a;b\n1;\n;2', cols: 2 });
  });

  it('serializa valores anidados como JSON', () => {
    expect(jsonToCsv('[{"t":["x","y"]}]', ',')).toMatchObject({ csv: 't\n"[""x"",""y""]"' });
  });

  it('arreglos de escalares van en la columna value', () => {
    expect(jsonToCsv('[1,"dos",null]', ',')).toMatchObject({ csv: 'value\n1\ndos\n' });
  });

  it('mezcla de objetos y escalares', () => {
    expect(jsonToCsv('[{"a":1},2]', ',')).toMatchObject({ csv: 'a,value\n1,\n,2' });
  });

  it('usa tabulador', () => {
    expect(jsonToCsv('[{"a":1,"b":2}]', '\t')).toMatchObject({ csv: 'a\tb\n1\t2' });
  });

  it('reporta errores de JSON con posición', () => {
    const r = jsonToCsv('[{"a":1},]', ',');
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.line).toBe(1);
  });
});

describe('parseCsv', () => {
  it('maneja comillas, comillas escapadas y saltos dentro de celdas', () => {
    expect(parseCsv('a,b\n"x, y","di ""hola""\nfin"', ',')).toEqual([
      ['a', 'b'],
      ['x, y', 'di "hola"\nfin'],
    ]);
  });

  it('acepta CRLF y última fila sin salto', () => {
    expect(parseCsv('a,b\r\n1,2\r\n3,4', ',')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('una línea que termina en delimitador tiene celda vacía final', () => {
    expect(parseCsv('a,\n', ',')).toEqual([['a', '']]);
  });

  it('lanza CsvError con la línea de la comilla sin cerrar', () => {
    try {
      parseCsv('a\n"abierta\nsigue', ',');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(CsvError);
      expect(e).toMatchObject({ code: 'unclosedQuote', params: { line: 2 } });
    }
  });
});

describe('castCell', () => {
  it.each([
    ['true', true],
    ['false', false],
    ['', null],
    ['42', 42],
    ['-3.5', -3.5],
    ['0', 0],
    ['007', '007'],
    ['-01', '-01'],
    ['1e3', '1e3'],
    ['texto', 'texto'],
  ] as const)('%s → %j', (s, v) => {
    expect(castCell(s)).toBe(v);
  });
});

describe('csvToJson', () => {
  const csv = 'id;nombre;activo\n1;Ana;true\n2;;false\n\n3';

  it('convierte con tipos y rellena filas cortas', () => {
    expect(csvToJson(csv, ';', true)).toEqual([
      { id: 1, nombre: 'Ana', activo: true },
      { id: 2, nombre: null, activo: false },
      { id: 3, nombre: null, activo: null },
    ]);
  });

  it('sin detección de tipos deja todo como texto', () => {
    expect(csvToJson(csv, ';', false)[0]).toEqual({ id: '1', nombre: 'Ana', activo: 'true' });
  });

  it('vacío o solo encabezado da arreglo vacío', () => {
    expect(csvToJson('', ',', true)).toEqual([]);
    expect(csvToJson('﻿a,b\n', ',', true)).toEqual([]);
  });
});
