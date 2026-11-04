import { describe, expect, it } from 'vitest';
import { captureNames, compile, MAX_MATCHES, runRegex, toggleFlag } from './logic';

const SAMPLE =
  'Equipo de plataforma:\n- ana.perez@acme.dev (líder)\n- bruno+alertas@ops.acme.dev\n- carla@EJEMPLO.cl\nSin correo: dario, eva@\nSoporte: soporte@acme.dev';
const EMAIL = '(?<usuario>[\\w.+-]+)@(?<dominio>[\\w-]+(?:\\.[\\w-]+)+)';

const run = (pattern: string, flags: string, text: string, replacement = '') =>
  runRegex({ pattern, flags, text, replacement });

describe('runRegex', () => {
  it('el ejemplo encuentra 4 correos con grupos con nombre y reemplaza', () => {
    const r = run(EMAIL, 'gi', SAMPLE, '$<usuario> en $<dominio>');
    if (!r.ok) throw new Error(r.error);
    expect(r.matches.map((m) => m.text)).toEqual([
      'ana.perez@acme.dev',
      'bruno+alertas@ops.acme.dev',
      'carla@EJEMPLO.cl',
      'soporte@acme.dev',
    ]);
    expect(r.groupNames).toEqual(['usuario', 'dominio']);
    expect(r.matches[2]!.groups).toEqual(['carla', 'EJEMPLO.cl']);
    expect(r.replaced).toContain('- ana.perez en acme.dev (líder)');
    expect(r.replaced).toContain('Soporte: soporte en acme.dev');
  });

  it('sin g solo la primera coincidencia y el reemplazo solo la primera', () => {
    const r = run('\\d', '', 'a1b2', '#');
    expect(r.ok && r.matches.map((m) => m.text)).toEqual(['1']);
    expect(r.ok && r.replaced).toBe('a#b2');
  });

  it('segmentos alternan la marca y conservan todo el texto', () => {
    const r = run('\\d', 'g', 'a12b');
    if (!r.ok) throw new Error();
    expect(r.segments).toEqual([
      { text: 'a' },
      { text: '1', mark: 0 },
      { text: '2', mark: 1 },
      { text: 'b' },
    ]);
  });

  it('coincidencias vacías no cuelgan ni se resaltan', () => {
    const r = run('\\b', 'g', 'hola mundo');
    if (!r.ok) throw new Error();
    expect(r.matches).toHaveLength(4);
    expect(r.segments).toEqual([{ text: 'hola mundo' }]);
  });

  it('grupos opcionales que no participan quedan undefined', () => {
    const r = run('(a)|(b)', 'g', 'b');
    expect(r.ok && r.matches[0]!.groups).toEqual([undefined, 'b']);
  });

  it('referencias $& y $1 en el reemplazo', () => {
    const r = run('(\\w+)@', 'g', 'ana@x', '[$&|$1]');
    expect(r.ok && r.replaced).toBe('[ana@|ana]x');
  });

  it('Unicode con u', () => {
    const r = run('\\p{Emoji_Presentation}', 'gu', 'ok 🚀 y 🎉');
    expect(r.ok && r.matches.map((m) => m.text)).toEqual(['🚀', '🎉']);
  });

  it('corta en el máximo de coincidencias', () => {
    const r = run('a', 'g', 'a'.repeat(MAX_MATCHES + 5));
    expect(r.ok && r.matches).toHaveLength(MAX_MATCHES);
    expect(r.ok && r.truncated).toBe(true);
  });

  it('patrón vacío no da coincidencias', () => {
    expect(run('', 'g', 'abc')).toMatchObject({ ok: true, matches: [], replaced: '' });
  });

  it('sticky (y) también funciona', () => {
    const r = run('a', 'y', 'aab');
    expect(r.ok && r.matches).toHaveLength(1);
  });
});

describe('compile', () => {
  it('quita el prefijo del mensaje de error', () => {
    const r = compile('(', '');
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).not.toMatch(/^Invalid regular expression/);
    expect(!r.ok && r.error.length).toBeGreaterThan(0);
  });

  it.each(['gg', 'x'])('flags inválidas «%s»', (flags) => {
    expect(compile('a', flags).ok).toBe(false);
    expect(run('a', flags, 'a').ok).toBe(false);
  });

  it('un patrón válido compila', () => {
    expect(compile('a', 'gi').ok).toBe(true);
  });
});

describe('captureNames', () => {
  it.each([
    ['(a)(?<x>b)(c)', [null, 'x', null]],
    ['(?:a)(?=b)(?!c)(?<=d)(?<!e)(f)', [null]],
    ['\\(no\\)[(]([)])', [null]],
    ['(?<año>\\d+)(?<π>x)', ['año', 'π']],
    ['(?<y_1>a)(?<$z>b)', ['y_1', '$z']],
    ['[\\]](x)', [null]],
  ])('%s', (pattern, names) => {
    expect(captureNames(pattern)).toEqual(names);
  });
});

describe('toggleFlag', () => {
  it.each([
    ['gi', 'm', true, 'gim'],
    ['ig', 'm', true, 'gim'],
    ['gim', 'i', false, 'gm'],
    ['g', 'g', true, 'g'],
    ['', 'u', true, 'u'],
  ] as const)('%s %s %s → %s', (flags, flag, on, out) => {
    expect(toggleFlag(flags, flag, on)).toBe(out);
  });
});
