import { describe as group, expect, it } from 'vitest';
import {
  declaredVersion,
  describe,
  operations,
  segments,
  semanticChecks,
  specVersion,
  structuralErrors,
  validateOpenApi,
  type RawError,
} from './logic';

const brief = (ps: { code: string; params: object; path: string[] }[]) =>
  ps.map((p) => [p.code, p.params, p.path.join(' > ')]);

group('declaredVersion y specVersion', () => {
  it.each([
    ['openapi: 3.1.0\ninfo: {}', '3.1'],
    ['{\n  "openapi": "3.0.3"', '3.0'],
    ["swagger: '2.0'", '2.0'],
    ['# comentario\nopenapi: 3.2.0', '3.2'],
    ['swagger: 3.0', null],
    ['openapi: 2.0', null],
    ['nombre: openapi', null],
  ])('%j → %s', (src, v) => {
    expect(declaredVersion(src)).toBe(v);
  });

  it.each([
    [{ openapi: '3.0.3' }, '3.0', '3.0.3'],
    [{ openapi: '3.1.1' }, '3.1', '3.1.1'],
    [{ openapi: '3.2.0' }, '3.2', '3.2.0'],
    [{ swagger: '2.0' }, '2.0', '2.0'],
  ])('%j', (doc, version, declared) => {
    expect(specVersion(doc)).toEqual({ version, declared });
  });

  it.each([[{ openapi: '4.0.0' }], [{ swagger: '1.2' }], [{}], [[]], [null], ['x']])(
    '%j no es una versión conocida',
    (doc) => {
      expect(specVersion(doc)).toBeNull();
    },
  );
});

group('segments', () => {
  it('decodifica el JSON Pointer de la librería', () => {
    expect(segments('#/paths/~1a%20b~1%7Bid%7D/get')).toEqual(['paths', '/a b/{id}', 'get']);
    expect(segments('#/x/~0y')).toEqual(['x', '~y']);
    expect(segments('#')).toEqual([]);
  });
});

group('describe', () => {
  const e = (keyword: string, error: string): RawError => ({
    keyword,
    error,
    keywordLocation: '#',
    instanceLocation: '#',
  });
  it.each([
    [
      'required',
      'Instance does not have required property "info".',
      'p.required',
      { name: 'info' },
    ],
    [
      'unevaluatedProperties',
      'Property "descripton" does not match unevaluated properties schema.',
      'p.unknown',
      { name: 'descripton' },
    ],
    [
      'enum',
      'Instance does not match any of ["query","path"].',
      'p.enum',
      { values: 'query, path' },
    ],
    ['const', 'Instance does not match "path".', 'p.const', { value: '"path"' }],
    [
      'type',
      'Instance type "string" is invalid. Expected "boolean".',
      'p.type',
      { actual: 'string', expected: 'boolean' },
    ],
    [
      'type',
      'Instance type "number" is invalid. Expected "object", "boolean".',
      'p.type',
      { actual: 'number', expected: 'object, boolean' },
    ],
    [
      'format',
      'String does not match format "uri-reference".',
      'p.format',
      { format: 'uri-reference' },
    ],
    ['pattern', 'String does not match pattern.', 'p.pattern', {}],
    [
      'minProperties',
      'Instance does not have at least 1 properties.',
      'p.minProperties',
      { min: '1' },
    ],
    ['minItems', 'Array has too few items (0 < 1).', 'p.minItems', { min: '1' }],
    ['uniqueItems', 'Duplicate items at indexes 0 and 1.', 'p.unique', {}],
    ['oneOf', 'Instance does not match exactly one subschema (2 matches).', 'p.oneOf', {}],
  ])('%s', (keyword, error, code, params) => {
    expect(describe(e(keyword, error))).toEqual({ code, params });
  });

  it('sin traducción conserva el texto original', () => {
    expect(describe(e('maxLength', 'String is too long (9 > 8).'))).toEqual({
      code: 'p.other',
      params: {},
      raw: 'String is too long (9 > 8).',
    });
    expect(describe(e('required', 'algo raro')).code).toBe('p.other');
  });
});

