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

/** Límite de pasos de búsqueda: cubre siglos y corta las expresiones que nunca ocurren. */
const MAX_STEPS = 100_000;

/**
 * Próximas `n` ejecuciones después de `from`, en la hora local. Si día del mes y día de la
 * semana están restringidos, basta con que coincida uno (comportamiento de cron clásico).
 */
export function nextRuns(c: CronSchedule, from: Date, n: number): Date[] {
  const out: Date[] = [];
  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  const domAll = c.raw[2]!.startsWith('*');
  const dowAll = c.raw[4]!.startsWith('*');
  const dayOk = (x: Date) => {
    const dom = c.dayOfMonth.has(x.getDate());
    const dow = c.dayOfWeek.has(x.getDay());
    if (domAll && dowAll) return true;
    if (domAll) return dow;
    if (dowAll) return dom;
    return dom || dow;
  };
  for (let steps = 0; out.length < n && steps < MAX_STEPS; steps++) {
    if (!c.month.has(d.getMonth() + 1)) {
      d.setMonth(d.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
    } else if (!dayOk(d)) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
    } else if (!c.hour.has(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
    } else if (!c.minute.has(d.getMinutes())) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
    } else {
      out.push(new Date(d));
      d.setMinutes(d.getMinutes() + 1);
    }
  }
  return out;
}

export type TimeDescription =
  | { kind: 'everyMinute' }
  | { kind: 'everyNMinutes'; n: number }
  | { kind: 'minuteOfHour'; minute: number }
  | { kind: 'minuteEveryNHours'; minute: number; n: number }
  /** Minutos desde la medianoche, ordenados. */
  | { kind: 'at'; times: number[] }
  | { kind: 'minuteAtHours'; minute: number; hours: number[] }
  | { kind: 'everyNMinutesAtHours'; n: number; hours: number[] }
  | { kind: 'everyMinuteAtHours'; hours: number[] }
  | { kind: 'minutes'; minutes: number[]; hours: number[] | null };

export interface CronDescription {
  time: TimeDescription;
  days: { kind: 'everyNDays'; n: number } | { kind: 'list'; days: number[] } | null;
  /** 0 = domingo. */
  weekdays: number[] | null;
  months: number[] | null;
}

const sorted = (s: Set<number>) => [...s].sort((a, b) => a - b);

/** Estructura que la interfaz convierte en una frase en el idioma del usuario. */
export function describeCron(c: CronSchedule): CronDescription {
  const [mi, ho, dom, mo, dow] = c.raw as [string, string, string, string, string];
  const single = (s: string) => /^\d+$/.test(s);
  const step = (s: string) => Number(s.match(/^\*\/(\d+)$/)?.[1] ?? 0);
  const minute = Number(mi);
  const hours = sorted(c.hour);
  let time: TimeDescription;
  if (mi === '*' && ho === '*') time = { kind: 'everyMinute' };
  else if (step(mi) && ho === '*') time = { kind: 'everyNMinutes', n: step(mi) };
  else if (single(mi) && ho === '*') time = { kind: 'minuteOfHour', minute };
  else if (single(mi) && step(ho)) time = { kind: 'minuteEveryNHours', minute, n: step(ho) };
  else if (!/[*/-]/.test(mi + ho) && c.minute.size * c.hour.size <= 6)
    time = {
      kind: 'at',
      times: hours.flatMap((h) => sorted(c.minute).map((m) => h * 60 + m)),
    };
  else if (single(mi)) time = { kind: 'minuteAtHours', minute, hours };
  else if (step(mi)) time = { kind: 'everyNMinutesAtHours', n: step(mi), hours };
  else if (mi === '*') time = { kind: 'everyMinuteAtHours', hours };
  else time = { kind: 'minutes', minutes: sorted(c.minute), hours: ho === '*' ? null : hours };
  return {
    time,
    days:
      dom === '*'
        ? null
        : step(dom)
          ? { kind: 'everyNDays', n: step(dom) }
          : { kind: 'list', days: sorted(c.dayOfMonth) },
    weekdays: dow === '*' ? null : sorted(c.dayOfWeek),
    months: mo === '*' ? null : sorted(c.month),
  };
}
