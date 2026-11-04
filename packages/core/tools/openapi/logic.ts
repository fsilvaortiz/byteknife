// Validador de OpenAPI: estructura con los esquemas oficiales de la OpenAPI Initiative
// (schemas/, Apache-2.0) sobre @cfworker/json-schema, más revisiones propias que el esquema
// no cubre ($ref rotos, parámetros de ruta, operationId repetidos…). Todo con carga diferida.
import type { Document, LineCounter } from 'yaml';
import { parseErrorPosition, stripBom, type JsonError } from '../json/logic';

export { declaredVersion } from './detect';

export const VERSIONS = ['2.0', '3.0', '3.1', '3.2'] as const;
export type SpecVersion = (typeof VERSIONS)[number];

export interface Problem {
  level: 'error' | 'warn';
  /** Ruta en el documento, por segmentos («paths», «/pets», «get»). */
  path: string[];
  /** Clave i18n bajo «oapi.p.» (estructura) u «oapi.s.» (revisiones propias). */
  code: string;
  params: Record<string, string | number>;
  /** Texto original de la librería, para los errores sin traducción. */
  raw?: string;
  line?: number | undefined;
}

export interface Operation {
  method: string;
  path: string;
  operationId: string | undefined;
  summary: string | undefined;
  deprecated: boolean;
}

export type OpenApiResult =
  | { ok: false; kind: 'syntax'; source: 'json' | 'yaml'; error: JsonError }
  | { ok: false; kind: 'version' }
  | {
      ok: true;
      version: SpecVersion;
      /** Versión tal como la declara el documento («3.1.0»). */
      declared: string;
      title: string;
      apiVersion: string;
      pathCount: number;
      operations: Operation[];
      problems: Problem[];
    };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export function specVersion(doc: unknown): { version: SpecVersion; declared: string } | null {
  if (!isObj(doc)) return null;
  if (doc.swagger !== undefined) {
    const declared = String(doc.swagger);
    return declared === '2.0' ? { version: '2.0', declared } : null;
  }
  const declared = String(doc.openapi ?? '');
  const m = declared.match(/^3\.([0-2])(?:\.|$)/);
  return m ? { version: `3.${m[1]}` as SpecVersion, declared } : null;
}

// ─── Estructura ─────────────────────────────────────────────────────────────────────────

export interface RawError {
  keyword: string;
  keywordLocation: string;
  instanceLocation: string;
  error: string;
}

