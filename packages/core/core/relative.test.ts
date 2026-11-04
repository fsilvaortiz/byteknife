import { describe, expect, it } from 'vitest';
import { relativeTime } from './relative';

const now = new Date('2026-10-30T12:00:00Z');
const at = (secs: number) => new Date(now.getTime() + secs * 1000);

describe('relativeTime', () => {
  it.each([
    [-30, 'en', '30 seconds ago'],
    [120, 'en', 'in 2 minutes'],
    [-3 * 3600, 'en', '3 hours ago'],
    [2 * 86_400, 'es', 'pasado mañana'],
    [-90 * 86_400, 'en', '3 months ago'],
    [3 * 31_536_000, 'pt', 'em 3 anos'],
  ] as const)('%i s en %s → %s', (secs, locale, text) => {
    expect(relativeTime(at(secs), now, locale)).toBe(text);
  });
});
