import { describe, expect, it } from 'vitest';
import { isHttpUrl, parseUrl, transformUrl, UrlError } from './logic';

describe('transformUrl', () => {
  it('decodifica con + como espacio', () => {
    expect(transformUrl('caf%C3%A9+con+leche', 'dec')).toBe('café con leche');
  });

  it('codifica un componente', () => {
    expect(transformUrl('a b&c=ñ/', 'enc')).toBe('a%20b%26c%3D%C3%B1%2F');
  });

  it('codifica una URL completa sin tocar los separadores', () => {
    expect(transformUrl('https://x.dev/a b?q=ñ&r=1', 'encu')).toBe(
      'https://x.dev/a%20b?q=%C3%B1&r=1',
    );
  });

  it.each(['100%', '%E0%A4%A', '%zz'])('lanza UrlError con %s', (s) => {
    expect(() => transformUrl(s, 'dec')).toThrow(UrlError);
  });

  it('lanza UrlError con sustitutos sueltos al codificar', () => {
    expect(() => transformUrl('\uD800', 'enc')).toThrow(UrlError);
  });
});

describe('parseUrl', () => {
  it('desglosa partes y parámetros', () => {
    expect(parseUrl('https://api.ejemplo.dev:8443/v2/caf%C3%A9?campos=a%2Cb&q=x+y#perfil')).toEqual(
      {
        protocol: 'https:',
        host: 'api.ejemplo.dev',
        port: '8443',
        path: '/v2/café',
        hash: '#perfil',
        origin: 'https://api.ejemplo.dev:8443',
        params: [
          ['campos', 'a,b'],
          ['q', 'x y'],
        ],
      },
    );
  });

  it('puerto por defecto, sin fragmento y parámetros repetidos', () => {
    expect(parseUrl('  https://x.dev/?a=1&a=2  ')).toMatchObject({
      port: '',
      hash: '',
      params: [
        ['a', '1'],
        ['a', '2'],
      ],
    });
  });

  it('IPv6 e IDN', () => {
    expect(parseUrl('http://[::1]:3000/')?.host).toBe('[::1]');
    expect(parseUrl('https://ñandú.dev/')?.host).toBe('xn--and-6ma2c.dev');
  });

  it('deja la ruta tal cual si tiene un % suelto', () => {
    expect(parseUrl('https://x.dev/100%')?.path).toBe('/100%');
  });

  it('null si no es una URL absoluta', () => {
    expect(parseUrl('/solo/ruta')).toBeNull();
  });
});

describe('isHttpUrl', () => {
  it.each([
    ['https://x.dev', true],
    ['HTTP://x.dev/a?b', true],
    ['ftp://x.dev', false],
    ['https://x.dev con espacio', false],
  ])('%s → %s', (s, r) => {
    expect(isHttpUrl(s)).toBe(r);
  });
});
