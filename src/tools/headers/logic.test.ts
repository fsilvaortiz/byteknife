import { describe, expect, it } from 'vitest';
import {
  audit,
  cacheSummary,
  get,
  headerInfo,
  looksLikeHeaders,
  parseMessage,
  statusName,
} from './logic';

const RESPONSE = `HTTP/2 200
date: Sat, 31 Oct 2026 12:00:00 GMT
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; frame-ancestors 'none'
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
server: cloudflare
set-cookie: sid=abc; Path=/; Secure; HttpOnly; SameSite=Lax

<!doctype html>
x-falso: no es cabecera`;

const keys = (m: string) => audit(parseMessage(m)).map((f) => `${f.level}:${f.key}`);

describe('parseMessage', () => {
  it('respuesta con línea de estado y cuerpo', () => {
    const m = parseMessage(RESPONSE);
    expect(m.kind).toBe('response');
    expect(m.status).toBe(200);
    expect(m.startLine).toBe('HTTP/2 200');
    expect(m.headers).toHaveLength(9);
    expect(get(m, 'Content-Type')).toBe('text/html; charset=utf-8');
    expect(get(m, 'x-falso')).toBeNull();
  });

  it('petición, CRLF, líneas vacías al inicio y continuación obsoleta', () => {
    const m = parseMessage(
      '\r\nGET /api HTTP/1.1\r\nHost: x.dev\r\nX-Largo: uno\r\n  dos\r\nbasura sin dos puntos\r\n',
    );
    expect(m).toEqual({
      kind: 'request',
      startLine: 'GET /api HTTP/1.1',
      status: null,
      headers: [
        { name: 'Host', value: 'x.dev' },
        { name: 'X-Largo', value: 'uno dos' },
      ],
    });
  });

  it('sin línea inicial: deduce el tipo por las cabeceras', () => {
    expect(parseMessage('Server: nginx\nContent-Type: a').kind).toBe('response');
    expect(parseMessage('Host: x\nAccept: */*').kind).toBe('request');
    expect(parseMessage('X-A: 1').kind).toBe('unknown');
  });
});

describe('audit', () => {
  it('una respuesta bien configurada', () => {
    expect(keys(RESPONSE)).toEqual(['ok:hstsOk', 'ok:cspOk', 'info:cache.maxAge']);
  });

  it('una respuesta sin cabeceras de seguridad', () => {
    expect(
      keys(
        'HTTP/1.1 200 OK\nServer: Apache/2.4.41 (Ubuntu)\nX-Powered-By: PHP/8.1\nSet-Cookie: PHPSESSID=1; path=/\nAccess-Control-Allow-Origin: *',
      ),
    ).toEqual([
      'bad:hstsMissing',
      'bad:cspMissing',
      'warn:nosniffMissing',
      'warn:framingMissing',
      'warn:referrerMissing',
      'warn:serverVersion',
      'warn:poweredBy',
      'warn:cookieFlags',
      'info:corsAny',
      'info:cache.none',
    ]);
  });

  it('HSTS corto, CSP solo report, X-Frame-Options y CORS con credenciales', () => {
    const f = audit(
      parseMessage(
        'HTTP/1.1 200 OK\nStrict-Transport-Security: max-age=86400\nContent-Security-Policy-Report-Only: x\nX-Frame-Options: DENY\nAccess-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true\nCache-Control: no-store',
      ),
    );
    expect(f).toContainEqual({ level: 'warn', key: 'hstsShort', params: { days: 1 } });
    expect(f.map((x) => x.key)).toContain('cspReportOnly');
    expect(f.map((x) => x.key)).not.toContain('framingMissing');
    expect(f.map((x) => x.key)).toContain('corsCredentials');
    expect(f.map((x) => x.key)).toContain('cache.noStore');
  });

  it('las peticiones no se auditan', () => {
    expect(audit(parseMessage('GET / HTTP/1.1\nHost: x'))).toEqual([]);
  });
});

describe('cacheSummary', () => {
  const cs = (h: string) => cacheSummary(parseMessage(`HTTP/1.1 200 OK\n${h}`));
  it.each([
    ['Cache-Control: no-cache', 'noCache'],
    ['Cache-Control: max-age=0', 'noCache'],
    ['Cache-Control: private, max-age=60', 'maxAge'],
    ['Cache-Control: s-maxage=10', 'maxAge'],
  ])('%s', (h, kind) => {
    expect(cs(h)?.kind).toBe(kind);
  });
  it('detalle de max-age y Expires', () => {
    expect(cs('Cache-Control: private, max-age=60')?.params).toEqual({
      seconds: 60,
      scope: 'private',
    });
    expect(cs('Expires: Thu, 01 Jan 2030 00:00:00 GMT')).toBeNull();
  });
});

describe('utilidades', () => {
  it('statusName y headerInfo', () => {
    expect(statusName(404)).toBe('Not Found');
    expect(statusName(299)).toBeNull();
    expect(headerInfo('etag')?.kind).toBe('response');
  });

  it.each([
    ['HTTP/1.1 301 Moved Permanently\nLocation: /', 'message'],
    ['POST /x HTTP/1.1\nHost: a', 'message'],
    ['content-type: text/html\ncache-control: no-store', 'headers'],
    ['Content-Type: x', null],
    ['nombre: ana\nedad: 3', null],
  ])('looksLikeHeaders(%j)', (s, r) => {
    expect(looksLikeHeaders(s)).toBe(r);
  });
});
