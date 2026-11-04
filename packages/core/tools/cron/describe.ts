import { t, type Locale } from '../../i18n';
import type { CronDescription, CronFieldId } from './logic';

type NameStyle = 'long' | 'short';

/** Nombre del mes (1–12) en el idioma pedido. */
export const monthName = (m: number, locale: Locale, style: NameStyle = 'long') =>
  new Intl.DateTimeFormat(locale, { month: style, timeZone: 'UTC' }).format(
    Date.UTC(2026, m - 1, 1),
  );

/** Nombre del día (0 = domingo). El 4 de enero de 2026 fue domingo. */
export const weekdayName = (d: number, locale: Locale, style: NameStyle = 'long') =>
  new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(
    Date.UTC(2026, 0, 4 + d),
  );

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** «1, 2 y 5 a 9»: agrupa tramos de 3 o más consecutivos y une con la conjunción del idioma. */
export function humanList(
  values: number[],
  locale: Locale,
  name: (v: number) => string = String,
): string {
  const runs: [number, number][] = [];
  for (const v of [...values].sort((a, b) => a - b)) {
    const last = runs[runs.length - 1];
    if (last && v === last[1] + 1) last[1] = v;
    else runs.push([v, v]);
  }
  const items = runs.flatMap(([a, b]) =>
    b - a >= 2
      ? [t(locale, 'cron.desc.range', { from: name(a), to: name(b) })]
      : a === b
        ? [name(a)]
        : [name(a), name(b)],
  );
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(items);
}

function describeTime(time: CronDescription['time'], locale: Locale): string {
  const list = (v: number[]) => humanList(v, locale);
  switch (time.kind) {
    case 'everyMinute':
      return t(locale, 'cron.desc.everyMinute');
    case 'everyNMinutes':
      return t(locale, 'cron.desc.everyNMinutes', { n: time.n });
    case 'minuteOfHour':
      return t(locale, 'cron.desc.minuteOfHour', { minute: time.minute });
    case 'minuteEveryNHours':
      return t(locale, 'cron.desc.minuteEveryNHours', { minute: time.minute, n: time.n });
    case 'at':
      return t(locale, 'cron.desc.at', {
        times: new Intl.ListFormat(locale, { type: 'conjunction' }).format(time.times.map(hhmm)),
      });
    case 'minuteAtHours':
      return t(locale, 'cron.desc.minuteAtHours', { minute: time.minute, hours: list(time.hours) });
    case 'everyNMinutesAtHours':
      return t(locale, 'cron.desc.everyNMinutesAtHours', { n: time.n, hours: list(time.hours) });
    case 'everyMinuteAtHours':
      return t(locale, 'cron.desc.everyMinuteAtHours', { hours: list(time.hours) });
    case 'minutes':
      return time.hours
        ? t(locale, 'cron.desc.minutesAtHours', {
            minutes: list(time.minutes),
            hours: list(time.hours),
          })
        : t(locale, 'cron.desc.minutes', { minutes: list(time.minutes) });
  }
}

function describeWeekdays(days: number[], locale: Locale): string {
  const name = (d: number) => weekdayName(d, locale);
  const contiguous = days.length >= 3 && days.every((d, i) => i === 0 || d === days[i - 1]! + 1);
  return contiguous
    ? t(locale, 'cron.desc.weekdayRange', {
        from: name(days[0]!),
        to: name(days[days.length - 1]!),
      })
    : t(locale, 'cron.desc.weekdays', {
        list: new Intl.ListFormat(locale, { type: 'conjunction' }).format(days.map(name)),
      });
}

/** Frase completa en el idioma del usuario, terminada en punto. */
export function describeSchedule(desc: CronDescription, locale: Locale): string {
  const parts = [describeTime(desc.time, locale)];
  const days =
    desc.days &&
    (desc.days.kind === 'everyNDays'
      ? t(locale, 'cron.desc.everyNDays', { n: desc.days.n })
      : t(locale, 'cron.desc.daysOfMonth', { days: humanList(desc.days.days, locale) }));
  const weekdays = desc.weekdays && describeWeekdays(desc.weekdays, locale);
  if (days && weekdays) parts.push(t(locale, 'cron.desc.daysOr', { days, weekdays }));
  else if (days ?? weekdays) parts.push((days ?? weekdays)!);
  if (desc.months)
    parts.push(
      t(locale, 'cron.desc.months', {
        months: humanList(desc.months, locale, (m) => monthName(m, locale)),
      }),
    );
  return `${parts.join(', ')}.`;
}

/** Resumen de un campo para la tabla: «todos», «1 a 5», «lun, mié y vie». */
export function fieldSummary(
  field: CronFieldId,
  raw: string,
  values: Set<number>,
  locale: Locale,
): string {
  if (raw === '*') return t(locale, 'cron.all');
  const name =
    field === 'month'
      ? (m: number) => monthName(m, locale, 'short')
      : field === 'dayOfWeek'
        ? (d: number) => weekdayName(d, locale, 'short')
        : String;
  return humanList([...values], locale, name);
}
