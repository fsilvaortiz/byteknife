export { detectJson } from './detect';

export type JsonMode = 'fmt' | 'min' | 'sort';
export type Indent = 2 | 4 | '\t';

export interface JsonPosition {
  line: number;
  column: number;
}

export interface JsonError extends JsonPosition {
  /** Mensaje del motor sin la posición (en inglés en la mayoría de navegadores). */
  detail: string;
}

export type FormatResult =
  | { ok: true; output: string; nodes: number; depth: number; bytes: number }
  | { ok: false; error: JsonError };

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** Quita el BOM que dejan algunos editores al guardar UTF-8. */
export const stripBom = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

export function sortKeys(v: Json): Json {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    const out: { [k: string]: Json } = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]!);
    return out;
  }
  return v;
}

/** Profundidad de anidamiento: un escalar es 0, `{}` y `[]` son 1. */
export function depth(v: Json): number {
  if (!v || typeof v !== 'object') return 0;
  return 1 + Math.max(0, ...Object.values(v).map(depth));
}

/** Cantidad total de valores dentro de objetos y arreglos (sin contar la raíz). */
export function countNodes(v: Json): number {
  if (!v || typeof v !== 'object') return 0;
  return Object.values(v).reduce<number>((n, x) => n + 1 + countNodes(x), 0);
}

/** Línea y columna (desde 1) de un índice dentro del texto. */
export function positionAt(src: string, index: number): JsonPosition {
  const before = src.slice(0, index).split('\n');
  return { line: before.length, column: before[before.length - 1]!.length + 1 };
}

/** Normaliza los mensajes de error de V8, Firefox y Safari a línea y columna. */
export function parseErrorPosition(err: unknown, src: string): JsonError {
  const msg = err instanceof Error ? err.message : String(err);
  const detail = msg
    .replace(/^JSON\.parse: /, '')
    .replace(
      / (?:in JSON )?at (?:position \d+|line \d+ column \d+)(?: \(line \d+ column \d+\))?.*$/,
      '',
    )
    .trim();
  let m = msg.match(/line (\d+) column (\d+)/);
  if (m) return { detail, line: Number(m[1]), column: Number(m[2]) };
  m = msg.match(/position (\d+)/);
  if (m) return { detail, ...positionAt(src, Number(m[1])) };
  // «Unexpected end of JSON input» y similares: el error está al final.
  return { detail, ...positionAt(src, src.length) };
}

export function formatJson(src: string, mode: JsonMode, indent: Indent = 2): FormatResult {
  const text = stripBom(src);
  let value: Json;
  try {
    value = JSON.parse(text) as Json;
  } catch (e) {
    return { ok: false, error: parseErrorPosition(e, text) };
  }
  if (mode === 'sort') value = sortKeys(value);
  const output = mode === 'min' ? JSON.stringify(value) : JSON.stringify(value, null, indent);
  return {
    ok: true,
    output,
    nodes: countNodes(value),
    depth: depth(value),
    bytes: new TextEncoder().encode(output).length,
  };
}
