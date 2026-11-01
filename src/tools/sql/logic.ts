export { looksLikeSql } from './detect';

export const DIALECTS = [
  'sql',
  'postgresql',
  'mysql',
  'mariadb',
  'sqlite',
  'transactsql',
  'plsql',
  'bigquery',
  'snowflake',
  'redshift',
  'spark',
  'trino',
  'duckdb',
  'clickhouse',
] as const;
export type Dialect = (typeof DIALECTS)[number];

export type KeywordCase = 'upper' | 'lower' | 'preserve';

export interface SqlOptions {
  dialect: Dialect;
  keywordCase: KeywordCase;
  indent: 2 | 4;
}

export type SqlResult =
  | { ok: true; output: string; statements: number }
  | { ok: false; detail: string; line: number | null; column: number | null };

/** sql-formatter se carga solo al formatear: no pesa en la página. */
const load = () => import('sql-formatter');

export async function formatSql(src: string, opts: SqlOptions): Promise<SqlResult> {
  const { format } = await load();
  try {
    const output = format(src, {
      language: opts.dialect,
      keywordCase: opts.keywordCase,
      dataTypeCase: opts.keywordCase,
      functionCase: opts.keywordCase,
      tabWidth: opts.indent,
      linesBetweenQueries: 1,
    });
    return { ok: true, output, statements: countStatements(output) };
  } catch (e) {
    return parseError(e);
  }
}

/** Primera línea del error de sql-formatter, sin la posición, más línea y columna. */
export function parseError(e: unknown): SqlResult & { ok: false } {
  const first = (e instanceof Error ? e.message : String(e)).split('\n')[0]!;
  const m = first.match(/ at line (\d+) column (\d+)\.?$/);
  return {
    ok: false,
    detail: first.replace(/ at line \d+ column \d+\.?$/, '').replace(/^Parse error:? ?/, ''),
    line: m ? Number(m[1]) : null,
    column: m ? Number(m[2]) : null,
  };
}

/** Sentencias en la salida formateada: líneas que terminan en «;» más la última sin «;». */
export function countStatements(formatted: string): number {
  const text = formatted.trim();
  if (!text) return 0;
  const ends = text.split('\n').filter((l) => /;\s*$/.test(l)).length;
  return text.endsWith(';') ? ends : ends + 1;
}
