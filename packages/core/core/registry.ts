import { categories, type Category, type ToolMeta } from './types';

const modules = import.meta.glob<{ meta: ToolMeta }>('../tools/*/meta.ts', { eager: true });

export const tools: ToolMeta[] = Object.values(modules)
  .map((m) => m.meta)
  .sort(
    (a, b) => categories.indexOf(a.category) - categories.indexOf(b.category) || a.order - b.order,
  );

export const toolById = new Map(tools.map((t) => [t.id, t]));

export function toolsIn(category: Category): ToolMeta[] {
  return tools.filter((t) => t.category === category);
}

/** Ruta del módulo de cada herramienta, para validar que el id coincide con la carpeta. */
export const toolModulePaths = Object.keys(modules);
