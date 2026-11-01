import { describe, expect, it } from 'vitest';
import { camel, generate, goField, infer, merge, pascal, singular, TypesError } from './logic';

const SAMPLE = {
  id: 4821,
  nombre: 'Ana',
  saldo: 10.5,
  activo: true,
  apodo: null,
  'creado-en': '2026-10-30',
  tags: ['a', 'b'],
  direccion: { calle: 'Av. Siempre Viva', numero: 742 },
  pedidos: [
    { id: 1, total: 10, nota: 'x' },
    { id: 2, total: 12.5 },
  ],
};

describe('TypeScript', () => {
  it('interfaces anidadas, opcionales y nulos', () => {
    expect(generate(SAMPLE, 'ts', 'Cliente')).toBe(`export interface Cliente {
  id: number;
  nombre: string;
  saldo: number;
  activo: boolean;
  apodo: null;
  "creado-en": string;
  tags: string[];
  direccion: Direccion;
  pedidos: Pedido[];
}

export interface Direccion {
  calle: string;
  numero: number;
}

export interface Pedido {
  id: number;
  total: number;
  nota?: string;
}
`);
  });

  it('raíz arreglo y unions', () => {
    expect(generate([{ a: 1 }, { a: 'x' }, { a: null }], 'ts')).toBe(`export type Root = RootItem[];

export interface RootItem {
  a: number | string | null;
}
`);
    expect(generate([1, 'a', [true]], 'ts')).toBe(
      'export type Root = (number | string | boolean[])[];\n',
    );
    expect(generate([], 'ts')).toBe('export type Root = unknown[];\n');
  });

  it('nombres repetidos se numeran', () => {
    const out = generate({ a: { item: { x: 1 } }, b: { item: { y: 1 } } }, 'ts');
    expect(out).toContain('export interface Item {');
    expect(out).toContain('export interface Item2 {');
  });
});

describe('Go', () => {
  it('structs con tags, punteros e iniciales', () => {
    expect(
      generate({ id: 1, url: 'x', apodo: null, extra: { n: 1.5 }, xs: [1] }, 'go', 'user'),
    ).toBe(
      `type User struct {
\tID    int64   \`json:"id"\`
\tURL   string  \`json:"url"\`
\tApodo any     \`json:"apodo,omitempty"\`
\tExtra Extra   \`json:"extra"\`
\tXs    []int64 \`json:"xs"\`
}

type Extra struct {
\tN float64 \`json:"n"\`
}
`,
    );
  });

  it('opcionales y nulables como puntero', () => {
    const out = generate([{ a: 1, b: 'x' }, { a: null }], 'go');
    expect(out).toContain('type Root []RootItem');
    expect(out).toMatch(/A \*int64 +`json:"a,omitempty"`/);
    expect(out).toMatch(/B \*string +`json:"b,omitempty"`/);
  });

  it('objeto vacío → error', () => {
    expect(() => generate({}, 'go')).toThrow(TypesError);
  });
});

describe('Java', () => {
  it('records con List, boxing y @JsonProperty', () => {
    expect(generate({ id: 1, class: 'x', tags: ['a'], monto: null, ok: true }, 'java')).toBe(
      `import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record Root(
    long id,
    @JsonProperty("class") String class_,
    List<String> tags,
    Object monto,
    boolean ok
) {}
`,
    );
  });

  it('opcionales boxed y sin imports si no hacen falta', () => {
    expect(generate([{ n: 1, d: 1.5 }, { d: 2 }], 'java')).toBe(`public record RootItem(
    Long n,
    double d
) {}
`);
  });
});

describe('inferencia', () => {
  it('merge: entero + decimal = number; tipos distintos = union', () => {
    expect(merge({ kind: 'integer' }, { kind: 'number' })).toEqual({ kind: 'number' });
    expect(merge({ kind: 'string' }, { kind: 'boolean' })).toEqual({
      kind: 'union',
      options: [{ kind: 'string' }, { kind: 'boolean' }],
    });
    const u = merge({ kind: 'string' }, { kind: 'integer' });
    expect(merge(u, { kind: 'number' })).toEqual({
      kind: 'union',
      options: [{ kind: 'string' }, { kind: 'number' }],
    });
    expect(merge({ kind: 'unknown' }, { kind: 'null' })).toEqual({ kind: 'null' });
  });

  it('infer de valores raros', () => {
    expect(infer(undefined)).toEqual({ kind: 'unknown' });
  });
});

describe('nombres', () => {
  it.each([
    ['user_profile', 'UserProfile'],
    ['creado-en', 'CreadoEn'],
    ['dirección', 'Direccion'],
    ['userId', 'UserId'],
    ['3d', 'T3d'],
    ['***', 'Type'],
  ])('pascal(%s) = %s', (a, b) => {
    expect(pascal(a)).toBe(b);
  });

  it('camel y goField', () => {
    expect(camel('user_id')).toBe('userId');
    expect(camel('$$')).toBe('field');
    expect(goField('api_url')).toBe('APIURL');
    expect(goField('user_id')).toBe('UserID');
  });

  it.each([
    ['Items', 'Item'],
    ['Categories', 'Category'],
    ['Addresses', 'Address'],
    ['Status', 'Status'],
    ['Boxes', 'Box'],
    ['Data', 'DataItem'],
    ['Ids', 'IdsItem'],
  ])('singular(%s) = %s', (a, b) => {
    expect(singular(a)).toBe(b);
  });
});
