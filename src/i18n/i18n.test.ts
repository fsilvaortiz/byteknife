import { describe, expect, it } from 'vitest';
import { locales, messages } from './index';

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
