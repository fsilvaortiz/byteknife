import { describe, expect, it } from 'vitest';
import { parseVisit, visitFor } from './visit';

describe('parseVisit', () => {
  it('acepta rutas del sitio y normaliza el dominio de origen', () => {
    expect(parseVisit({ p: '/es/json/', r: 'News.YCombinator.com' })).toEqual({
      path: '/es/json/',
      ref: 'news.ycombinator.com',
    });
    expect(parseVisit({ p: '/' })).toEqual({ path: '/', ref: '' });
    expect(parseVisit({ p: '/pt/' })).toEqual({ path: '/pt/', ref: '' });
  });

  it('descarta rutas que no son páginas del sitio', () => {
    for (const p of ['/es/json', '/de/', '/es/a/b/', '/es/json/?q=secreto', 'https://x.dev/', 42]) {
      expect(parseVisit({ p }), String(p)).toBeNull();
    }
    expect(parseVisit(null)).toBeNull();
    expect(parseVisit('x')).toBeNull();
  });

  it('descarta un origen que no es un dominio', () => {
    for (const r of ['localhost', 'a b.com', 'x'.repeat(250) + '.com', 7]) {
      expect(parseVisit({ p: '/', r })?.ref).toBe('');
    }
  });
});

describe('visitFor', () => {
  it('envía solo el dominio de un origen externo', () => {
    expect(
      visitFor('/en/', 'https://www.reddit.com/r/webdev/comments/1?x=1', 'byteknife.dev'),
    ).toEqual({
      path: '/en/',
      ref: 'www.reddit.com',
    });
  });

  it('una navegación interna o sin origen no tiene ref', () => {
    expect(visitFor('/es/', 'https://byteknife.dev/es/json/', 'byteknife.dev').ref).toBe('');
    expect(visitFor('/es/', '', 'byteknife.dev').ref).toBe('');
    expect(visitFor('/es/', 'no es url', 'byteknife.dev').ref).toBe('');
  });
});
