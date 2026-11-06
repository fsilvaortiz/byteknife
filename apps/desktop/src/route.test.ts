import { describe, expect, it } from 'vitest';
import { parseRoute } from './route';

describe('parseRoute', () => {
  it('lee el idioma y la herramienta', () => {
    expect(parseRoute('#/pt/json/', 'es')).toEqual({ locale: 'pt', id: 'json' });
    expect(parseRoute('#/en/jwt', 'es')).toEqual({ locale: 'en', id: 'jwt' });
  });

  it('el inicio de un idioma no tiene herramienta', () => {
    expect(parseRoute('#/en/', 'es')).toEqual({ locale: 'en', id: null });
  });

  it('sin hash o con un idioma desconocido usa el idioma por defecto', () => {
    expect(parseRoute('', 'pt')).toEqual({ locale: 'pt', id: null });
    expect(parseRoute('#/fr/json/', 'en')).toEqual({ locale: 'en', id: null });
  });

  it('ignora ids con caracteres raros', () => {
    expect(parseRoute('#/es/..%2F/', 'es')).toEqual({ locale: 'es', id: null });
  });
});
