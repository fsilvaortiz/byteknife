import { parseErrorPosition, stripBom, type JsonError } from '../json/logic';

export { looksLikeYaml } from './detect';

export type YamlDir = 'y2j' | 'j2y';

export type ConvertResult =
  | { ok: true; output: string; documents: number }
  | { ok: false; source: 'yaml' | 'json'; error: JsonError };

/** La librería `yaml` se carga solo al convertir: no pesa en la página. */
const loadYaml = () => import('yaml');

/**
 * YAML → JSON: un documento da un valor; varios (separados por «---»), un arreglo.
 * JSON → YAML: siempre un documento.
 */
export async function convert(src: string, dir: YamlDir, indent = 2): Promise<ConvertResult> {
  const text = stripBom(src);
  const YAML = await loadYaml();
  if (dir === 'j2y') {
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch (e) {
      return { ok: false, source: 'json', error: parseErrorPosition(e, text) };
    }
    return { ok: true, output: YAML.stringify(value, { indent, lineWidth: 0 }), documents: 1 };
  }
  const docs = YAML.parseAllDocuments(text, { merge: true });
  const list = Array.isArray(docs) ? docs : [docs];
  for (const doc of list) {
    const err = doc.errors[0];
    if (err) {
      const pos = err.linePos?.[0];
      return {
        ok: false,
        source: 'yaml',
        error: {
          detail: err.message.split('\n')[0]!.replace(/ at line \d+, column \d+:?$/, ''),
          line: pos?.line ?? 1,
          column: pos?.col ?? 1,
        },
      };
    }
  }
  const values = list.map((d) => d.toJS({ maxAliasCount: 100 }) as unknown);
  const value = values.length > 1 ? values : values[0];
  return {
    ok: true,
    output: JSON.stringify(value ?? null, null, indent),
    documents: values.length,
  };
}
