import { describe, expect, it } from 'vitest';
import { draftOf, validate } from './logic';

const SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  required: ['id', 'email'],
  properties: {
    id: { type: 'integer', minimum: 1 },
    email: { type: 'string', format: 'email' },
    tags: { type: 'array', items: { type: 'string' } },
    'a/b': { type: 'boolean' },
  },
  additionalProperties: false,
};

describe('validate', () => {
  it('un documento válido no tiene errores', async () => {
    expect(
      await validate(SCHEMA, { id: 1, email: 'ana@ejemplo.dev', tags: ['x'] }, '2020-12'),
    ).toEqual([]);
  });

  it('errores en hojas, sin resúmenes ni «adicionales» falsos', async () => {
    const errors = await validate(
      SCHEMA,
      { id: 0, email: 'no', tags: [1], extra: true, 'a/b': 1 },
      '2020-12',
    );
    expect(errors.map((e) => [e.path, e.keyword])).toEqual([
      ['/id', 'minimum'],
      ['/email', 'format'],
      ['/tags/0', 'type'],
      ['/a~1b', 'type'],
      ['', 'additionalProperties'],
    ]);
    expect(errors[0]).toEqual({
      path: '/id',
      keyword: 'minimum',
      schemaPath: '/properties/id/minimum',
      message: '0 is less than 1.',
    });
    expect(errors.at(-1)!.message).toContain('"extra"');
  });

  it('required en la raíz', async () => {
    const errors = await validate(SCHEMA, {}, '2020-12');
    expect(errors.map((e) => e.keyword)).toEqual(['required', 'required']);
  });

  it('draft 7 y esquemas sin properties', async () => {
    const s7 = { type: 'array', items: { type: 'number' }, additionalProperties: false };
    expect((await validate(s7, ['a'], '7')).map((e) => e.path)).toEqual(['/0']);
    expect(
      (await validate({ additionalProperties: false }, { x: 1 }, '2020-12')).map((e) => e.keyword),
    ).toEqual(['additionalProperties']);
  });
});

describe('draftOf', () => {
  it.each([
    [{ $schema: 'https://json-schema.org/draft/2019-09/schema' }, '2019-09'],
    [{ $schema: 'http://json-schema.org/draft-07/schema#' }, '7'],
    [{ $schema: 'http://json-schema.org/draft-04/schema#' }, '4'],
    [{}, '2020-12'],
    [true, '2020-12'],
    [null, '2020-12'],
  ])('%j → %s', (s, d) => {
    expect(draftOf(s)).toBe(d);
  });
});
