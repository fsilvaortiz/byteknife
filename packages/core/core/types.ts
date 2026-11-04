import type { Locale } from '../i18n';

export const categories = ['data', 'encoding', 'generators', 'time', 'text', 'web', 'net'] as const;
export type Category = (typeof categories)[number];

export interface ToolText {
  name: string;
  description: string;
  keywords: string[];
  /** Textos de las etiquetas que devuelve detect(), por clave. */
  labels?: Record<string, string>;
}

export interface Detection {
  /** Clave dentro de i18n[locale].labels. */
  label: string;
  /** 0–1. La herramienta con mayor confianza se abre al presionar Enter. */
  confidence: number;
}

export interface ToolMeta {
  id: string;
  category: Category;
  /** Posición dentro de su categoría en el catálogo y el rail. */
  order: number;
  i18n: Record<Locale, ToolText>;
  detect?: (input: string) => Detection | null;
  heavy?: boolean;
}

export interface ToolProps {
  locale: Locale;
  /** Lo que el usuario pegó en el home o la búsqueda; null = abrir con el ejemplo. */
  initialInput: string | null;
  /**
   * Las herramientas que exportan `waitsForResult = true` lo llaman cuando muestran su
   * primer resultado (que llega con una librería cargada aparte o con Web Crypto).
   */
  onReady?: () => void;
}
