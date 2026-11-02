import { cryptoRandom, type RandomFill } from '../uuid/logic';
import { bytesToBase64, utf8Bytes } from '../../ui/format';

export const ALGORITHMS = ['ed25519', 'p256', 'p384', 'rsa2048', 'rsa3072', 'rsa4096'] as const;
export type Algorithm = (typeof ALGORITHMS)[number];

type KeyAlgorithm = EcKeyGenParams | RsaHashedKeyGenParams | { name: 'Ed25519' };

const PARAMS: Record<Algorithm, KeyAlgorithm> = {
  ed25519: { name: 'Ed25519' },
  p256: { name: 'ECDSA', namedCurve: 'P-256' },
  p384: { name: 'ECDSA', namedCurve: 'P-384' },
  rsa2048: rsa(2048),
  rsa3072: rsa(3072),
  rsa4096: rsa(4096),
};

function rsa(modulusLength: number): RsaHashedKeyGenParams {
  return {
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  };
}

/** Nombre del tipo de clave en OpenSSH y, para ECDSA, el de la curva. */
const SSH: Record<Algorithm, { type: string; curve?: string }> = {
  ed25519: { type: 'ssh-ed25519' },
  p256: { type: 'ecdsa-sha2-nistp256', curve: 'nistp256' },
  p384: { type: 'ecdsa-sha2-nistp384', curve: 'nistp384' },
  rsa2048: { type: 'ssh-rsa' },
  rsa3072: { type: 'ssh-rsa' },
  rsa4096: { type: 'ssh-rsa' },
};

export interface KeyPairOutput {
  publicPem: string;
  privatePem: string;
  publicJwk: string;
  privateJwk: string;
  publicSsh: string;
  privateSsh: string;
  /** Huella como la muestra `ssh-keygen -l`: SHA256:<base64 sin relleno>. */
  fingerprint: string;
}

export async function generateKeyPair(alg: Algorithm): Promise<CryptoKeyPair> {
  return (await crypto.subtle.generateKey(PARAMS[alg], true, ['sign', 'verify'])) as CryptoKeyPair;
}

/** Exporta un par en todos los formatos. `comment` va al final de las claves OpenSSH. */
export async function exportKeyPair(
  alg: Algorithm,
  pair: CryptoKeyPair,
  comment = '',
  random: RandomFill = cryptoRandom,
): Promise<KeyPairOutput> {
  const subtle = crypto.subtle;
  const [spki, pkcs8, pub, priv] = await Promise.all([
    subtle.exportKey('spki', pair.publicKey),
    subtle.exportKey('pkcs8', pair.privateKey),
    subtle.exportKey('jwk', pair.publicKey),
    subtle.exportKey('jwk', pair.privateKey),
  ]);
  const blob = sshPublicBlob(alg, pub);
  const digest = new Uint8Array(await subtle.digest('SHA-256', blob as Uint8Array<ArrayBuffer>));
  const label = comment.trim();
  return {
    publicPem: pem('PUBLIC KEY', new Uint8Array(spki)),
    privatePem: pem('PRIVATE KEY', new Uint8Array(pkcs8)),
    publicJwk: JSON.stringify(cleanJwk(pub), null, 2),
    privateJwk: JSON.stringify(cleanJwk(priv), null, 2),
    publicSsh: `${SSH[alg].type} ${bytesToBase64(blob)}${label ? ` ${label}` : ''}`,
    privateSsh: pem('OPENSSH PRIVATE KEY', opensshPrivate(alg, blob, priv, label, random), 70),
    fingerprint: `SHA256:${bytesToBase64(digest).replace(/=+$/, '')}`,
  };
}

/** Quita key_ops y ext, que Web Crypto agrega y no forman parte de la clave. */
function cleanJwk(jwk: JsonWebKey): JsonWebKey {
  const rest = { ...jwk };
  delete rest.key_ops;
  delete rest.ext;
  return rest;
}

