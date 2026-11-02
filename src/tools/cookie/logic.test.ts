import { describe, expect, it } from 'vitest';
import {
  audit,
  decodeValue,
  detectCookie,
  expiry,
  parseCookies,
  parseSetCookie,
  valueHint,
  type SetCookie,
} from './logic';

const keys = (line: string) => audit(parseSetCookie(line)).map((f) => `${f.level}:${f.key}`);
const NOW = new Date('2026-10-31T12:00:00Z');

describe('parseSetCookie', () => {
  it('todos los atributos', () => {
    expect(
      parseSetCookie(
        'Set-Cookie: __Host-sid="a%20b"; Path=/; Secure; HttpOnly; SameSite=lax; Max-Age=3600; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Partitioned; Priority=High; Domain=x.dev; Foo',
      ),
    ).toEqual({
      name: '__Host-sid',
      value: 'a%20b',
      expires: new Date('2026-10-21T07:28:00Z'),
      maxAge: 3600,
      domain: 'x.dev',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Lax',
      partitioned: true,
      priority: 'High',
      unknown: ['Foo'],
    });
  });

  it('valores raros', () => {
    const c = parseSetCookie('solo; Expires=nunca; Max-Age=x; SameSite=Medio;;');
    expect(c).toMatchObject({
      name: '',
      value: 'solo',
      expires: null,
      maxAge: null,
      sameSite: null,
    });
    expect(c.unknown).toEqual(['SameSite=Medio']);
    expect(parseSetCookie('a=1; SameSite=Strict').sameSite).toBe('Strict');
    expect(parseSetCookie('a=1; SameSite=None').sameSite).toBe('None');
  });
});

describe('parseCookies', () => {
  it('mezcla Set-Cookie y Cookie', () => {
    const p = parseCookies(
      'Cookie: a=1; tema=oscuro%20total; suelto\nSet-Cookie: b=2; Secure\r\n\nc=3; Path=/',
    );
    expect(p.pairs).toEqual([
      ['a', '1'],
      ['tema', 'oscuro total'],
      ['', 'suelto'],
    ]);
    expect(p.setCookies.map((c) => c.name)).toEqual(['b', 'c']);
  });

  it('decodeValue tolera % sueltos', () => {
    expect(decodeValue('100%')).toBe('100%');
  });
});

describe('expiry', () => {
  const c = (over: Partial<SetCookie>) => ({ ...parseSetCookie('a=1'), ...over });
  it.each([
    [{}, 'session'],
    [{ maxAge: 0 }, 'deleted'],
    [{ maxAge: 60 }, 'at'],
    [{ expires: new Date('2020-01-01') }, 'deleted'],
    [{ expires: new Date('2030-01-01') }, 'at'],
  ])('%j → %s', (over, kind) => {
    expect(expiry(c(over), NOW).kind).toBe(kind);
  });
  it('Max-Age manda sobre Expires', () => {
    expect(expiry(c({ maxAge: 60, expires: new Date('2020-01-01') }), NOW).date).toEqual(
      new Date('2026-10-31T12:01:00Z'),
    );
  });
});

describe('audit', () => {
  it('cookie bien configurada', () => {
    expect(keys('__Host-sid=1; Path=/; Secure; HttpOnly; SameSite=Lax')).toEqual(['ok:good']);
  });

  it.each([
    ['=1; Secure; HttpOnly; SameSite=Lax', 'bad:noName'],
    ['__Host-x=1; Secure; Path=/app; HttpOnly; SameSite=Lax', 'bad:hostPrefix'],
    ['__Secure-x=1; HttpOnly; SameSite=Lax', 'bad:securePrefix'],
    ['x=1; SameSite=None; HttpOnly', 'bad:noneWithoutSecure'],
    ['x=1; Partitioned; HttpOnly; SameSite=Lax', 'bad:partitionedWithoutSecure'],
    ['tema=oscuro; Secure; SameSite=Lax', 'info:noHttpOnly'],
    ['session=1; Secure; SameSite=Lax', 'warn:noHttpOnly'],
    ['x=1; Secure; HttpOnly', 'info:noSameSite'],
    ['x=1; Secure; HttpOnly; SameSite=Lax; Domain=.x.dev', 'info:domain'],
    ['x=1; Secure; HttpOnly; SameSite=Lax; Raro', 'warn:unknown'],
  ])('%s → %s', (line, key) => {
    expect(keys(line)).toContain(key);
  });
});

describe('valueHint y detección', () => {
  it('valueHint', () => {
    expect(valueHint('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc')).toBe('jwt');
    expect(valueHint('a%20b')).toBe('encoded');
    expect(valueHint('plain')).toBeNull();
  });

  it.each([
    ['Set-Cookie: a=1', 'setCookie'],
    ['cookie: a=1; b=2', 'cookie'],
    ['sid=1; Path=/; HttpOnly', 'setCookie'],
    ['a=1', null],
    ['hola', null],
  ])('detectCookie(%j) = %s', (s, r) => {
    expect(detectCookie(s)).toBe(r);
  });
});
