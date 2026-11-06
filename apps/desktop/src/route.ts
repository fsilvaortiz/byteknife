import { isLocale, type Locale } from '@byteknife/core/i18n/locales';

export interface Route {
  locale: Locale;
  /** Id de la herramienta, o null para el inicio. */
  id: string | null;
}

/** Lee una ruta de la app (#/es/ o #/es/json/). Lo que no se reconoce cae en el inicio. */
export function parseRoute(hash: string, fallback: Locale): Route {
  const [locale, id] = hash.replace(/^#?\/?/, '').split('/');
  if (!isLocale(locale)) return { locale: fallback, id: null };
  return { locale, id: id && /^[a-z0-9-]+$/.test(id) ? id : null };
}
