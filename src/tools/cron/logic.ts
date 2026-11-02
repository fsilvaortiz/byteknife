import type { CronSchedule } from './detect';
export * from './detect';

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
