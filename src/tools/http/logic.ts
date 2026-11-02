import type { Locale } from '../../i18n';
import { HEADERS, STATUSES, type HeaderInfo, type Status } from './data';

export { isStatusCode } from './detect';
export { HEADERS, STATUSES, headerInfo } from './data';

export type StatusClass = 'info' | 'success' | 'redirect' | 'client' | 'server';

export const statusClass = (code: number): StatusClass =>
  (['info', 'success', 'redirect', 'client', 'server'] as const)[Math.floor(code / 100) - 1] ??
  'server';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Filtra por código (prefijo: «4» o «40»), nombre o descripción en el idioma dado. */
export function searchStatuses(query: string, locale: Locale): Status[] {
  const q = norm(query.trim());
  if (!q) return STATUSES;
  if (/^\d{1,3}$/.test(q)) return STATUSES.filter((st) => String(st.code).startsWith(q));
  const words = q.split(/\s+/);
  return STATUSES.filter((st) => {
    const hay = norm(`${st.code} ${st.name} ${st.text[locale]}`);
    return words.every((w) => hay.includes(w));
  });
}

export function searchHeaders(query: string, locale: Locale): HeaderInfo[] {
  const q = norm(query.trim());
  if (!q) return HEADERS;
  const words = q.split(/\s+/);
  return HEADERS.filter((x) => {
    const hay = norm(`${x.name} ${x.text[locale]}`);
    return words.every((w) => hay.includes(w));
  });
}