group('structuralErrors', () => {
  const codes = (errs: RawError[]) =>
    errs.map((e) => [e.keyword, segments(e.instanceLocation).join(' > ')]);

  it('3.1: errores en hojas, sin resúmenes ni ramas descartadas', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'x' },
      paths: {
        '/a': { get: { responses: { '200': { descripton: 'ok' } } } },
        '/b': { post: { parameters: [{ name: 'q', in: 'qury', schema: {} }], responses: {} } },
      },
    };
    expect(codes(await structuralErrors(doc, '3.1'))).toEqual([
      ['required', 'info'],
      ['required', 'paths > /a > get > responses > 200'],
      ['unevaluatedProperties', 'paths > /a > get > responses > 200'],
      ['enum', 'paths > /b > post > parameters > 0 > in'],
      ['minProperties', 'paths > /b > post > responses'],
    ]);
  });

  it('3.0: elige la rama de respuesta, no la de $ref', async () => {
    const doc = {
      openapi: '3.0.3',
      info: { title: 'x', version: '1' },
      paths: {
        '/a': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: { 'application/json': { schema: { type: 'object', nullable: 'sí' } } },
              },
            },
          },
        },
      },
    };
    expect(codes(await structuralErrors(doc, '3.0'))).toEqual([
      [
        'type',
        'paths > /a > get > responses > 200 > content > application/json > schema > nullable',
      ],
    ]);
  });

  it('3.0: un $ref con propiedades de más elige la rama de referencia', async () => {
    const doc = {
      openapi: '3.0.3',
      info: { title: 'x', version: '1' },
      paths: { '/a': { get: { responses: { '200': { $ref: 1 } } } } },
    };
    const errs = await structuralErrors(doc, '3.0');
    expect(codes(errs)).toEqual([['type', 'paths > /a > get > responses > 200 > $ref']]);
  });

  it('2.0: entre los tipos de parámetro elige el más cercano', async () => {
    const doc = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/a': {
          get: {
            parameters: [{ name: 'x', in: 'query', type: 'strin' }],
            responses: { '200': { description: 'ok' } },
          },
        },
      },
    };
    const errs = await structuralErrors(doc, '2.0');
    expect(codes(errs)).toEqual([['enum', 'paths > /a > get > parameters > 0 > type']]);
  });

  it('3.2 válido', async () => {
    const doc = {
      openapi: '3.2.0',
      info: { title: 'x', version: '1' },
      paths: { '/a': { query: { responses: { '200': { description: 'ok' } } } } },
    };
    expect(await structuralErrors(doc, '3.2')).toEqual([]);
  });
});

group('semanticChecks', () => {
  const base = { openapi: '3.1.0', info: { title: 'x', version: '1' } };

  it('$ref rotos, externos y esquemas sin usar', () => {
    const doc = {
      ...base,
      paths: {
        '/a': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Falta' },
                    example: { $ref: '#/no/se/sigue' },
                  },
                },
              },
              '404': { $ref: 'comunes.yaml#/Error' },
            },
          },
        },
      },
      components: {
        schemas: {
          Usado: { $ref: '#/components/schemas/a~1b/properties/x' },
          'a/b': { properties: { x: { $ref: '#ancla' } } },
          Suelto: { type: 'string' },
        },
      },
    };
    expect(brief(semanticChecks(doc, '3.1'))).toEqual([
      [
        's.refMissing',
        { ref: '#/components/schemas/Falta' },
        'paths > /a > get > responses > 200 > content > application/json > schema',
      ],
      ['s.refExternal', { ref: 'comunes.yaml#/Error' }, 'paths > /a > get > responses > 404'],
      ['s.unusedSchema', { name: 'Usado' }, 'components > schemas > Usado'],
      ['s.unusedSchema', { name: 'Suelto' }, 'components > schemas > Suelto'],
    ]);
  });

  it('parámetros de ruta, repetidos y rutas equivalentes', () => {
    const doc = {
      ...base,
      components: { parameters: { Id: { name: 'id', in: 'path', required: true } } },
      paths: {
        '/u/{id}': {
          parameters: [{ $ref: '#/components/parameters/Id' }],
          get: { responses: {} },
          put: { parameters: [{ name: 'x', in: 'path' }], responses: {} },
        },
        '/u/{nombre}': {
          get: {
            parameters: [
              { name: 'q', in: 'query' },
              { name: 'q', in: 'query' },
            ],
            responses: {},
          },
        },
        '/v': { $ref: '#/no/existe' },
        '/w': 'nada',
      },
    };
    expect(brief(semanticChecks(doc, '3.1'))).toEqual([
      ['s.refMissing', { ref: '#/no/existe' }, 'paths > /v'],
      ['s.samePath', { other: '/u/{id}' }, 'paths > /u/{nombre}'],
      ['s.pathParamExtra', { name: 'x' }, 'paths > /u/{id} > put'],
      ['s.dupParam', { name: 'q', in: 'query' }, 'paths > /u/{nombre} > get > parameters'],
      ['s.pathParamMissing', { name: 'nombre' }, 'paths > /u/{nombre} > get'],
    ]);
  });

  it('parámetros repetidos a nivel de ruta', () => {
    const doc = {
      ...base,
      paths: {
        '/a/{id}': {
          parameters: [
            { name: 'id', in: 'path' },
            { name: 'id', in: 'path' },
          ],
          get: { responses: {} },
        },
      },
    };
    expect(brief(semanticChecks(doc, '3.1'))).toEqual([
      ['s.dupParam', { name: 'id', in: 'path' }, 'paths > /a/{id} > parameters'],
    ]);
  });

  it('operationId repetidos y seguridad sin definir', () => {
    const doc = {
      ...base,
      security: [{ apiKey: [] }, 'x'],
      components: { securitySchemes: { apiKey: { type: 'apiKey', name: 'k', in: 'header' } } },
      paths: {
        '/a': { get: { operationId: 'listar', security: [{ oauth: [] }], responses: {} } },
        '/b': { get: { operationId: 'listar', responses: {} } },
      },
    };
    expect(brief(semanticChecks(doc, '3.1'))).toEqual([
      ['s.securityMissing', { name: 'oauth' }, 'paths > /a > get > security > 0'],
      ['s.dupOperationId', { id: 'listar', other: 'GET /a' }, 'paths > /b > get > operationId'],
    ]);
  });

  it('2.0: securityDefinitions y definitions', () => {
    const doc = {
      swagger: '2.0',
      security: [{ basic: [] }, { otro: [] }],
      securityDefinitions: { basic: { type: 'basic' } },
      paths: { '/a': { get: { responses: { '200': { schema: { $ref: '#/definitions/A' } } } } } },
      definitions: { A: {}, B: {} },
    };
    expect(brief(semanticChecks(doc, '2.0'))).toEqual([
      ['s.securityMissing', { name: 'otro' }, 'security > 1'],
      ['s.unusedSchema', { name: 'B' }, 'definitions > B'],
    ]);
  });

  it('documentos sin paths ni componentes', () => {
    expect(semanticChecks(base, '3.1')).toEqual([]);
    expect(semanticChecks(null, '3.1')).toEqual([]);
    expect(semanticChecks({ ...base, security: [{ x: [] }] }, '3.0')).toHaveLength(1);
  });
});

