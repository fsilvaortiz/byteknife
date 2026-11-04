import { isLocale, type Locale } from '../i18n/locales';

/** Idioma para quien no eligió ninguno y cuyo navegador no pide es ni pt. */
export const fallbackLocale: Locale = 'en';

/**
 * Idioma al que redirige la raíz: la elección guardada y, si no hay, el primero de
 * navigator.languages que tengamos ("pt-BR" → pt, "es-419" → es).
 */
export function pickLocale(saved: unknown, languages: readonly string[]): Locale {
  if (isLocale(saved)) return saved;
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return fallbackLocale;
}
