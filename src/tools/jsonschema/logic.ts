// Validador de JSON Schema con @cfworker/json-schema (carga diferida). Se eligió porque
// interpreta el esquema sin generar código: ajv usa new Function, que la CSP bloquea.

export const DRAFTS = ['2020-12', '2019-09', '7', '4'] as const;
export type Draft = (typeof DRAFTS)[number];

export interface SchemaError {
  /** Ruta en el documento validado, como JSON Pointer («/items/0/email», «» para la raíz). */
  path: string;
  keyword: string;
  /** Ubicación de la regla en el esquema. */
  schemaPath: string;
  message: string;
}

/** Draft declarado en $schema; si no hay o no se reconoce, 2020-12. */
export function draftOf(schema: unknown): Draft {
  const id =
    typeof schema === 'object' && schema
      ? String((schema as { $schema?: unknown }).$schema ?? '')
      : '';
  if (/2019-09/.test(id)) return '2019-09';
  if (/draft-07/.test(id)) return '7';
  if (/draft-04/.test(id)) return '4';
  return '2020-12';
}

/** Errores que solo resumen a los de sus hijos: se ocultan para no repetir lo mismo. */
const SUMMARY = new Set([
  'properties',
  'items',
  'prefixItems',
  'allOf',
  '$ref',
  'dependentSchemas',
  'false',
]);

const unescape = (seg: string) => decodeURIComponent(seg).replace(/~1/g, '/').replace(/~0/g, '~');

function resolve(schema: unknown, pointer: string): unknown {
  let node = schema;
  for (const seg of pointer.replace(/^#\/?/, '').split('/').filter(Boolean)) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[unescape(seg)];
  }
  return node;
}

/**
 * @cfworker/json-schema marca como «adicional» una propiedad declarada que falló su propia
 * regla. Ese error sobra: la propiedad sí está en `properties`.
 */
function spuriousAdditional(
  schema: unknown,
  err: { keywordLocation: string; error: string },
): boolean {
  const name = err.error.match(
    /^Property "(.*)" does not match additional properties schema\.$/,
  )?.[1];
  if (name === undefined) return false;
  const parent = resolve(schema, err.keywordLocation.replace(/\/additionalProperties$/, ''));
  const props = (parent as { properties?: Record<string, unknown> } | undefined)?.properties;
  return !!props && Object.prototype.hasOwnProperty.call(props, name);
}

export async function validate(
  schema: unknown,
  instance: unknown,
  draft: Draft,
): Promise<SchemaError[]> {
  const { Validator } = await import('@cfworker/json-schema');
  const result = new Validator(schema as object, draft, false).validate(instance);
  return result.errors
    .filter((e) => !SUMMARY.has(e.keyword) && !spuriousAdditional(schema, e))
    .map((e) => ({
      path: e.instanceLocation.replace(/^#/, ''),
      keyword: e.keyword,
      schemaPath: e.keywordLocation.replace(/^#/, ''),
      message: e.error,
    }));
}
