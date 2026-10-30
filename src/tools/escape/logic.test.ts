import { describe, expect, it } from 'vitest';
import { EscapeError, escapeString } from './logic';

const run = escapeString;

describe('html', () => {
  it('escapa los cinco caracteres especiales', () => {
    expect(run(`<a href="/x?a=1&b='2'">`, 'html', 'enc')).toBe(
      '&lt;a href=&quot;/x?a=1&amp;b=&#39;2&#39;&quot;&gt;',
    );
  });

  it('desescapa entidades con nombre, decimales y hexadecimales', () => {
    expect(run('&lt;p&gt; &copy; &#169; &#xA9; &#X1F680; &hellip;', 'html', 'dec')).toBe(
      '<p> © © © 🚀 …',
    );
  });

  it('decodifica un solo nivel', () => {
    expect(run('&amp;lt;', 'html', 'dec')).toBe('&lt;');
  });

  it('deja intactas las entidades desconocidas y reemplaza códigos inválidos', () => {
    expect(run('&foo; &#0; &#x110000; & sola', 'html', 'dec')).toBe('&foo; � � & sola');
  });

  it('ida y vuelta', () => {
    const s = `<a title="it's">café & "más"</a>`;
    expect(run(run(s, 'html', 'enc'), 'html', 'dec')).toBe(s);
  });
});

describe('json', () => {
  it('escapa comillas, barras y controles', () => {
    expect(run('di "hola"\n\tc:\\x', 'json', 'enc')).toBe('di \\"hola\\"\\n\\tc:\\\\x');
  });

  it('desescapa secuencias y tolera comillas sin escapar', () => {
    expect(run('di "hola" \\"ya\\" \\u00f1\\n', 'json', 'dec')).toBe('di "hola" "ya" ñ\n');
  });

  it('comillas seguidas y barra escapada antes de comilla', () => {
    expect(run('""', 'json', 'dec')).toBe('""');
    expect(run('a\\\\"b', 'json', 'dec')).toBe('a\\"b');
  });

  it('conserva saltos de línea y tabs literales', () => {
    expect(run('a\nb\tc', 'json', 'dec')).toBe('a\nb\tc');
  });

  it.each(['termina en \\', 'escape \\x raro'])('lanza EscapeError con %s', (s) => {
    expect(() => run(s, 'json', 'dec')).toThrow(EscapeError);
  });
});

describe('unicode', () => {
  it('escapa no-ASCII y tabs pero no saltos de línea', () => {
    expect(run('ñ\t🚀\nok', 'uni', 'enc')).toBe('\\u00f1\\u0009\\ud83d\\ude80\nok');
  });

  it('desescapa \\uXXXX, pares sustitutos y \\u{…}', () => {
    expect(run('\\u00F1 \\uD83D\\uDE80 \\u{1F680} \\u{41}', 'uni', 'dec')).toBe('ñ 🚀 🚀 A');
  });

  it('deja intactas secuencias incompletas', () => {
    expect(run('\\u12 \\uZZZZ', 'uni', 'dec')).toBe('\\u12 \\uZZZZ');
  });

  it('lanza EscapeError con puntos de código fuera de rango', () => {
    expect(() => run('\\u{110000}', 'uni', 'dec')).toThrow(EscapeError);
  });
});
