// Navegador: solo el idioma de la página, que Base.astro deja en #bk-messages como JSON.
// Así cada página carga un diccionario y no los tres.
import type { Locale } from './locales';
import type { Messages } from './messages';

const lang = document.documentElement.lang as Locale;
const inline = document.getElementById('bk-messages')?.textContent;

export const messages = { [lang]: inline ? JSON.parse(inline) : {} } as Record<Locale, Messages>;
