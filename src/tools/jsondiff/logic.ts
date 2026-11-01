import { parseErrorPosition, stripBom, type JsonError } from '../json/logic';

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export type ChangeKind = 'added' | 'removed' | 'changed';

export interface Change {
  /** Ruta estilo JSONPath: $.items[0].name o $["clave rara"]. */
  path: string;
  kind: ChangeKind;
  before?: Json;
  after?: Json;
}

export interface DiffOptions {
  /** Compara los arreglos como conjuntos: el orden de los elementos no cuenta. */
  ignoreOrder: boolean;
}

const isObject = (v: Json): v is { [k: string]: Json } =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const keyPath = (base: string, key: string) =>
  /^[A-Za-z_$][\w$]*$/.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`;

/** JSON canónico (claves ordenadas): sirve para comparar y ordenar sin importar el orden. */
export function canonical(v: Json): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (isObject(v)) {
    const keys = Object.keys(v).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(v[k]!)}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

export function diffJson(a: Json, b: Json, opts: DiffOptions, path = '$'): Change[] {
  if (isObject(a) && isObject(b)) {
    const out: Change[] = [];
    for (const k of Object.keys(a)) {
      const p = keyPath(path, k);
      if (!(k in b)) out.push({ path: p, kind: 'removed', before: a[k]! });
      else out.push(...diffJson(a[k]!, b[k]!, opts, p));
    }
    for (const k of Object.keys(b)) {
      if (!(k in a)) out.push({ path: keyPath(path, k), kind: 'added', after: b[k]! });
    }
    return out;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return opts.ignoreOrder ? diffAsSets(a, b, path) : diffByIndex(a, b, opts, path);
  }
  return canonical(a) === canonical(b) ? [] : [{ path, kind: 'changed', before: a, after: b }];
}

function diffByIndex(a: Json[], b: Json[], opts: DiffOptions, path: string): Change[] {
  const out: Change[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const p = `${path}[${i}]`;
    if (i >= b.length) out.push({ path: p, kind: 'removed', before: a[i]! });
    else if (i >= a.length) out.push({ path: p, kind: 'added', after: b[i]! });
    else out.push(...diffJson(a[i]!, b[i]!, opts, p));
  }
  return out;
}

/** Sin orden: cada elemento de un lado empareja con uno igual del otro (multiconjunto). */
function diffAsSets(a: Json[], b: Json[], path: string): Change[] {
  const pending = new Map<string, number[]>();
  b.forEach((v, i) => {
    const k = canonical(v);
    pending.set(k, [...(pending.get(k) ?? []), i]);
  });
  const out: Change[] = [];
  a.forEach((v, i) => {
    const left = pending.get(canonical(v));
    if (left?.length) left.shift();
    else out.push({ path: `${path}[${i}]`, kind: 'removed', before: v });
  });
  for (const idx of pending.values()) {
    for (const i of idx) out.push({ path: `${path}[${i}]`, kind: 'added', after: b[i]! });
  }
  return out;
}

export type ParseSide = { ok: true; value: Json } | { ok: false; error: JsonError };

export function parseSide(src: string): ParseSide {
  const text = stripBom(src);
  try {
    return { ok: true, value: JSON.parse(text) as Json };
  } catch (e) {
    return { ok: false, error: parseErrorPosition(e, text) };
  }
}

/** Valor compacto para mostrar en una celda: JSON en una línea, recortado. */
export function preview(v: Json | undefined, max = 120): string {
  if (v === undefined) return '';
  const s = JSON.stringify(v);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function summary(changes: Change[]): Record<ChangeKind, number> {
  const out = { added: 0, removed: 0, changed: 0 };
  for (const c of changes) out[c.kind]++;
  return out;
}
