import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { locales } from '../i18n';
import { toolById, toolModulePaths, tools, toolsIn } from './registry';
import { categories } from './types';

describe('registro de herramientas', () => {
  it('descubre todas las carpetas de src/tools con meta.ts', () => {
    const dir = join(import.meta.dirname, '..', 'tools');
    const folders = readdirSync(dir).filter((id) => existsSync(join(dir, id, 'meta.ts')));
    expect(tools.map((t) => t.id).sort()).toEqual(folders.sort());
    expect(tools.length).toBeGreaterThanOrEqual(16);
  });

  it('cada id es único y coincide con su carpeta', () => {
    expect(new Set(tools.map((t) => t.id)).size).toBe(tools.length);
    for (const path of toolModulePaths) {
      const folder = path.split('/').at(-2)!;
      expect(toolById.get(folder)?.id).toBe(folder);
    }
  });

  it('los ids sirven como segmento de URL', () => {
    for (const t of tools) expect(t.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('ordena por categoría y luego por order', () => {
    const order = tools.map((t) => `${categories.indexOf(t.category)}.${t.order}`);
    expect(order).toEqual([...order].sort());
    expect(
      toolsIn('data')
        .map((t) => t.id)
        .slice(0, 2),
    ).toEqual(['json', 'csv']);
  });

  it.each(locales)('todas tienen nombre, descripción y keywords en %s', (locale) => {
    for (const t of tools) {
      const text = t.i18n[locale];
      expect(text.name.trim(), t.id).not.toBe('');
      expect(text.description.trim(), t.id).not.toBe('');
      expect(text.keywords.length, t.id).toBeGreaterThan(0);
    }
  });

  it('las etiquetas de detección existen en todos los idiomas', () => {
    for (const t of tools) {
      const keys = Object.keys(t.i18n.es.labels ?? {}).sort();
      if (t.detect) expect(keys.length, t.id).toBeGreaterThan(0);
      for (const locale of locales) {
        expect(Object.keys(t.i18n[locale].labels ?? {}).sort(), `${t.id}/${locale}`).toEqual(keys);
      }
    }
  });
});
