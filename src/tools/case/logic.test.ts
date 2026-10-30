import { describe, expect, it } from 'vitest';
import { capitalize, convertCase, splitWords } from './logic';

describe('splitWords', () => {
  it.each([
    [
      'Fecha de última sincronización HTTPResponse',
      true,
      ['Fecha', 'de', 'ultima', 'sincronizacion', 'HTTP', 'Response'],
    ],
    ['parseXMLHttpRequest', false, ['parse', 'XML', 'Http', 'Request']],
    ['v2Api_items-count', false, ['v2', 'Api', 'items', 'count']],
    ['año_nuevo', false, ['año', 'nuevo']],
    ['año_nuevo', true, ['ano', 'nuevo']],
    ['hola 🚀 mundo!!', false, ['hola', 'mundo']],
    ['  ', false, []],
    ['ID', false, ['ID']],
  ])('%s (sin acentos: %s)', (s, strip, words) => {
    expect(splitWords(s, strip)).toEqual(words);
  });

  it('normaliza formas descompuestas aunque no se quiten acentos', () => {
    expect(splitWords('café', false)).toEqual(['café']);
  });
});

describe('convertCase', () => {
  it('el ejemplo del prototipo', () => {
    expect(convertCase('Fecha de última sincronización HTTPResponse', true)).toEqual({
      camel: 'fechaDeUltimaSincronizacionHttpResponse',
      pascal: 'FechaDeUltimaSincronizacionHttpResponse',
      snake: 'fecha_de_ultima_sincronizacion_http_response',
      constant: 'FECHA_DE_ULTIMA_SINCRONIZACION_HTTP_RESPONSE',
      kebab: 'fecha-de-ultima-sincronizacion-http-response',
      dot: 'fecha.de.ultima.sincronizacion.http.response',
      path: 'fecha/de/ultima/sincronizacion/http/response',
      title: 'Fecha De Ultima Sincronizacion Http Response',
      sentence: 'Fecha de ultima sincronizacion http response',
      lower: 'fecha de ultima sincronizacion http response',
      upper: 'FECHA DE ULTIMA SINCRONIZACION HTTP RESPONSE',
    });
  });

  it('conserva acentos si se pide', () => {
    expect(convertCase('última versión', false).camel).toBe('últimaVersión');
  });

  it('ß se expande en mayúsculas', () => {
    expect(convertCase('straße', false).constant).toBe('STRASSE');
  });

  it('vacío da cadenas vacías', () => {
    expect(Object.values(convertCase('', true)).every((v) => v === '')).toBe(true);
  });
});

describe('capitalize', () => {
  it('respeta caracteres fuera del BMP y cadenas vacías', () => {
    expect(capitalize('𐐨ab')).toBe('𐐀ab');
    expect(capitalize('')).toBe('');
    expect(capitalize('hOLA')).toBe('Hola');
  });
});
