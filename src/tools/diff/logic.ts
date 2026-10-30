/** Celdas máximas de la tabla LCS (≈ 2.400 × 2.400 líneas distintas). */
export const MAX_CELLS = 6_000_000;

export class DiffError extends Error {
  constructor(
    readonly code: 'tooLarge',
    readonly params: Record<string, number> = {},
  ) {
    super(code);
    this.name = 'DiffError';
  }
}

export type RowType = 'eq' | 'add' | 'del';

export interface DiffRow {
  type: RowType;
  text: string;
  /** Número de línea en el original (null en las agregadas). */
  aLine: number | null;
  /** Número de línea en el modificado (null en las eliminadas). */
  bLine: number | null;
}

export interface DiffResult {
  rows: DiffRow[];
  added: number;
  removed: number;
}

/** Normaliza CRLF/CR y trata el texto vacío como cero líneas. */
export const toLines = (s: string) => (s === '' ? [] : s.replace(/\r\n?/g, '\n').split('\n'));

/**
 * Diff por líneas con LCS. Antes recorta el prefijo y el sufijo comunes: así un archivo largo
 * con pocos cambios no llena la tabla.
 */
export function diffLines(a: string, b: string, opts: { ignoreTrailingWs: boolean }): DiffResult {
  const A = toLines(a);
  const B = toLines(b);
  const key = opts.ignoreTrailingWs ? (s: string) => s.replace(/\s+$/, '') : (s: string) => s;
  const ka = A.map(key);
  const kb = B.map(key);

  let start = 0;
  while (start < A.length && start < B.length && ka[start] === kb[start]) start++;
  let endA = A.length;
  let endB = B.length;
  while (endA > start && endB > start && ka[endA - 1] === kb[endB - 1]) {
    endA--;
    endB--;
  }

  const n = endA - start;
  const m = endB - start;
  if (n * m > MAX_CELLS)
    throw new DiffError('tooLarge', { lines: Math.floor(Math.sqrt(MAX_CELLS)) });

  // dp[i][j] = LCS de A[start+i..endA) y B[start+j..endB)
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] =
        ka[start + i] === kb[start + j]
          ? dp[i + 1]![j + 1]! + 1
          : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  const rows: DiffRow[] = [];
  const eq = (i: number, j: number) =>
    rows.push({ type: 'eq', text: B[j]!, aLine: i + 1, bLine: j + 1 });
  for (let k = 0; k < start; k++) eq(k, k);
  let i = 0;
  let j = 0;
  let added = 0;
  let removed = 0;
  while (i < n || j < m) {
    if (i < n && j < m && ka[start + i] === kb[start + j]) {
      eq(start + i++, start + j++);
    } else if (j < m && (i >= n || dp[i]![j + 1]! >= dp[i + 1]![j]!)) {
      rows.push({ type: 'add', text: B[start + j]!, aLine: null, bLine: start + j + 1 });
      j++;
      added++;
    } else {
      rows.push({ type: 'del', text: A[start + i]!, aLine: start + i + 1, bLine: null });
      i++;
      removed++;
    }
  }
  for (let k = 0; k < A.length - endA; k++) eq(endA + k, endB + k);
  return { rows, added, removed };
}
