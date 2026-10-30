import { dayOfYear, isoWeek } from '../../core/now';

export { localZone } from '../../core/now';
import { relativeTime } from '../../core/relative';
import type { Locale } from '../../i18n';

export type TimeUnit = 'now' | 's' | 'ms' | 'us' | 'ns' | 'date';

export interface ParsedTime {
  date: Date;
  unit: TimeUnit;
  /** Fecha con hora pero sin zona: el navegador la leyó en la hora local. */
  zoneless: boolean;
}

const NOW_WORDS = new Set(['', 'now', 'ahora', 'agora']);

/** Lee Unix en s, ms, µs o ns (según la cantidad de dígitos) o una fecha en texto. */
export function parseTime(raw: string, now: Date): ParsedTime | null {
  const s = raw.trim();
  if (NOW_WORDS.has(s.toLowerCase())) return { date: now, unit: 'now', zoneless: false };
  let date: Date;
  let unit: TimeUnit;
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const digits = s.replace(/^-/, '').split('.')[0]!.length;
    const n = Number(s);
    [date, unit] =
      digits <= 11
        ? [new Date(n * 1000), 's']
        : digits <= 14
          ? [new Date(n), 'ms']
          : digits <= 17
            ? [new Date(n / 1000), 'us']
            : [new Date(n / 1e6), 'ns'];
  } else {
    date = new Date(s);
    unit = 'date';
  }
  if (Number.isNaN(date.getTime())) return null;
  const zoneless = unit === 'date' && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:[\d.]+)?$/.test(s);
  return { date, unit, zoneless };
}

export type FormatId =
  'unixS' | 'unixMs' | 'iso' | 'rfc7231' | 'local' | 'relative' | 'isoWeek' | 'dayOfYear';

export function formats(date: Date, now: Date, locale: Locale): [FormatId, string][] {
  const [wy, wn] = isoWeek(date);
  return [
    ['unixS', String(Math.floor(date.getTime() / 1000))],
    ['unixMs', String(date.getTime())],
    ['iso', date.toISOString()],
    ['rfc7231', date.toUTCString()],
    ['local', date.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'long' })],
    ['relative', relativeTime(date, now, locale)],
    ['isoWeek', `${wy}-W${String(wn).padStart(2, '0')}`],
    ['dayOfYear', String(dayOfYear(date))],
  ];
}

export const DEFAULT_ZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'America/Mexico_City',
  'America/Bogota',
  'America/Santiago',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Madrid',
  'Asia/Kolkata',
  'Asia/Tokyo',
];

export interface ZoneRow {
  zone: string;
  text: string;
  /** «GMT-3», «GMT+5:30». */
  offset: string;
}

/** La fecha en cada zona; las zonas que el navegador no conoce se omiten. */
export function zoneRows(date: Date, zones: string[], locale: Locale): ZoneRow[] {
  return [...new Set(zones)].flatMap((zone) => {
    try {
      const text = new Intl.DateTimeFormat(locale, {
        timeZone: zone,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
      const offset =
        new Intl.DateTimeFormat('en', { timeZone: zone, timeZoneName: 'shortOffset' })
          .formatToParts(date)
          .find((p) => p.type === 'timeZoneName')?.value ?? '';
      return [{ zone, text, offset }];
    } catch {
      return [];
    }
  });
}

/** Detección: Unix de 10 o 13 dígitos, o una fecha ISO que el navegador entiende. */
export const isTimestamp = (input: string) =>
  /^\d{10}(\d{3})?$/.test(input) ||
  (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/.test(input) && !Number.isNaN(Date.parse(input)));
