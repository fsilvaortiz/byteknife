import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/locales';

// El esquema (src/content.config.ts) valida el frontmatter al compilar; aquí se revisa lo
// que el esquema no ve: que exista cada idioma y que la explicación tenga 150–300 palabras.
const TOOLS = join(import.meta.dirname, '..', 'tools');
const ids = readdirSync(TOOLS).filter((id) => existsSync(join(TOOLS, id, 'meta.ts')));

const body = (file: string) => readFileSync(file, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
const words = (text: string) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

describe.each(ids)('contenido de %s', (id) => {
  it.each(locales)('%s existe y explica la herramienta en 150–300 palabras', (locale) => {
    const file = join(TOOLS, id, 'content', `${locale}.md`);
    expect(existsSync(file), `falta ${file}`).toBe(true);
    const n = words(body(file));
    expect(n).toBeGreaterThanOrEqual(150);
    expect(n).toBeLessThanOrEqual(300);
  });
});
