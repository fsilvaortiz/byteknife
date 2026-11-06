import { describe, expect, it } from 'vitest';
import { isInternal } from './links';

describe('isInternal', () => {
  it('solo las rutas con hash son internas', () => {
    expect(isInternal('#/es/json/')).toBe(true);
    expect(isInternal(null)).toBe(true);
    expect(isInternal('https://example.com')).toBe(false);
    expect(isInternal('/es/json/')).toBe(false);
    expect(isInternal('mailto:a@b.c')).toBe(false);
  });
});