export function pem(label: string, der: Uint8Array, width = 64): string {
  const b64 = bytesToBase64(der);
  const lines = b64.match(new RegExp(`.{1,${width}}`, 'g')) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`;
}

export function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) =>
    c.charCodeAt(0),
  );
}

/** Escritor del formato binario de SSH (RFC 4251): uint32, string y mpint. */
class SshWriter {
  private parts: Uint8Array[] = [];

  uint32(n: number): this {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n);
    this.parts.push(b);
    return this;
  }

  string(data: Uint8Array | string): this {
    const bytes = typeof data === 'string' ? utf8Bytes(data) : data;
    this.uint32(bytes.length);
    this.parts.push(bytes);
    return this;
  }

  /** Entero positivo: sin ceros a la izquierda y con un 0 si el bit alto está encendido. */
  mpint(bytes: Uint8Array): this {
    let i = 0;
    while (i < bytes.length - 1 && bytes[i] === 0) i++;
    const trimmed = bytes.subarray(i);
    return this.string(trimmed[0]! & 0x80 ? concat([new Uint8Array([0]), trimmed]) : trimmed);
  }

  raw(bytes: Uint8Array): this {
    this.parts.push(bytes);
    return this;
  }

  get length(): number {
    return this.parts.reduce((n, p) => n + p.length, 0);
  }

  bytes(): Uint8Array {
    return concat(this.parts);
  }
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Punto público EC sin comprimir: 0x04 || x || y. */
const ecPoint = (jwk: JsonWebKey) =>
  concat([new Uint8Array([4]), fromBase64Url(jwk.x!), fromBase64Url(jwk.y!)]);

export function sshPublicBlob(alg: Algorithm, jwk: JsonWebKey): Uint8Array {
  const { type, curve } = SSH[alg];
  const w = new SshWriter().string(type);
  if (alg === 'ed25519') w.string(fromBase64Url(jwk.x!));
  else if (curve) w.string(curve).string(ecPoint(jwk));
  else w.mpint(fromBase64Url(jwk.e!)).mpint(fromBase64Url(jwk.n!));
  return w.bytes();
}

/** Clave privada en formato openssh-key-v1 sin cifrar (lo que genera `ssh-keygen -N ""`). */
export function opensshPrivate(
  alg: Algorithm,
  publicBlob: Uint8Array,
  jwk: JsonWebKey,
  comment: string,
  random: RandomFill = cryptoRandom,
): Uint8Array {
  const { type, curve } = SSH[alg];
  const check = new Uint8Array(4);
  random(check);
  const checkInt = new DataView(check.buffer).getUint32(0);
  const priv = new SshWriter().uint32(checkInt).uint32(checkInt).string(type);
  if (alg === 'ed25519') {
    const pub = fromBase64Url(jwk.x!);
    priv.string(pub).string(concat([fromBase64Url(jwk.d!), pub]));
  } else if (curve) {
    priv.string(curve).string(ecPoint(jwk)).mpint(fromBase64Url(jwk.d!));
  } else {
    const [n, e, d, qi, p, q] = [jwk.n, jwk.e, jwk.d, jwk.qi, jwk.p, jwk.q].map((v) =>
      fromBase64Url(v!),
    );
    priv.mpint(n!).mpint(e!).mpint(d!).mpint(qi!).mpint(p!).mpint(q!);
  }
  priv.string(comment);
  // Relleno 1, 2, 3… hasta múltiplo de 8 (el tamaño de bloque del cifrado «none»).
  const pad = Array.from({ length: (8 - (priv.length % 8)) % 8 }, (_, i) => i + 1);
  priv.raw(new Uint8Array(pad));
  return new SshWriter()
    .raw(utf8Bytes('openssh-key-v1\0'))
    .string('none')
    .string('none')
    .string('')
    .uint32(1)
    .string(publicBlob)
    .string(priv.bytes())
    .bytes();
}
