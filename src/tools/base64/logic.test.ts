import { describe, expect, it } from 'vitest';
import { base64ToBytes, isBase64Text } from './logic';

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
