import { describe, expect, it } from 'vitest';
import { convert, looksLikeYaml } from './logic';

const ok = async (src: string, dir: 'y2j' | 'j2y', indent?: number) => {
  const r = await convert(src, dir, indent);
  if (!r.ok) throw new Error(r.error.detail);
  return r;
};

describe('YAML → JSON', () => {
  it('convierte mapas, listas y tipos', async () => {
    const r = await ok(
      'nombre: api\nreplicas: 3\nactivo: true\npuertos:\n  - 80\n  - 443\nnota: null\n',
      'y2j',
    );
    expect(JSON.parse(r.output)).toEqual({
      nombre: 'api',
      replicas: 3,
      activo: true,
      puertos: [80, 443],
      nota: null,
    });
    expect(r.documents).toBe(1);
  });

  it('resuelve anclas y alias', async () => {
    const r = await ok('base: &b {a: 1}\notro:\n  <<: *b\n  c: 2\n', 'y2j');
    expect(JSON.parse(r.output)).toEqual({ base: { a: 1 }, otro: { a: 1, c: 2 } });
  });

  it('varios documentos → arreglo', async () => {
    const r = await ok('---\na: 1\n---\nb: 2\n', 'y2j');
    expect(JSON.parse(r.output)).toEqual([{ a: 1 }, { b: 2 }]);
    expect(r.documents).toBe(2);
  });

  it('documento vacío → null', async () => {
    const r = await ok('', 'y2j');
    expect(r.output).toBe('null');
    expect(r.documents).toBe(0);
  });

  it('respeta la sangría pedida', async () => {
    expect((await ok('a: [1]', 'y2j', 4)).output).toBe('{\n    "a": [\n        1\n    ]\n}');
  });

  it('error con línea y columna', async () => {
    const r = await convert('a: 1\nb: [1, 2\nc: 3', 'y2j');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.source).toBe('yaml');
    expect(r.error.line).toBeGreaterThanOrEqual(2);
    expect(r.error.detail).not.toMatch(/at line/);
  });

  it('error sin posición usa la línea 1', async () => {
    const r = await convert('a: 1\na: 2', 'y2j');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.line).toBeGreaterThanOrEqual(1);
  });
});

describe('JSON → YAML', () => {
  it('convierte y no corta líneas largas', async () => {
    const long = 'x'.repeat(120);
    const r = await ok(JSON.stringify({ a: [1, { b: 'c' }], s: long }), 'j2y');
    expect(r.output).toBe(`a:\n  - 1\n  - b: c\ns: ${long}\n`);
  });

  it('error de JSON con posición', async () => {
    const r = await convert('{"a": 1,}', 'j2y');
    expect(r).toMatchObject({ ok: false, source: 'json', error: { line: 1 } });
  });

  it('quita el BOM', async () => {
    expect((await ok('\ufeff{"a":1}', 'j2y')).output).toBe('a: 1\n');
  });
});

describe('looksLikeYaml', () => {
  it.each([
    'apiVersion: v1\nkind: Pod\n',
    '---\nfoo',
    '# comentario\nname: ci\non: push\n',
    '- name: a\n  image: b\n',
  ])('sí: %j', (s) => {
    expect(looksLikeYaml(s)).toBe(true);
  });

  it.each(['{"a": 1}', 'hola: mundo', 'texto libre\nen dos líneas', 'https://x.dev/a:b\nc: d'])(
    'no: %j',
    (s) => {
      expect(looksLikeYaml(s)).toBe(false);
    },
  );
});
