import type { Locale } from '../i18n';

const STEPS: [limit: number, unit: Intl.RelativeTimeFormatUnit, seconds: number][] = [
  [60, 'second', 1],
  [3600, 'minute', 60],
  [86_400, 'hour', 3600],
  [2_592_000, 'day', 86_400],
  [31_536_000, 'month', 2_592_000],
  [Infinity, 'year', 31_536_000],
];

/** «hace 3 días», «in 2 hours»: la unidad más grande que no da cero. */
export function relativeTime(date: Date, now: Date, locale: Locale): string {
  const s = (date.getTime() - now.getTime()) / 1000;
  const [, unit, size] = STEPS.find(([limit]) => Math.abs(s) < limit)!;
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    Math.round(s / size),
    unit,
  );
}
