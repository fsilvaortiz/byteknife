// Servidor (build de Astro) y pruebas: los tres idiomas. El navegador resuelve
// #i18n/messages a messages.browser.ts (ver "imports" en package.json).
import es from './es.json';
import en from './en.json';
import pt from './pt.json';
import type { Locale } from './locales';

export type Messages = typeof es;

export const messages: Record<Locale, Messages> = { es, en, pt };
