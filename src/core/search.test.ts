import { describe, expect, it } from 'vitest';
import { t } from '../i18n';
import { tools } from './registry';
import { searchTools } from './search';
import type { ToolMeta } from './types';

const cat = (tool: ToolMeta) => t('es', `cat.${tool.category}`);
const ids = (q: string, locale: 'es' | 'en' = 'es') => searchTools(q, locale, cat).map((x) => x.id);

describe('searchTools', () => {
  it('sin consulta devuelve todas en orden de catálogo', () => {
    expect(ids('')).toHaveLength(tools.length);
    expect(ids('')[0]).toBe('json');
  });

  it('prioriza prefijo del nombre sobre coincidencia parcial', () => {
    expect(ids('json')[0]).toBe('json');
    expect(ids('json')).toContain('csv');
  });

  it('busca por keywords', () => {
    expect(ids('sha256')).toEqual(['hash']);
    expect(ids('epoch')).toEqual(['time']);
  });

  it('busca por nombre de categoría', () => {
    expect(ids('generadores')).toEqual(['uuid', 'hash', 'password', 'keypair', 'qr']);
    expect(ids('red')).toEqual(expect.arrayContaining(['cidr', 'x509']));
  });

  it('exige todas las palabras', () => {
    expect(ids('json csv')).toEqual(['csv']);
  });

  it('usa los textos del idioma pedido', () => {
    expect(ids('passwords', 'en')).toEqual(['password']);
    expect(ids('contraseñas', 'en')).toEqual([]);
  });

  it('sin coincidencias devuelve vacío', () => {
    expect(ids('zzzz')).toEqual([]);
  });
});
