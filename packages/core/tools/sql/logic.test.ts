import { describe, expect, it } from 'vitest';
import { countStatements, formatSql, looksLikeSql, parseError, type SqlOptions } from './logic';

const base: SqlOptions = { dialect: 'postgresql', keywordCase: 'upper', indent: 2 };

describe('formatSql', () => {
  it('formatea y pasa palabras clave a mayúsculas', async () => {
    const r = await formatSql(
      'select id, nombre from usuarios where activo = true order by id',
      base,
    );
    expect(r).toEqual({
      ok: true,
      output: 'SELECT\n  id,\n  nombre\nFROM\n  usuarios\nWHERE\n  activo = TRUE\nORDER BY\n  id',
      statements: 1,
    });
  });

  it('minúsculas, sangría de 4 y varias sentencias', async () => {
    const r = await formatSql('SELECT 1; SELECT 2;', { ...base, keywordCase: 'lower', indent: 4 });
    expect(r).toMatchObject({
      ok: true,
      output: 'select\n    1;\n\nselect\n    2;',
      statements: 2,
    });
  });

  it('preserva mayúsculas si se pide', async () => {
    const r = await formatSql('Select a From t', { ...base, keywordCase: 'preserve' });
    expect(r.ok && r.output).toBe('Select\n  a\nFrom\n  t');
  });

  it('error con línea y columna', async () => {
    const r = await formatSql("select a from t where x = 'abc", { ...base, dialect: 'sql' });
    expect(r).toMatchObject({ ok: false, line: 1, column: 27 });
    if (!r.ok) expect(r.detail).toBe('Unexpected "\'abc"');
  });
});

describe('parseError', () => {
  it('sin posición', () => {
    expect(parseError(new Error('algo raro'))).toEqual({
      ok: false,
      detail: 'algo raro',
      line: null,
      column: null,
    });
    expect(parseError('texto').detail).toBe('texto');
  });

  it('con «Parse error at token»', () => {
    expect(parseError(new Error('Parse error at token: «EOF» at line 1 column 17\nmás'))).toEqual({
      ok: false,
      detail: 'at token: «EOF»',
      line: 1,
      column: 17,
    });
  });
});

describe('countStatements', () => {
  it.each([
    ['', 0],
    ['SELECT\n  1', 1],
    ['SELECT\n  1;', 1],
    ['SELECT\n  1;\n\nSELECT\n  2', 2],
  ])('%j → %i', (s, n) => {
    expect(countStatements(s)).toBe(n);
  });
});

describe('looksLikeSql', () => {
  it.each([
    'SELECT * FROM t',
    '  select a\nfrom b',
    'WITH x AS (SELECT 1) SELECT * FROM x',
    'insert into t values (1)',
    'UPDATE t SET a = 1',
    'delete from t',
    'CREATE TABLE t (id int)',
    'create or replace view v as select 1',
    'ALTER TABLE t ADD c int',
    'DROP INDEX i',
  ])('sí: %s', (s) => {
    expect(looksLikeSql(s)).toBe(true);
  });

  it.each(['select', 'Selecciona un archivo', 'update me', 'hola mundo', '{"select": 1}'])(
    'no: %s',
    (s) => {
      expect(looksLikeSql(s)).toBe(false);
    },
  );
});
