import es from './es.json';
import en from './en.json';
import pt from './pt.json';

export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export type MessageKey = keyof typeof es;

export const messages: Record<Locale, Record<MessageKey, string>> = { es, en, pt };

export function t(
  locale: Locale,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m,
  );
}

export function isLocale(value: unknown): value is Locale {
  return (locales as readonly unknown[]).includes(value);
}
