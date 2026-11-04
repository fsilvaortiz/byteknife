import type { Plugin } from 'vite';

/** La base OUI como texto: «PREFIJO<TAB>Fabricante» por línea, ordenada. */
export function ouiText(): string;
/** Plugin de Vite que sirve el módulo virtual «virtual:oui». */
export default function ouiData(): Plugin;
