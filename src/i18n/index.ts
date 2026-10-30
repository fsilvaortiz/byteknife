import { messages, type Messages } from '#i18n/messages';
import type { Locale } from './locales';

export { defaultLocale, isLocale, locales, type Locale } from './locales';

export type MessageKey = keyof Messages;

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
