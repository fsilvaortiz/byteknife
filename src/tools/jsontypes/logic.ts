// Infiere un modelo de tipos a partir de un JSON de ejemplo y lo escribe como interfaces de
// TypeScript, records de Java o structs de Go.

export type Lang = 'ts' | 'java' | 'go';

export type Shape =
  | { kind: 'string' | 'integer' | 'number' | 'boolean' | 'null' | 'unknown' }
  | { kind: 'array'; item: Shape }
  | { kind: 'object'; fields: Map<string, Field> }
  | { kind: 'union'; options: Shape[] };

export interface Field {
  shape: Shape;
  /** Falta en alguno de los objetos de ejemplo. */
  optional: boolean;
}

export function infer(v: unknown): Shape {
  if (v === null) return { kind: 'null' };
  if (Array.isArray(v)) {
    const item = v.map(infer).reduce<Shape | null>((a, b) => (a ? merge(a, b) : b), null);
    return { kind: 'array', item: item ?? { kind: 'unknown' } };
  }
  switch (typeof v) {
    case 'string':
      return { kind: 'string' };
    case 'number':
      return { kind: Number.isInteger(v) ? 'integer' : 'number' };
    case 'boolean':
      return { kind: 'boolean' };
    case 'object': {
      const fields = new Map<string, Field>();
      for (const [k, x] of Object.entries(v as object))
        fields.set(k, { shape: infer(x), optional: false });
      return { kind: 'object', fields };
    }
    default:
      return { kind: 'unknown' };
  }
}

const options = (s: Shape): Shape[] => (s.kind === 'union' ? s.options : [s]);

const numeric = (k: Shape['kind']) => k === 'integer' || k === 'number';

/** Une dos formas: el resultado acepta valores de ambas. */
export function merge(a: Shape, b: Shape): Shape {
  if (a.kind === 'unknown') return b;
  if (b.kind === 'unknown') return a;
  if (a.kind === 'array' && b.kind === 'array')
    return { kind: 'array', item: merge(a.item, b.item) };
  if (a.kind === 'object' && b.kind === 'object') return mergeObjects(a.fields, b.fields);
  if (a.kind === b.kind && a.kind !== 'union') return a;
  if (numeric(a.kind) && numeric(b.kind)) return { kind: 'number' };
  const list = [...options(a), ...options(b)].reduce<Shape[]>(addToUnion, []);
  return list.length === 1 ? list[0]! : { kind: 'union', options: list };
}

function mergeObjects(a: Map<string, Field>, b: Map<string, Field>): Shape {
  const fields = new Map<string, Field>();
  for (const [k, f] of a) {
    const other = b.get(k);
    fields.set(
      k,
      other
        ? { shape: merge(f.shape, other.shape), optional: f.optional || other.optional }
        : { ...f, optional: true },
    );
  }
  for (const [k, f] of b) if (!a.has(k)) fields.set(k, { ...f, optional: true });
  return { kind: 'object', fields };
}

/** Agrega una opción a una union; si ya hay una del mismo tipo, la combina con ella. */
function addToUnion(list: Shape[], s: Shape): Shape[] {
  const same = list.findIndex((o) => o.kind === s.kind || (numeric(o.kind) && numeric(s.kind)));
  if (same < 0) return [...list, s];
  return list.map((o, i) => (i === same ? merge(o, s) : o));
}

const nullable = (s: Shape) =>
  s.kind === 'null' || (s.kind === 'union' && s.options.some((o) => o.kind === 'null'));
const withoutNull = (s: Shape): Shape => {
  if (s.kind === 'null') return { kind: 'unknown' };
  if (s.kind !== 'union') return s;
  const rest = s.options.filter((o) => o.kind !== 'null');
  return rest.length === 1 ? rest[0]! : { kind: 'union', options: rest };
};

export function pascal(s: string): string {
  const words = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const name = words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join('');
  return /^[0-9]/.test(name) ? `T${name}` : name || 'Type';
}

export const camel = (s: string) => {
  const p = pascal(s);
  return p === 'Type' && !/[A-Za-z]/.test(s) ? 'field' : p[0]!.toLowerCase() + p.slice(1);
};

/** Nombre del tipo de un elemento: «items» → «Item», «addresses» → «Address». */
export function singular(name: string): string {
  if (/ies$/.test(name)) return `${name.slice(0, -3)}y`;
  if (/(ss|us|is)$/.test(name)) return name;
  if (/(sses|xes|ches|shes)$/.test(name)) return name.slice(0, -2);
  if (/s$/.test(name) && name.length > 3) return name.slice(0, -1);
  return `${name}Item`;
}

interface Named {
  name: string;
  fields: Map<string, Field>;
}

/** Asigna un nombre único a cada objeto anidado; la raíz va primero. */
function collect(root: Shape, rootName: string): { types: Named[]; names: Map<Shape, string> } {
  const types: Named[] = [];
  const names = new Map<Shape, string>();
  const used = new Set<string>();
  const unique = (base: string) => {
    let n = base;
    for (let i = 2; used.has(n); i++) n = `${base}${i}`;
    used.add(n);
    return n;
  };
  const visit = (s: Shape, hint: string) => {
    if (s.kind === 'object') {
      const name = unique(pascal(hint));
      names.set(s, name);
      types.push({ name, fields: s.fields });
      for (const [k, f] of s.fields) visit(f.shape, pascal(k));
    } else if (s.kind === 'array') {
      visit(s.item, singular(hint));
    } else if (s.kind === 'union') {
      for (const o of s.options) visit(o, hint);
    }
  };
  visit(root, rootName);
  return { types, names };
}

