import { describe, expect, it } from 'vitest';
import { locales, messages, t, tn } from './index';

describe('i18n', () => {
  const reference = Object.keys(messages.es).sort();

  it.each(locales)('%s tiene exactamente las mismas claves que es', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(reference);
  });

  it.each(locales)('%s no tiene valores vacíos', (locale) => {
    for (const value of Object.values(messages[locale])) {
      expect(value.trim()).not.toBe('');
    }
  });
});

describe('t()', () => {
  it('interpola parámetros', () => {
    expect(t('es', 'now.weekValue', { week: '2026-W44', day: 303 })).toBe('2026-W44 · día 303');
  });

  it('deja intactos los marcadores sin valor', () => {
    expect(t('en', 'search.openIn')).toBe('Open in {name}');
  });
});

describe('tn()', () => {
  it('usa singular solo para uno', () => {
    expect(tn('es', 'unit.byte', 1)).toBe('1 byte');
    expect(tn('en', 'unit.byte', 8)).toBe('8 bytes');
    expect(tn('es', 'unit.bit', 0)).toBe('0 bits');
  });

  it('cae en .other si el idioma tiene una forma sin clave (many en es)', () => {
    expect(tn('es', 'unit.byte', 1_000_000)).toBe('1000000 bytes');
  });
});
