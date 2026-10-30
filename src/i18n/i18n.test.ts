import { describe, expect, it } from 'vitest';
import { locales, messages, t } from './index';

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
