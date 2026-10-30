import { describe, expect, it } from 'vitest';
import { base64ToBytes, decodeBase64, encodeText, HEX_PREVIEW_BYTES, isBase64Text } from './logic';

const text = (b: Uint8Array) => new TextDecoder().decode(b);

describe('base64ToBytes', () => {
  it('decodifica Base64 estándar', () => {
    expect(text(base64ToBytes('aG9sYSBtdW5kbw=='))).toBe('hola mundo');
  });

  it('acepta la variante URL-safe sin relleno', () => {
    // "¿?>" en UTF-8 produce "/" y "+" en Base64 estándar
    expect(text(base64ToBytes('wr8_Pg'))).toBe('¿?>');
  });

  it('ignora espacios y saltos de línea', () => {
    expect(text(base64ToBytes('aG9s\nYSBt dW5k bw=='))).toBe('hola mundo');
  });

  it('lanza error con caracteres inválidos', () => {
    expect(() => base64ToBytes('no*es*base64')).toThrow();
  });
});

describe('isBase64Text', () => {
  it.each(['aG9sYSBtdW5kbw==', 'eyJ1c2VyIjoiYWRhIn0=', 'SG9sYSwgwr9xdcOpIHRhbD8=', 'dGVzdGluZzEy'])(
    'detecta %s',
    (s) => {
      expect(isBase64Text(s)).toBe(true);
    },
  );

  it.each([
    ['muy corto', 'aGk='],
    ['longitud no múltiplo de 4', 'aG9sYSBtdW5kbw'],
    ['alfabeto inválido', 'hola mundo!!'],
    ['bytes que no son texto', '//////////////8='],
    ['UTF-8 inválido', 'gICAgICAgICAgICA'],
    ['palabra común', 'abcdefghijkl'],
  ])('rechaza %s', (_, s) => {
    expect(isBase64Text(s)).toBe(false);
  });
});

describe('encodeText', () => {
  it('codifica UTF-8, incluidos emoji', () => {
    expect(encodeText('¡Hola! 🚀', false)).toBe('wqFIb2xhISDwn5qA');
  });

  it('URL-safe quita relleno y reemplaza + y /', () => {
    expect(encodeText('¿?>', false)).toBe('wr8/Pg==');
    expect(encodeText('¿?>', true)).toBe('wr8_Pg');
  });

  it('cadena vacía', () => {
    expect(encodeText('', false)).toBe('');
  });
});

describe('decodeBase64', () => {
  it('ida y vuelta con pares sustitutos', () => {
    const s = 'Ñandú 🚀 — x';
    expect(decodeBase64(encodeText(s, true))).toEqual({
      kind: 'text',
      text: s,
      bytes: new TextEncoder().encode(s).length,
    });
  });

  it('bytes no UTF-8 dan vista hex de 16 por línea', () => {
    const b64 = btoa(String.fromCharCode(...Array.from({ length: 18 }, (_, i) => 0xf0 + (i % 16))));
    const r = decodeBase64(b64);
    expect(r).toMatchObject({ kind: 'binary', bytes: 18, truncated: false });
    expect(r.kind === 'binary' && r.hex.split('\n')).toEqual([
      'f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fa fb fc fd fe ff',
      'f0 f1',
    ]);
  });

  it('trunca la vista hex de binarios grandes', () => {
    const big = btoa(String.fromCharCode(...new Uint8Array(HEX_PREVIEW_BYTES + 10).fill(0xff)));
    const r = decodeBase64(big);
    expect(r).toMatchObject({ kind: 'binary', bytes: HEX_PREVIEW_BYTES + 10, truncated: true });
    expect(r.kind === 'binary' && r.hex.split('\n')).toHaveLength(HEX_PREVIEW_BYTES / 16);
  });

  it('lanza error si no es Base64', () => {
    expect(() => decodeBase64('a')).toThrow();
  });
});