/** «#/paths/~1a%20b/get» → ['paths', '/a b', 'get']. */
export function segments(pointer: string): string[] {
  return pointer
    .replace(/^#/, '')
    .split('/')
    .slice(1)
    .map((s) => decodeURIComponent(s).replace(/~1/g, '/').replace(/~0/g, '~'));
}

const startsWith = (a: string[], b: string[]) => b.every((s, i) => a[i] === s);

/** Errores que solo resumen a los de sus hijos. */
const SUMMARY = new Set([
  'properties',
  'patternProperties',
  'items',
  'prefixItems',
  '$ref',
  '$recursiveRef',
  'if',
  'allOf',
  'dependentSchemas',
  'false',
]);
const ALTERNATIVES = new Set(['oneOf', 'anyOf']);
const EXTRA = new Set(['additionalProperties', 'unevaluatedProperties']);

const propOf = (e: RawError) => e.error.match(/^Property "(.*)" does not match/)?.[1];

/** Errores que verá el usuario de una rama: sin resúmenes ni «adicionales» falsos. */
function leaves(errors: RawError[]): RawError[] {
  return errors.filter((e) => {
    if (SUMMARY.has(e.keyword)) return false;
    if (ALTERNATIVES.has(e.keyword)) {
      return !errors.some((c) => c !== e && c.keywordLocation.startsWith(e.keywordLocation + '/'));
    }
    if (EXTRA.has(e.keyword)) {
      // La librería marca como «adicional» una propiedad declarada que falló su propia
      // regla; solo es adicional de verdad si nada más falló dentro de ella.
      const at = [...segments(e.instanceLocation), propOf(e) ?? ''];
      return !errors.some(
        (c) =>
          c.keyword !== 'false' &&
          !EXTRA.has(c.keyword) &&
          startsWith(segments(c.instanceLocation), at),
      );
    }
    return true;
  });
}

/**
 * En un oneOf/anyOf la librería informa los errores de todas las ramas. Se queda con la
 * rama que el autor más probablemente quiso: descarta la de referencia ($ref) si el objeto
 * no tiene $ref, y entre las demás elige la de menos errores y, a igualdad, la más profunda.
 * Va de adentro hacia afuera, para que cada rama se puntúe con sus alternativas ya resueltas.
 */
export function reduceErrors(errors: RawError[], doc: unknown): RawError[] {
  let list = [...errors];
  const alts = list
    .filter((e) => ALTERNATIVES.has(e.keyword))
    .sort((a, b) => b.keywordLocation.length - a.keywordLocation.length);
  for (const alt of alts) {
    if (!list.includes(alt)) continue;
    const base = alt.keywordLocation + '/';
    const branches = new Map<string, RawError[]>();
    for (const e of list) {
      if (!e.keywordLocation.startsWith(base)) continue;
      const i = e.keywordLocation.slice(base.length).split('/')[0]!;
      branches.set(i, [...(branches.get(i) ?? []), e]);
    }
    if (branches.size < 2) continue;
    const target = valueAt(doc, segments(alt.instanceLocation));
    const hasRef = isObj(target) && '$ref' in target;
    const score = (errs: RawError[]) => {
      const ls = leaves(errs);
      const wantsRef = ls.some(
        (e) =>
          e.keyword === 'required' &&
          e.instanceLocation === alt.instanceLocation &&
          e.error.includes('"$ref"'),
      );
      const depth = Math.max(...ls.map((e) => segments(e.instanceLocation).length), 0);
      return { bad: wantsRef && !hasRef ? 1 : 0, count: ls.length, depth };
    };
    let best: [string, ReturnType<typeof score>] | null = null;
    for (const [i, errs] of branches) {
      const s = score(errs);
      if (
        !best ||
        s.bad < best[1].bad ||
        (s.bad === best[1].bad &&
          (s.count < best[1].count || (s.count === best[1].count && s.depth > best[1].depth)))
      ) {
        best = [i, s];
      }
    }
    const keep = base + best![0];
    list = list.filter(
      (e) =>
        e === alt ||
        !e.keywordLocation.startsWith(base) ||
        e.keywordLocation === keep ||
        e.keywordLocation.startsWith(keep + '/'),
    );
  }
  const out = leaves(list);
  // En 3.1+, «responses» vacío da «falta default» (if/then) y «minProperties»: basta uno.
  return out.filter(
    (e) =>
      !(e.keyword === 'required' && e.keywordLocation.includes('/then/')) ||
      !out.some((o) => o.keyword === 'minProperties' && o.instanceLocation === e.instanceLocation),
  );
}

/** Traduce un error de la librería a una clave y sus parámetros. */
export function describe(e: RawError): Pick<Problem, 'code' | 'params' | 'raw'> {
  const m = (re: RegExp) => e.error.match(re);
  let r: RegExpMatchArray | null;
  switch (e.keyword) {
    case 'required':
      if ((r = m(/property "(.*)"/))) return { code: 'p.required', params: { name: r[1]! } };
      break;
    case 'additionalProperties':
    case 'unevaluatedProperties':
      if ((r = m(/^Property "(.*)"/))) return { code: 'p.unknown', params: { name: r[1]! } };
      break;
    case 'enum':
      if ((r = m(/any of (\[.*\])\.$/))) {
        const values = (JSON.parse(r[1]!) as unknown[]).map((v) => String(v)).join(', ');
        return { code: 'p.enum', params: { values } };
      }
      break;
    case 'const':
      if ((r = m(/does not match (.*)\.$/))) return { code: 'p.const', params: { value: r[1]! } };
      break;
    case 'type':
      if ((r = m(/type "(\w+)" is invalid\. Expected "(.*)"\.$/))) {
        return {
          code: 'p.type',
          params: { actual: r[1]!, expected: r[2]!.replace(/", "/g, ', ') },
        };
      }
      break;
    case 'format':
      if ((r = m(/format "(.*)"/))) return { code: 'p.format', params: { format: r[1]! } };
      break;
    case 'pattern':
      return { code: 'p.pattern', params: {} };
    case 'minProperties':
      if ((r = m(/at least (\d+)/))) return { code: 'p.minProperties', params: { min: r[1]! } };
      break;
    case 'minItems':
      if ((r = m(/< (\d+)\)/))) return { code: 'p.minItems', params: { min: r[1]! } };
      break;
    case 'uniqueItems':
      return { code: 'p.unique', params: {} };
    case 'oneOf':
    case 'anyOf':
      return { code: 'p.oneOf', params: {} };
  }
  return { code: 'p.other', params: {}, raw: e.error };
}

