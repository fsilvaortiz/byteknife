import { describe, expect, it } from 'vitest';
import { pickLocale } from './locale';

describe('pickLocale', () => {
  it('respeta la elección guardada por encima del navegador', () => {
    expect(pickLocale('pt', ['es-CL', 'en'])).toBe('pt');
  });

  it('ignora una elección guardada que no es un idioma', () => {
    expect(pickLocale('fr', ['es-CL'])).toBe('es');
    expect(pickLocale(null, ['es-CL'])).toBe('es');
  });

  it('toma el primer idioma soportado del navegador, sin importar la región', () => {
    expect(pickLocale(null, ['de-DE', 'pt-BR', 'es'])).toBe('pt');
    expect(pickLocale(null, ['ES-419'])).toBe('es');
  });

  it('usa inglés si el navegador no pide ningún idioma soportado', () => {
    expect(pickLocale(null, ['de', 'fr-FR'])).toBe('en');
    expect(pickLocale(undefined, [])).toBe('en');
  });
});
