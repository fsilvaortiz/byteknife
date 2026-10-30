import { describe, expect, it } from 'vitest';
import { cleanToken, dateClaims, decodeJwt, isJwt, JwtError, jwtStatus, verifyHmac } from './logic';
import { encodeText } from '../base64/logic';

const SECRET = 'byteknife-demo-secret';
const seg = (o: unknown) => encodeText(JSON.stringify(o), true);

/** Firma un token HS* con Web Crypto para los tests. */
async function sign(header: object, payload: object, secret = SECRET): Promise<string> {
  const unsigned = `${seg(header)}.${seg(payload)}`;
  const hash = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' }[
    (header as { alg: 'HS256' }).alg
  ];
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned)),
  );
  const b64 = btoa(String.fromCharCode(...mac));
  return `${unsigned}.${b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGYzYTIxIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImVtYWlsIjoiYWRhQGVqZW1wbG8uZGV2Iiwicm9sZXMiOlsiYWRtaW4iLCJkZXYiXSwiaWF0IjoxNzkyNTQwODAwLCJleHAiOjE4MzAyOTc2MDB9.80xahJwPRarA9O2w9o-NaTMcwxhsChNjaL6o7UjBXII';

const SHORT_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGYzYTIxIn0.80xahJwPRarA9O2w9o-NaTMcwxhsChNjaL6o7UjBXII';

describe('decodeJwt', () => {
  it('decodifica header y payload', () => {
    const jwt = decodeJwt(SHORT_JWT);
    expect(jwt.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(jwt.payload).toEqual({ sub: 'usr_8f3a21' });
  });

  it('acepta el prefijo Bearer, espacios y saltos', () => {
    expect(
      decodeJwt(`  Bearer ${SHORT_JWT.slice(0, 40)}\n${SHORT_JWT.slice(40)} `).payload,
    ).toEqual({
      sub: 'usr_8f3a21',
    });
  });

  it('acepta tokens sin firma (2 partes)', () => {
    const [h, p] = SHORT_JWT.split('.');
    expect(decodeJwt(`${h}.${p}`).parts[2]).toBe('');
  });

  it('decodifica payload con UTF-8', () => {
    expect(decodeJwt(`${seg({ alg: 'none' })}.${seg({ name: 'Ñandú 🚀' })}.`).payload).toEqual({
      name: 'Ñandú 🚀',
    });
  });

  it.each([
    ['una sola parte', 'abc', 'parts'],
    ['cuatro partes', 'a.b.c.d', 'parts'],
    ['payload vacío', `${seg({})}..x`, 'parts'],
    ['header no JSON', `${encodeText('hola', true)}.${seg({})}.x`, 'header'],
    ['payload no JSON', `${seg({})}.${encodeText('[1]', true)}.x`, 'payload'],
    ['payload no Base64', `${seg({})}.a.x`, 'payload'],
  ])('lanza JwtError con %s', (_, token, code) => {
    expect(() => decodeJwt(token)).toThrow(JwtError);
    try {
      decodeJwt(token);
    } catch (e) {
      expect((e as JwtError).code).toBe(code);
    }
  });
});

describe('dateClaims y jwtStatus', () => {
  const now = new Date('2026-10-30T00:00:00Z');
  const t = now.getTime() / 1000;

  it('extrae fechas numéricas en orden fijo e ignora las de texto', () => {
    const claims = dateClaims({ iat: t, exp: t + 60, nbf: '2026-01-01', auth_time: t - 5 });
    expect(claims.map((c) => c.claim)).toEqual(['exp', 'iat', 'auth_time']);
    expect(claims[0]!.date.toISOString()).toBe('2026-10-30T00:01:00.000Z');
  });

  it.each([
    [{}, { expired: null, notYetValid: false }],
    [{ exp: t - 1 }, { expired: true, notYetValid: false }],
    [
      { exp: t + 1, nbf: t + 10 },
      { expired: false, notYetValid: true },
    ],
    [{ exp: '9999' }, { expired: null, notYetValid: false }],
  ])('%j → %j', (payload, status) => {
    expect(jwtStatus(payload, now)).toEqual(status);
  });
});

describe('verifyHmac', () => {
  it('valida el token de ejemplo con el secreto demo', async () => {
    expect(await verifyHmac(decodeJwt(SAMPLE_JWT), SECRET)).toEqual({ result: 'valid' });
  });

  it.each(['HS384', 'HS512'])('valida %s', async (alg) => {
    const token = await sign({ alg, typ: 'JWT' }, { sub: 'x' });
    expect(await verifyHmac(decodeJwt(token), SECRET)).toEqual({ result: 'valid' });
  });

  it('secreto distinto o payload alterado no coinciden', async () => {
    expect(await verifyHmac(decodeJwt(SAMPLE_JWT), 'otro')).toEqual({ result: 'invalid' });
    expect(await verifyHmac(decodeJwt(SHORT_JWT), SECRET)).toEqual({ result: 'invalid' });
  });

  it('sin secreto no intenta verificar', async () => {
    expect(await verifyHmac(decodeJwt(SAMPLE_JWT), '')).toEqual({ result: 'noSecret' });
  });

  it('algoritmos asimétricos y none no se verifican', async () => {
    expect(await verifyHmac(decodeJwt(`${seg({ alg: 'RS256' })}.${seg({})}.x`), SECRET)).toEqual({
      result: 'unsupported',
      alg: 'RS256',
    });
    expect(await verifyHmac(decodeJwt(`${seg({})}.${seg({})}.`), SECRET)).toEqual({
      result: 'unsupported',
      alg: 'none',
    });
  });

  it('HS256 sin firma', async () => {
    expect(await verifyHmac(decodeJwt(`${seg({ alg: 'HS256' })}.${seg({})}`), SECRET)).toEqual({
      result: 'noSignature',
    });
  });
});

describe('isJwt y cleanToken', () => {
  it('detecta tokens', () => {
    expect(isJwt(SHORT_JWT)).toBe(true);
    expect(isJwt('eyJhbGc')).toBe(false);
  });

  it('limpia', () => {
    expect(cleanToken(' bearer a.b .c ')).toBe('a.b.c');
  });
});
