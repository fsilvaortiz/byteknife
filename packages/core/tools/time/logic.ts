import { dayOfYear, isoWeek } from '../../core/now';
export { isTimestamp } from './detect';

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

/**
 * Minutos de diferencia con UTC en esa zona y ese instante (DST incluido). Se calcula a partir
 * de la hora de pared y no con `timeZoneName: 'shortOffset'`, cuyo texto cambia entre versiones
 * de ICU («GMT» vs «GMT+0»).
 */
export function zoneOffsetMinutes(date: Date, zone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
      .formatToParts(date)
      .map((p) => [p.type, Number(p.value)]),
  ) as Record<'year' | 'month' | 'day' | 'hour' | 'minute', number>;
  const wall = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return Math.round((wall - Math.floor(date.getTime() / 60_000) * 60_000) / 60_000);
}

/** «GMT», «GMT-4», «GMT+5:30». */
export function formatOffset(minutes: number): string {
  if (minutes === 0) return 'GMT';
  const abs = Math.abs(minutes);
  const mm = abs % 60;
  return `GMT${minutes < 0 ? '-' : '+'}${Math.floor(abs / 60)}${mm ? `:${String(mm).padStart(2, '0')}` : ''}`;
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
      return [{ zone, text, offset: formatOffset(zoneOffsetMinutes(date, zone)) }];
    } catch {
      return [];
    }
  });
}
