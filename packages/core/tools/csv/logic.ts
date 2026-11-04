import { parseErrorPosition, stripBom, type JsonError } from '../json/logic';

export type CsvErrorCode = 'unclosedQuote';

/** Error con código: la interfaz arma el mensaje en el idioma del usuario. */
export class CsvError extends Error {
  constructor(
    readonly code: CsvErrorCode,
    readonly params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = 'CsvError';
  }
}

/** Celda CSV: entre comillas si contiene comillas, saltos o el delimitador. */
export function csvCell(v: unknown, delim: string): string {
  if (v == null) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /["\n\r]/.test(s) || s.includes(delim) ? `"${s.replace(/"/g, '""')}"` : s;
}

export type JsonToCsvResult =
  { ok: true; csv: string; rows: number; cols: number } | { ok: false; error: JsonError };

/** Fallback de encabezado para arreglos de escalares. */
export const VALUE_COLUMN = 'value';

export function jsonToCsv(src: string, delim: string): JsonToCsvResult {
  const text = stripBom(src);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: parseErrorPosition(e, text) };
  }
  const rows = Array.isArray(data) ? data : [data];
  const isObj = (o: unknown): o is Record<string, unknown> =>
    o !== null && typeof o === 'object' && !Array.isArray(o);
  const heads = [...new Set(rows.flatMap((o) => (isObj(o) ? Object.keys(o) : [VALUE_COLUMN])))];
  const lines = [
    heads.map((h) => csvCell(h, delim)).join(delim),
    ...rows.map((o) =>
      heads.map((h) => csvCell(isObj(o) ? o[h] : h === VALUE_COLUMN ? o : '', delim)).join(delim),
    ),
  ];
  return { ok: true, csv: lines.join('\n'), rows: rows.length, cols: heads.length };
}

/** Parser RFC 4180: comillas dobles, "" escapado, saltos dentro de comillas, CRLF. */
export function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let quoteLine = 0;
  let line = 1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '\n') line++;
    if (quoted) {
      if (c !== '"') field += c;
      else if (text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = false;
    } else if (c === '"') {
      quoted = true;
      quoteLine = line;
    } else if (c === delim) {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (quoted) throw new CsvError('unclosedQuote', { line: quoteLine });
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Números sin ceros a la izquierda (`007` queda como texto), booleanos y vacío → null. */
export function castCell(s: string): string | number | boolean | null {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(s) && !/^-?0\d/.test(s)) return Number(s);
  return s;
}

export function csvToJson(
  text: string,
  delim: string,
  castTypes: boolean,
): Record<string, unknown>[] {
  const rows = parseCsv(stripBom(text), delim).filter((r) => r.some((c) => c !== ''));
  const [head, ...body] = rows;
  if (!head) return [];
  return body.map((r) => {
    const o: Record<string, unknown> = {};
    head.forEach((k, i) => {
      const cell = r[i] ?? '';
      o[k] = castTypes ? castCell(cell) : cell;
    });
    return o;
  });
}
