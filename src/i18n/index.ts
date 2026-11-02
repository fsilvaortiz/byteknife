import { messages, type Messages } from '#i18n/messages';
import type { Locale } from './locales';

export { defaultLocale, isLocale, locales, type Locale } from './locales';

export type MessageKey = keyof Messages;

/** Claves con formas de plural: existe `<clave>.other` y, opcionalmente, `.one`, `.many`… */
export type PluralKey = {
  [K in MessageKey]: K extends `${infer B}.other` ? B : never;
}[MessageKey];

export { messages };

export function t(
  locale: Locale,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m,
  );
}

/** Como t(), pero elige la forma de plural de `count` según el idioma (Intl.PluralRules). */
export function tn(
  locale: Locale,
  key: PluralKey,
  count: number,
  params: Record<string, string | number> = {},
): string {
  const form = `${key}.${new Intl.PluralRules(locale).select(count)}`;
  const k = (form in messages[locale] ? form : `${key}.other`) as MessageKey;
  return t(locale, k, { count, ...params });
}
