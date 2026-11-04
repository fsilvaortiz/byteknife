import { describe, expect, it } from 'vitest';
import { tokenizeJson } from './highlight';

describe('tokenizeJson', () => {
  it('distingue claves, cadenas, números y literales', () => {
    expect(tokenizeJson('{"a": "x", "n": -1.5e3, "b": true, "z": null}')).toEqual([
      { type: 'plain', text: '{' },
      { type: 'key', text: '"a"' },
      { type: 'plain', text: ': ' },
      { type: 'string', text: '"x"' },
      { type: 'plain', text: ', ' },
      { type: 'key', text: '"n"' },
      { type: 'plain', text: ': ' },
      { type: 'number', text: '-1.5e3' },
      { type: 'plain', text: ', ' },
      { type: 'key', text: '"b"' },
      { type: 'plain', text: ': ' },
      { type: 'bool', text: 'true' },
      { type: 'plain', text: ', ' },
      { type: 'key', text: '"z"' },
      { type: 'plain', text: ': ' },
      { type: 'bool', text: 'null' },
      { type: 'plain', text: '}' },
    ]);
  });

  it('respeta comillas escapadas y conserva todo el texto', () => {
    const src = '[\n  "di \\"hola\\"",\n  2\n]';
    const tokens = tokenizeJson(src);
    expect(tokens.map((t) => t.text).join('')).toBe(src);
    expect(tokens).toContainEqual({ type: 'string', text: '"di \\"hola\\""' });
  });
});