type Json = Record<string, unknown>;

/** El esquema 3.1/3.2 usa $dynamicRef, que la librería no implementa: se apunta al mismo destino. */
function staticRefs(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(staticRefs);
  if (!isObj(node)) return node;
  return Object.fromEntries(
    Object.entries(node).map(([k, v]) =>
      k === '$dynamicRef' ? ['$ref', '#/$defs/schema'] : [k, staticRefs(v)],
    ),
  );
}

const SCHEMAS: Record<SpecVersion, () => Promise<{ default: unknown }>> = {
  '2.0': () => import('./schemas/oas-2.0.json'),
  '3.0': () => import('./schemas/oas-3.0.json'),
  '3.1': () => import('./schemas/oas-3.1.json'),
  '3.2': () => import('./schemas/oas-3.2.json'),
};

export async function structuralErrors(doc: unknown, version: SpecVersion): Promise<RawError[]> {
  const [{ Validator }, schema] = await Promise.all([
    import('@cfworker/json-schema'),
    SCHEMAS[version](),
  ]);
  const modern = version === '3.1' || version === '3.2';
  const validator = new Validator(
    staticRefs(schema.default) as Json,
    modern ? '2020-12' : '4',
    false,
  );
  if (version === '2.0') {
    // Swagger 2.0 reutiliza definiciones del metaesquema draft-04.
    validator.addSchema((await import('./schemas/draft-04.json')).default as Json);
  }
  return reduceErrors(validator.validate(doc).errors, doc);
}

// ─── Revisiones propias ─────────────────────────────────────────────────────────────────

export function valueAt(doc: unknown, path: string[]): unknown {
  let node = doc;
  for (const seg of path) {
    if (Array.isArray(node)) node = node[Number(seg)];
    else if (isObj(node)) node = node[seg];
    else return undefined;
  }
  return node;
}

const pointerPath = (ref: string) =>
  ref
    .slice(2)
    .split('/')
    .map((s) => decodeURIComponent(s).replace(/~1/g, '/').replace(/~0/g, '~'));

/** Recorre el documento y llama a fn con cada $ref (texto) y su ruta. */
function eachRef(node: unknown, path: string[], fn: (ref: string, path: string[]) => void) {
  if (Array.isArray(node)) node.forEach((v, i) => eachRef(v, [...path, String(i)], fn));
  else if (isObj(node)) {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') fn(v, path);
      // `example` y `examples` son datos de ejemplo, no estructura: un $ref ahí no se sigue.
      else if (k !== 'example' && k !== 'examples') eachRef(v, [...path, k], fn);
    }
  }
}

function deref(doc: unknown, v: unknown): unknown {
  for (
    let i = 0;
    i < 10 && isObj(v) && typeof v.$ref === 'string' && v.$ref.startsWith('#/');
    i++
  ) {
    v = valueAt(doc, pointerPath(v.$ref));
  }
  return v;
}

