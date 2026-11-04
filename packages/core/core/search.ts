import type { Locale } from '../i18n';
import { tools as allTools } from './registry';
import type { ToolMeta } from './types';

/** Filtra y ordena herramientas: prefijo del nombre > nombre contiene > todas las palabras en nombre/keywords. */
export function searchTools(
  query: string,
  locale: Locale,
  categoryName: (t: ToolMeta) => string,
  tools: ToolMeta[] = allTools,
): ToolMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...tools];
  const words = q.split(/\s+/);
  return tools
    .map((t) => {
      const text = t.i18n[locale];
      const name = text.name.toLowerCase();
      const haystack = [name, ...text.keywords, t.id, categoryName(t)].join(' ').toLowerCase();
      const score = name.startsWith(q)
        ? 3
        : name.includes(q)
          ? 2
          : words.every((w) => haystack.includes(w))
            ? 1
            : 0;
      return { t, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t);
}
