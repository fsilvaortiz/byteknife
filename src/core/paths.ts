import type { Locale } from '../i18n';

export const homePath = (locale: Locale) => `/${locale}/`;
export const toolPath = (locale: Locale, id: string) => `/${locale}/${id}/`;
