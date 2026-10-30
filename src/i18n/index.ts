import es from './es.json';
import en from './en.json';
import pt from './pt.json';

export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export type MessageKey = keyof typeof es;

export const messages: Record<Locale, Record<MessageKey, string>> = { es, en, pt };

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