export function operations(doc: unknown): Operation[] {
  const paths = isObj(doc) && isObj(doc.paths) ? doc.paths : {};
  const out: Operation[] = [];
  for (const [path, item] of Object.entries(paths)) {
    if (!isObj(item)) continue;
    for (const method of METHODS) {
      const op = item[method];
      if (!isObj(op)) continue;
      out.push({
        method: method.toUpperCase(),
        path,
        operationId: typeof op.operationId === 'string' ? op.operationId : undefined,
        summary: typeof op.summary === 'string' ? op.summary : undefined,
        deprecated: op.deprecated === true,
      });
    }
  }
  return out;
}

const templateParams = (path: string) => [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]!);

export function semanticChecks(doc: unknown, version: SpecVersion): Problem[] {
  const problems: Problem[] = [];
  const add = (
    level: Problem['level'],
    path: string[],
    code: string,
    params: Problem['params'] = {},
  ) => problems.push({ level, path, code, params });
  if (!isObj(doc)) return problems;

  // $ref locales rotos y externos.
  const used = new Set<string>();
  eachRef(doc, [], (ref, path) => {
    if (ref.startsWith('#/')) {
      used.add(ref);
      if (valueAt(doc, pointerPath(ref)) === undefined) add('error', path, 's.refMissing', { ref });
    } else if (!ref.startsWith('#')) {
      add('warn', path, 's.refExternal', { ref });
    }
  });

  const paths = isObj(doc.paths) ? doc.paths : {};

  // Rutas equivalentes: /users/{id} y /users/{name} son la misma para el router.
  const shapes = new Map<string, string>();
  for (const path of Object.keys(paths)) {
    const shape = path.replace(/\{[^}]+\}/g, '{}');
    const other = shapes.get(shape);
    if (other) add('error', ['paths', path], 's.samePath', { other });
    else shapes.set(shape, path);
  }

  const ids = new Map<string, string>();
  const schemes = isObj(doc.components)
    ? (doc.components as Obj).securitySchemes
    : doc.securityDefinitions;
  const checkSecurity = (sec: unknown, path: string[]) => {
    if (!Array.isArray(sec)) return;
    sec.forEach((req, i) => {
      if (!isObj(req)) return;
      for (const name of Object.keys(req)) {
        if (!isObj(schemes) || !(name in schemes))
          add('error', [...path, String(i)], 's.securityMissing', { name });
      }
    });
  };
  checkSecurity(doc.security, ['security']);

  for (const [path, rawItem] of Object.entries(paths)) {
    const item = deref(doc, rawItem);
    if (!isObj(item)) continue;
    const declaredIn = (list: unknown) =>
      (Array.isArray(list) ? list : []).map((p) => deref(doc, p)).filter(isObj);
    const shared = declaredIn(item.parameters);
    const inTemplate = templateParams(path);

    const dupes = (list: Obj[], at: string[]) => {
      const seen = new Set<string>();
      for (const p of list) {
        const key = `${String(p.in)}:${String(p.name)}`;
        if (seen.has(key))
          add('error', at, 's.dupParam', { name: String(p.name), in: String(p.in) });
        seen.add(key);
      }
    };
    dupes(shared, ['paths', path, 'parameters']);

    for (const method of METHODS) {
      const op = item[method];
      if (!isObj(op)) continue;
      const at = ['paths', path, method];
      const own = declaredIn(op.parameters);
      dupes(own, [...at, 'parameters']);

      // Los de la operación reemplazan a los del path con el mismo nombre e «in».
      const all = [...own, ...shared];
      const pathParams = new Set(all.filter((p) => p.in === 'path').map((p) => String(p.name)));
      for (const name of inTemplate) {
        if (!pathParams.has(name)) add('error', at, 's.pathParamMissing', { name });
      }
      for (const name of pathParams) {
        if (!inTemplate.includes(name)) add('error', at, 's.pathParamExtra', { name });
      }

      if (typeof op.operationId === 'string') {
        const other = ids.get(op.operationId);
        const here = `${method.toUpperCase()} ${path}`;
        if (other)
          add('error', [...at, 'operationId'], 's.dupOperationId', { id: op.operationId, other });
        else ids.set(op.operationId, here);
      }
      checkSecurity(op.security, [...at, 'security']);
    }
  }

  // Esquemas declarados que nadie usa.
  const defs =
    version === '2.0'
      ? doc.definitions
      : isObj(doc.components)
        ? (doc.components as Obj).schemas
        : undefined;
  const base = version === '2.0' ? ['definitions'] : ['components', 'schemas'];
  if (isObj(defs)) {
    const prefix = '#/' + base.join('/') + '/';
    const isUsed = (name: string) => {
      const ref = prefix + name.replace(/~/g, '~0').replace(/\//g, '~1');
      return [...used].some((u) => u === ref || u.startsWith(ref + '/'));
    };
    for (const name of Object.keys(defs)) {
      if (!isUsed(name)) add('warn', [...base, name], 's.unusedSchema', { name });
    }
  }
  return problems;
}

