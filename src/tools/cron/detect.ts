// Parser y detección para el home y la búsqueda. Va aparte de logic.ts (próximas
// ejecuciones y descripción) para que el registro no los cargue en cada página.

export type CronFieldId = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

export type CronErrorCode =
  'fieldCount' | 'invalidValue' | 'outOfRange' | 'invalidStep' | 'invertedRange';

/** Error con código y parámetros: la interfaz arma el mensaje en el idioma del usuario. */
export class CronError extends Error {
  constructor(
    readonly code: CronErrorCode,
    readonly params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = 'CronError';
  }
}

interface FieldSpec {
  id: CronFieldId;
  min: number;
  max: number;
  names?: string[];
  nameOffset?: number;
}

const FIELDS: FieldSpec[] = [
  { id: 'minute', min: 0, max: 59 },
  { id: 'hour', min: 0, max: 23 },
  { id: 'dayOfMonth', min: 1, max: 31 },
  {
    id: 'month',
    min: 1,
    max: 12,
    names: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    nameOffset: 1,
  },
  {
    id: 'dayOfWeek',
    min: 0,
    max: 7,
    names: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    nameOffset: 0,
  },
];

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

function parseValue(token: string, f: FieldSpec): number {
  if (f.names) {
    const i = f.names.indexOf(token.toUpperCase());
    if (i >= 0) return i + (f.nameOffset ?? 0);
  }
  if (!/^\d+$/.test(token)) throw new CronError('invalidValue', { field: f.id, value: token });
  const n = Number(token);
  if (n < f.min || n > f.max)
    throw new CronError('outOfRange', { field: f.id, value: n, min: f.min, max: f.max });
  return n;
}

function parseField(str: string, f: FieldSpec): Set<number> {
  const set = new Set<number>();
  for (const part of str.split(',')) {
    const [range = '', stepText] = part.split('/');
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1)
      throw new CronError('invalidStep', { field: f.id, value: stepText ?? '' });
    let lo: number;
    let hi: number;
    if (range === '*') {
      lo = f.min;
      hi = f.max;
    } else {
      const [a = '', b] = range.split('-');
      lo = parseValue(a, f);
      hi = b === undefined ? (stepText !== undefined ? f.max : lo) : parseValue(b, f);
    }
    if (lo > hi) throw new CronError('invertedRange', { field: f.id, value: range });
    for (let v = lo; v <= hi; v += step) set.add(f.id === 'dayOfWeek' && v === 7 ? 0 : v);
  }
  return set;
}

export interface CronSchedule {
  raw: string[];
  minute: Set<number>;
  hour: Set<number>;
  dayOfMonth: Set<number>;
  month: Set<number>;
  dayOfWeek: Set<number>;
}

export function parseCron(expr: string): CronSchedule {
  let e = expr.trim().toLowerCase();
  e = MACROS[e] ?? e;
  const parts = e.split(/\s+/);
  if (parts.length !== 5) throw new CronError('fieldCount', { count: parts.length });
  const [minute, hour, dayOfMonth, month, dayOfWeek] = FIELDS.map((f, i) =>
    parseField(parts[i]!, f),
  ) as [Set<number>, Set<number>, Set<number>, Set<number>, Set<number>];
  return { raw: parts, minute, hour, dayOfMonth, month, dayOfWeek };
}

/** Detección: macro conocida, o 5 campos con al menos un comodín o paso, y que parsee. */
export function isCronExpression(s: string): boolean {
  const looksLike =
    /^@(yearly|annually|monthly|weekly|daily|midnight|hourly)$/i.test(s) ||
    (/^([\d*/,\-a-z]+\s+){4}[\d*/,\-a-z]+$/i.test(s) && /[*/]/.test(s));
  if (!looksLike) return false;
  try {
    parseCron(s);
    return true;
  } catch {
    return false;
  }
}

export const CRON_FIELDS: readonly CronFieldId[] = FIELDS.map((f) => f.id);
