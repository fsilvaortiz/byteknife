import type { Locale } from '../i18n';

// La web usa rutas reales (/es/json/). La app de escritorio es una SPA y define
// VITE_BK_ROUTE_PREFIX='#': sus rutas son #/es/json/ y navegar solo cambia el hash.
const PREFIX: string = import.meta.env.VITE_BK_ROUTE_PREFIX ?? '';

export const homePath = (locale: Locale) => `${PREFIX}/${locale}/`;
export const toolPath = (locale: Locale, id: string) => `${PREFIX}/${locale}/${id}/`;
