// Sin diccionarios: lo puede importar cualquier página sin cargar textos.
export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return (locales as readonly unknown[]).includes(value);
}
