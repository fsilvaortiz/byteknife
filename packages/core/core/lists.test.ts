import { describe, expect, it } from 'vitest';
import { MAX_RECENTS, pushRecent, toggleIn } from './lists';

describe('toggleIn', () => {
  it('agrega al final y quita si ya estaba', () => {
    expect(toggleIn(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('pushRecent', () => {
  it('pone al frente sin duplicar', () => {
    expect(pushRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('limita la cantidad', () => {
    const many = Array.from({ length: MAX_RECENTS }, (_, i) => `t${i}`);
    const out = pushRecent(many, 'nuevo');
    expect(out).toHaveLength(MAX_RECENTS);
    expect(out[0]).toBe('nuevo');
    expect(out).not.toContain(`t${MAX_RECENTS - 1}`);
  });
});
