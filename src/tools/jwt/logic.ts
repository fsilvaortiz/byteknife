import { base64ToBytes } from '../base64/detect';
import { bytesToBase64, toBase64Url, utf8Bytes } from '../../ui/format';
export { isJwt } from './detect';

export type JwtErrorCode = 'parts' | 'header' | 'payload';

/** Error con código: la interfaz arma el mensaje en el idioma del usuario. */
export class JwtError extends Error {
  constructor(readonly code: JwtErrorCode) {
    super(code);
    this.name = 'JwtError';
  }
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Partes en Base64URL tal como venían, para verificar la firma. */
  parts: [header: string, payload: string, signature: string];
}

/** Quita espacios y el prefijo «Bearer » que suele venir al copiar una cabecera. */
export const cleanToken = (raw: string) =>
  raw
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/\s+/g, '');

function decodePart(part: string, code: JwtErrorCode): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(part)),
    );
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    // cae al error de abajo
  }
  throw new JwtError(code);
}

export function decodeJwt(raw: string): DecodedJwt {
  const p = cleanToken(raw).split('.');
  if (p.length < 2 || p.length > 3 || !p[0] || !p[1]) throw new JwtError('parts');
  return {
    header: decodePart(p[0], 'header'),
    payload: decodePart(p[1], 'payload'),
    parts: [p[0], p[1], p[2] ?? ''],
  };
}

export const DATE_CLAIMS = ['exp', 'iat', 'nbf', 'auth_time'] as const;
export type DateClaim = (typeof DATE_CLAIMS)[number];

/** Claims de fecha numéricos (segundos Unix), en orden fijo. Ignora los que vengan como texto. */
export function dateClaims(payload: Record<string, unknown>): { claim: DateClaim; date: Date }[] {
  return DATE_CLAIMS.flatMap((claim) => {
    const v = payload[claim];
    return typeof v === 'number' && Number.isFinite(v) ? [{ claim, date: new Date(v * 1000) }] : [];
  });
}

export interface JwtStatus {
  /** null si no trae exp. */
  expired: boolean | null;
  notYetValid: boolean;
}

export function jwtStatus(payload: Record<string, unknown>, now: Date): JwtStatus {
  const t = now.getTime() / 1000;
  const { exp, nbf } = payload;
  return {
    expired: typeof exp === 'number' ? exp < t : null,
    notYetValid: typeof nbf === 'number' && nbf > t,
  };
}

const HMAC: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };

export type Verification =
  | { result: 'valid' | 'invalid' | 'noSignature' | 'noSecret' }
  | { result: 'unsupported'; alg: string };

/** Verifica firmas HS256/384/512 con Web Crypto. El secreto nunca sale de la pestaña. */
export async function verifyHmac(jwt: DecodedJwt, secret: string): Promise<Verification> {
  const alg = String(jwt.header['alg'] ?? 'none');
  const hash = HMAC[alg];
  if (!hash) return { result: 'unsupported', alg };
  const [h, p, sig] = jwt.parts;
  if (!sig) return { result: 'noSignature' };
  // Web Crypto no acepta claves HMAC vacías.
  if (!secret) return { result: 'noSecret' };
  const key = await crypto.subtle.importKey(
    'raw',
    utf8Bytes(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, utf8Bytes(`${h}.${p}`)));
  return {
    result: toBase64Url(bytesToBase64(mac)) === sig.replace(/=+$/, '') ? 'valid' : 'invalid',
  };
}