// ─── Entrada y líneas ───────────────────────────────────────────────────────────────────

/** Línea (desde 1) del nodo en esa ruta, o del más profundo que exista. */
export function lineOf(ydoc: Document, lc: LineCounter, path: string[]): number | undefined {
  let node: unknown = ydoc.contents;
  let offset = (node as { range?: [number] } | null)?.range?.[0];
  for (const seg of path) {
    const items = (node as { items?: unknown[] } | null)?.items;
    if (!Array.isArray(items)) break;
    let next: unknown;
    if (items.length && isObj(items[0]) && 'key' in (items[0] as Obj)) {
      const pair = (items as { key: { value?: unknown; range?: [number] }; value: unknown }[]).find(
        (p) => String(p.key?.value) === seg,
      );
      if (!pair) break;
      offset = pair.key.range?.[0] ?? offset;
      next = pair.value;
    } else {
      next = items[Number(seg)];
      offset = (next as { range?: [number] } | undefined)?.range?.[0] ?? offset;
    }
    node = next;
  }
  return offset === undefined ? undefined : lc.linePos(offset).line;
}

export async function validateOpenApi(src: string): Promise<OpenApiResult> {
  const text = stripBom(src);
  const YAML = await import('yaml');
  const lc = new YAML.LineCounter();
  const ydoc = YAML.parseDocument(text, { lineCounter: lc, uniqueKeys: true });
  let doc: unknown;
  if (/^\s*[{[]/.test(text)) {
    try {
      doc = JSON.parse(text);
    } catch (e) {
      return { ok: false, kind: 'syntax', source: 'json', error: parseErrorPosition(e, text) };
    }
  } else {
    const err = ydoc.errors[0];
    if (err) {
      const pos = err.linePos?.[0];
      return {
        ok: false,
        kind: 'syntax',
        source: 'yaml',
        error: {
          detail: err.message.split('\n')[0]!.replace(/ at line \d+, column \d+:?$/, ''),
          line: pos?.line ?? 1,
          column: pos?.col ?? 1,
        },
      };
    }
    doc = ydoc.toJS({ maxAliasCount: 100 });
  }

  const spec = specVersion(doc);
  if (!spec) return { ok: false, kind: 'version' };

  const structural: Problem[] = (await structuralErrors(doc, spec.version)).map((e) => ({
    level: 'error',
    path: segments(e.instanceLocation),
    ...describe(e),
  }));
  const problems = [...structural, ...semanticChecks(doc, spec.version)];
  const lines = ydoc.errors.length === 0;
  for (const p of problems) if (lines) p.line = lineOf(ydoc, lc, p.path);
  problems.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));

  const info = isObj((doc as Obj).info) ? ((doc as Obj).info as Obj) : {};
  const paths = (doc as Obj).paths;
  return {
    ok: true,
    ...spec,
    title: typeof info.title === 'string' ? info.title : '',
    apiVersion: info.version === undefined ? '' : String(info.version),
    pathCount: isObj(paths) ? Object.keys(paths).length : 0,
    operations: operations(doc),
    problems,
  };
}