const TS_IDENT = /^[A-Za-z_$][\w$]*$/;

function tsType(s: Shape, names: Map<Shape, string>): string {
  switch (s.kind) {
    case 'integer':
    case 'number':
      return 'number';
    case 'array': {
      const inner = tsType(s.item, names);
      return s.item.kind === 'union' ? `(${inner})[]` : `${inner}[]`;
    }
    case 'object':
      return names.get(s)!;
    case 'union':
      return s.options.map((o) => tsType(o, names)).join(' | ');
    default:
      return s.kind;
  }
}

function toTs(root: Shape, rootName: string): string {
  const { types, names } = collect(root, rootName);
  const blocks = types.map(({ name, fields }) => {
    const lines = [...fields].map(([k, f]) => {
      const key = TS_IDENT.test(k) ? k : JSON.stringify(k);
      return `  ${key}${f.optional ? '?' : ''}: ${tsType(f.shape, names)};`;
    });
    return `export interface ${name} {\n${lines.join('\n')}\n}`;
  });
  if (root.kind !== 'object')
    blocks.unshift(`export type ${pascal(rootName)} = ${tsType(root, names)};`);
  return blocks.join('\n\n') + '\n';
}

function goType(s: Shape, names: Map<Shape, string>, pointer: boolean): string {
  if (nullable(s)) return goType(withoutNull(s), names, true);
  const p = pointer ? '*' : '';
  switch (s.kind) {
    case 'string':
      return `${p}string`;
    case 'integer':
      return `${p}int64`;
    case 'number':
      return `${p}float64`;
    case 'boolean':
      return `${p}bool`;
    case 'array':
      return `[]${goType(s.item, names, false)}`;
    case 'object':
      return `${p}${names.get(s)!}`;
    default:
      return 'any';
  }
}

const GO_INITIALISMS = new Set([
  'Id',
  'Url',
  'Uri',
  'Http',
  'Https',
  'Json',
  'Api',
  'Ip',
  'Sql',
  'Uuid',
  'Html',
]);

export const goField = (k: string) =>
  pascal(k).replace(/[A-Z][a-z]+/g, (w) => (GO_INITIALISMS.has(w) ? w.toUpperCase() : w));

function toGo(root: Shape, rootName: string): string {
  const { types, names } = collect(root, rootName);
  const blocks = types.map(({ name, fields }) => {
    const rows = [...fields].map(([k, f]) => {
      const optional = f.optional || nullable(f.shape);
      const tag = `\`json:"${k}${optional ? ',omitempty' : ''}"\``;
      return [goField(k), goType(f.shape, names, f.optional), tag];
    });
    const w0 = Math.max(0, ...rows.map((r) => r[0]!.length));
    const w1 = Math.max(0, ...rows.map((r) => r[1]!.length));
    const lines = rows.map(([n, ty, tag]) => `\t${n!.padEnd(w0)} ${ty!.padEnd(w1)} ${tag}`);
    return `type ${name} struct {\n${lines.join('\n')}\n}`;
  });
  if (root.kind !== 'object')
    blocks.unshift(`type ${pascal(rootName)} ${goType(root, names, false)}`);
  return blocks.join('\n\n') + '\n';
}

function javaType(s: Shape, names: Map<Shape, string>, boxed: boolean): string {
  if (nullable(s)) return javaType(withoutNull(s), names, true);
  switch (s.kind) {
    case 'string':
      return 'String';
    case 'integer':
      return boxed ? 'Long' : 'long';
    case 'number':
      return boxed ? 'Double' : 'double';
    case 'boolean':
      return boxed ? 'Boolean' : 'boolean';
    case 'array':
      return `List<${javaType(s.item, names, true)}>`;
    case 'object':
      return names.get(s)!;
    default:
      return 'Object';
  }
}

const JAVA_RESERVED = new Set(
  'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while record var yield'.split(
    ' ',
  ),
);

function toJava(root: Shape, rootName: string): string {
  const { types, names } = collect(root, rootName);
  const needsAnnotation = types.some((t) => [...t.fields.keys()].some((k) => javaName(k) !== k));
  const blocks = types.map(({ name, fields }) => {
    const params = [...fields].map(([k, f]) => {
      const id = javaName(k);
      const ann = id !== k ? `@JsonProperty(${JSON.stringify(k)}) ` : '';
      return `    ${ann}${javaType(f.shape, names, f.optional)} ${id}`;
    });
    return `public record ${name}(\n${params.join(',\n')}\n) {}`;
  });
  const imports = [
    blocks.some((b) => b.includes('List<')) && 'import java.util.List;',
    needsAnnotation && 'import com.fasterxml.jackson.annotation.JsonProperty;',
  ].filter(Boolean);
  return (imports.length ? imports.join('\n') + '\n\n' : '') + blocks.join('\n\n') + '\n';
}

function javaName(k: string): string {
  const id = camel(k);
  return JAVA_RESERVED.has(id) ? `${id}_` : id;
}

export class TypesError extends Error {
  constructor(readonly code: 'empty') {
    super(code);
    this.name = 'TypesError';
  }
}

export function generate(value: unknown, lang: Lang, rootName = 'Root'): string {
  const root = infer(value);
  const name = pascal(rootName.trim() || 'Root');
  if (root.kind === 'object' && root.fields.size === 0 && lang !== 'ts')
    throw new TypesError('empty');
  return lang === 'ts' ? toTs(root, name) : lang === 'go' ? toGo(root, name) : toJava(root, name);
}