group('operations', () => {
  it('lista métodos conocidos con sus datos', () => {
    expect(
      operations({
        paths: {
          '/a': {
            summary: 'no es operación',
            get: { operationId: 'a', summary: 'Lee' },
            delete: { deprecated: true },
          },
          '/b': null,
        },
      }),
    ).toEqual([
      { method: 'GET', path: '/a', operationId: 'a', summary: 'Lee', deprecated: false },
      {
        method: 'DELETE',
        path: '/a',
        operationId: undefined,
        summary: undefined,
        deprecated: true,
      },
    ]);
    expect(operations({})).toEqual([]);
  });
});

group('validateOpenApi', () => {
  const YAML_SPEC = `openapi: 3.1.0
info:
  title: Pedidos
  version: 1.0.0
paths:
  /pedidos/{id}:
    get:
      responses:
        '200':
          descripton: ok
`;

  it('YAML con errores, cada uno con su línea', async () => {
    const r = await validateOpenApi(YAML_SPEC);
    if (!r.ok) throw new Error('debería validar');
    expect(r).toMatchObject({
      version: '3.1',
      declared: '3.1.0',
      title: 'Pedidos',
      apiVersion: '1.0.0',
      pathCount: 1,
    });
    expect(r.problems.map((p) => [p.line, p.code])).toEqual([
      [7, 's.pathParamMissing'],
      [9, 'p.required'],
      [9, 'p.unknown'],
    ]);
  });

  it('JSON válido, sin problemas', async () => {
    const doc = {
      swagger: '2.0',
      info: { title: 'T', version: '3' },
      paths: { '/a': { get: { responses: { '200': { description: 'ok' } } } } },
    };
    const r = await validateOpenApi('\uFEFF' + JSON.stringify(doc, null, 2));
    expect(r).toMatchObject({ ok: true, version: '2.0', apiVersion: '3', problems: [] });
  });

  it('las líneas apuntan a elementos de listas', async () => {
    const r = await validateOpenApi(`openapi: 3.0.3
info: { title: x, version: '1' }
paths:
  /a:
    get:
      parameters:
        - name: a
          in: query
          schema: { type: string }
        - name: b
          in: nada
          schema: { type: string }
      responses:
        '200': { description: ok }
`);
    if (!r.ok) throw new Error('debería validar');
    expect(r.problems.map((p) => [p.line, p.code])).toEqual([[11, 'p.enum']]);
  });

  it('errores de sintaxis con línea y columna', async () => {
    expect(await validateOpenApi('{"openapi": "3.1.0",}')).toMatchObject({
      ok: false,
      kind: 'syntax',
      source: 'json',
    });
    const y = await validateOpenApi('openapi: 3.1.0\ninfo:\n  title: a\n  title: b\n');
    expect(y).toMatchObject({ ok: false, kind: 'syntax', source: 'yaml', error: { line: 4 } });
  });

  it('sin versión reconocible', async () => {
    expect(await validateOpenApi('nombre: x\nversion: 1')).toEqual({ ok: false, kind: 'version' });
    expect(await validateOpenApi('[1, 2]')).toEqual({ ok: false, kind: 'version' });
  });

  it('documento casi vacío', async () => {
    const r = await validateOpenApi('openapi: 3.1.0');
    expect(r).toMatchObject({ ok: true, title: '', apiVersion: '', pathCount: 0, operations: [] });
    if (r.ok) expect(r.problems.map((p) => [p.line, p.code])).toContainEqual([1, 'p.required']);
  });
});
