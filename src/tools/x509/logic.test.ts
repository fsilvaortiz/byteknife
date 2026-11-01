import { describe, expect, it } from 'vitest';
import { CSR_PEM, EC_PEM, ED_PEM, RSA_PEM } from './fixtures';
import {
  commonName,
  decodeAll,
  decodeOid,
  fingerprints,
  formatName,
  pemBlocks,
  pemKind,
  validity,
  X509Error,
  type Decoded,
} from './logic';

const one = (pem: string): Decoded => decodeAll(pem)[0]!;
const ext = (d: Decoded, name: string) => d.extensions.find((e) => e.name === name);
const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof X509Error) return e.code;
    throw e;
  }
  return null;
};

describe('certificado ECDSA de servidor', () => {
  const d = one(EC_PEM);

  it('datos básicos', () => {
    expect(d.kind).toBe('cert');
    expect(d.version).toBe(3);
    expect(d.serial).toEqual({ dec: '11111822610015', hex: '0A:1B:2C:3D:4E:5F', bits: 44 });
    expect(d.signatureAlgorithm).toBe('ecdsa-with-SHA256');
    expect(formatName(d.subject)).toBe('C=CL, O=Ejemplo SpA, CN=api.ejemplo.dev');
    expect(commonName(d)).toBe('api.ejemplo.dev');
    expect(d.selfSigned).toBe(true);
    expect(d.notBefore?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(d.notAfter?.toISOString()).toBe('2036-10-01T00:00:00.000Z');
    expect(d.publicKey).toMatchObject({ algorithm: 'EC', bits: 256, detail: 'P-256' });
  });

  it('SAN con DNS, IPv4, IPv6, correo y URI', () => {
    expect(ext(d, 'subjectAltName')?.values).toEqual([
      'DNS:api.ejemplo.dev',
      'DNS:*.ejemplo.dev',
      'IP:203.0.113.10',
      'IP:2001:db8::10',
      'email:ops@ejemplo.dev',
      'URI:https://ejemplo.dev/',
    ]);
  });

  it('usos, restricciones y críticas', () => {
    expect(ext(d, 'keyUsage')).toMatchObject({ critical: true, values: ['digitalSignature'] });
    expect(ext(d, 'extKeyUsage')).toMatchObject({
      critical: false,
      values: ['serverAuth', 'clientAuth'],
    });
    expect(ext(d, 'basicConstraints')).toMatchObject({ critical: true, values: ['CA:FALSE'] });
  });

  it('identificadores, AIA, CRL y políticas', () => {
    const ski = '27:B2:3F:DD:E1:4D:12:92:A7:B0:82:5D:EB:B0:98:85:00:CD:C9:58';
    expect(ext(d, 'subjectKeyIdentifier')?.values).toEqual([ski]);
    expect(ext(d, 'authorityKeyIdentifier')?.values).toEqual([ski]);
    expect(ext(d, 'authorityInfoAccess')?.values).toEqual([
      'OCSP URI:http://ocsp.ejemplo.dev',
      'caIssuers URI:http://ca.ejemplo.dev/ca.crt',
    ]);
    expect(ext(d, 'crlDistributionPoints')?.values).toEqual(['URI:http://crl.ejemplo.dev/ca.crl']);
    expect(ext(d, 'certificatePolicies')?.values).toEqual(['2.23.140.1.2.1 (DV)']);
  });

  it('huellas iguales a las de OpenSSL', async () => {
    expect(await fingerprints(d)).toEqual({
      sha256:
        '94:A4:BA:5D:09:95:A6:C3:92:DE:FA:37:54:4F:BF:F3:BB:B5:33:6B:63:7F:9B:BB:2E:5F:FE:BE:4D:7C:28:B1',
      sha1: '82:9C:AD:97:2F:E3:BF:A1:53:18:4C:39:E2:65:58:0B:BE:B1:A0:16',
      spkiSha256: 'z6ABlFRAg+3kc5nBqA4ICIZojHpu+kBixj1Fu1l4eZc=',
    });
  });
});

describe('CA raíz RSA', () => {
  const d = one(RSA_PEM);

  it('nombre completo, clave y restricciones de CA', () => {
    expect(formatName(d.subject)).toBe(
      'CN=Ejemplo Root CA, O=Ejemplo SpA, OU=Seguridad, L=Santiago, ST=RM, C=CL, emailAddress=ca@ejemplo.dev',
    );
    expect(d.serial?.dec).toBe('1');
    expect(d.signatureAlgorithm).toBe('sha256WithRSAEncryption');
    expect(d.publicKey).toMatchObject({ algorithm: 'RSA', bits: 2048, detail: 'e = 65537' });
    expect(ext(d, 'basicConstraints')?.values).toEqual(['CA:TRUE', 'pathlen:1']);
    expect(ext(d, 'keyUsage')?.values).toEqual(['keyCertSign', 'cRLSign']);
  });

  it('huellas', async () => {
    const f = await fingerprints(d);
    expect(f.sha256).toBe(
      '62:2E:B6:D6:FE:01:38:6A:81:6A:34:2E:74:D3:1A:3F:1C:84:FB:2D:D0:5D:3C:A4:DC:63:2C:03:2C:6A:99:29',
    );
    expect(f.spkiSha256).toBe('yYIzc8+WgoWWyRwOZtHabJ5LsDKM3cRtRamyHnD7Nbo=');
  });
});

describe('Ed25519 con nombre UTF-8', () => {
  it('lee la clave y los acentos', async () => {
    const d = one(ED_PEM);
    expect(commonName(d)).toBe('Ñandú Ed25519');
    expect(d.publicKey).toMatchObject({ algorithm: 'Ed25519', bits: 256 });
    expect(d.signatureAlgorithm).toBe('Ed25519');
    expect(d.serial?.hex).toBe('3C:92:31:A8:9F:FD:F5:52:11:93:82:AC:E7:F4:F6:4E:40:CE:49:AB');
    expect((await fingerprints(d)).spkiSha256).toBe('grM/Ir9N4kEPLJawr0IyDdO17woXNDPEozOTnuEKMkU=');
  });
});

describe('CSR', () => {
  it('sujeto, clave y SAN pedidos', () => {
    const d = one(CSR_PEM);
    expect(d.kind).toBe('csr');
    expect(d.version).toBe(1);
    expect(d.serial).toBeNull();
    expect(d.issuer).toBeNull();
    expect(validity(d, new Date())).toBeNull();
    expect(formatName(d.subject)).toBe('C=BR, O=Exemplo Ltda, CN=www.exemplo.com.br');
    expect(d.publicKey).toMatchObject({ algorithm: 'EC', bits: 384, detail: 'P-384' });
    expect(d.signatureAlgorithm).toBe('ecdsa-with-SHA256');
    expect(ext(d, 'subjectAltName')?.values).toEqual([
      'DNS:www.exemplo.com.br',
      'DNS:exemplo.com.br',
    ]);
  });
});

describe('cadena y errores', () => {
  it('decodifica varios bloques en orden', () => {
    const chain = decodeAll(`texto antes\n${EC_PEM}\n${RSA_PEM}\n`);
    expect(chain.map(commonName)).toEqual(['api.ejemplo.dev', 'Ejemplo Root CA']);
  });

  it('acepta NEW CERTIFICATE REQUEST', () => {
    const legacy = CSR_PEM.replace(/CERTIFICATE REQUEST/g, 'NEW CERTIFICATE REQUEST');
    expect(one(legacy).kind).toBe('csr');
  });

  it.each([
    ['sin PEM', 'hola', 'noPem'],
    ['Base64 inválido', '-----BEGIN CERTIFICATE-----\n@@@\n-----END CERTIFICATE-----', 'base64'],
    [
      'Base64 con relleno mal puesto',
      '-----BEGIN CERTIFICATE-----\nQQ=Q\n-----END CERTIFICATE-----',
      'base64',
    ],
    ['DER truncado', '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----', 'der'],
    [
      'DER con bytes de sobra',
      '-----BEGIN CERTIFICATE-----\nMAAA\n-----END CERTIFICATE-----',
      'der',
    ],
    [
      'estructura que no es un certificado',
      '-----BEGIN CERTIFICATE-----\nMAA=\n-----END CERTIFICATE-----',
      'structure',
    ],
    ['tag de varios bytes', '-----BEGIN CERTIFICATE-----\nHwA=\n-----END CERTIFICATE-----', 'der'],
    ['largo indefinido', '-----BEGIN CERTIFICATE-----\nMIA=\n-----END CERTIFICATE-----', 'der'],
  ])('%s', (_, input, c) => {
    expect(code(() => decodeAll(input))).toBe(c);
  });

  it('pemBlocks devuelve el DER de cada bloque', () => {
    const [b] = pemBlocks(EC_PEM);
    expect(b?.label).toBe('CERTIFICATE');
    expect(b?.der[0]).toBe(0x30);
  });
});

describe('validez', () => {
  const d = one(EC_PEM);
  it.each([
    ['2026-09-30T00:00:00Z', 'notYet', 1],
    ['2036-09-01T00:00:00Z', 'valid', 30],
    ['2036-10-11T00:00:00Z', 'expired', 10],
  ])('%s → %s', (now, state, days) => {
    expect(validity(d, new Date(now))).toEqual({ state, days });
  });
});

describe('utilidades', () => {
  it('decodeOid', () => {
    expect(decodeOid(Uint8Array.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]))).toBe(
      '1.2.840.113549.1.1.11',
    );
    expect(decodeOid(Uint8Array.from([0x55, 0x1d, 0x11]))).toBe('2.5.29.17');
    expect(decodeOid(Uint8Array.from([0x88, 0x37, 0x01]))).toBe('2.999.1');
  });

  it('formatName escapa caracteres especiales', () => {
    expect(formatName([{ type: 'O', value: 'Acme, Inc.' }])).toBe('O=Acme\\, Inc.');
  });

  it('pemKind', () => {
    expect(pemKind(EC_PEM)).toBe('cert');
    expect(pemKind(CSR_PEM)).toBe('csr');
    expect(pemKind('nada')).toBeNull();
  });
});

// Certificados sintéticos para los casos que OpenSSL no genera fácilmente: v1 sin
// extensiones, cadenas BMP y T61, fechas UTCTime del siglo XX y OID desconocidos.
const tlv = (tag: number, ...parts: Uint8Array[]): Uint8Array => {
  const body = parts.reduce((acc, p) => Uint8Array.from([...acc, ...p]), new Uint8Array());
  const len = body.length < 0x80 ? [body.length] : [0x81, body.length];
  return Uint8Array.from([tag, ...len, ...body]);
};
const seq = (...p: Uint8Array[]) => tlv(0x30, ...p);
const set = (...p: Uint8Array[]) => tlv(0x31, ...p);
const oid = (...bytes: number[]) => tlv(0x06, Uint8Array.from(bytes));
const str = (tag: number, bytes: number[]) => tlv(tag, Uint8Array.from(bytes));
const ascii = (tag: number, s: string) =>
  str(
    tag,
    [...s].map((c) => c.charCodeAt(0)),
  );
const int = (n: number) => tlv(0x02, Uint8Array.from([n]));
const toPem = (der: Uint8Array, label = 'CERTIFICATE') =>
  `-----BEGIN ${label}-----\n${btoa(String.fromCharCode(...der))}\n-----END ${label}-----`;

const CN = oid(0x55, 0x04, 0x03);
const UNKNOWN_ATTR = oid(0x55, 0x04, 0x2c); // 2.5.4.44 generationQualifier: sin nombre corto
const ED448 = seq(oid(0x2b, 0x65, 0x71));
const UNKNOWN_ALG = seq(oid(0x2a, 0x03));

function syntheticCert(opts: { notBefore: Uint8Array; spki: Uint8Array; sig?: Uint8Array }) {
  const name = seq(
    set(seq(CN, str(0x1e, [0x00, 0x48, 0x00, 0xe9]))), // BMPString «Hé»
    set(seq(UNKNOWN_ATTR, str(0x14, [0x4a, 0xfc]))), // T61String «Jü»
  );
  const tbs = seq(
    int(5),
    opts.sig ?? UNKNOWN_ALG,
    name,
    seq(opts.notBefore, ascii(0x18, '20500101000000Z')),
    name,
    opts.spki,
  );
  return seq(tbs, opts.sig ?? UNKNOWN_ALG, tlv(0x03, Uint8Array.from([0])));
}

describe('certificados sintéticos', () => {
  it('v1 sin extensiones, BMPString, T61String y OID desconocidos', () => {
    const der = syntheticCert({
      notBefore: ascii(0x17, '990101000000Z'),
      spki: seq(ED448, tlv(0x03, Uint8Array.from([0, 1, 2]))),
    });
    const d = one(toPem(der));
    expect(d.version).toBe(1);
    expect(d.extensions).toEqual([]);
    expect(d.subject).toEqual([
      { type: 'CN', value: 'Hé' },
      { type: '2.5.4.44', value: 'Jü' },
    ]);
    expect(commonName(d)).toBe('Hé');
    expect(d.notBefore?.toISOString()).toBe('1999-01-01T00:00:00.000Z');
    expect(d.notAfter?.toISOString()).toBe('2050-01-01T00:00:00.000Z');
    expect(d.signatureAlgorithm).toBe('1.2.3');
    expect(d.publicKey).toMatchObject({ algorithm: 'Ed448', bits: 456 });
  });

  it('algoritmo de clave y curva desconocidos', () => {
    const unknownKey = syntheticCert({
      notBefore: ascii(0x17, '200101000000Z'),
      spki: seq(UNKNOWN_ALG, tlv(0x03, Uint8Array.from([0]))),
    });
    expect(one(toPem(unknownKey)).publicKey).toMatchObject({ algorithm: '1.2.3', bits: null });
    const ecOid = oid(0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01);
    const oddCurve = syntheticCert({
      notBefore: ascii(0x17, '200101000000Z'),
      spki: seq(seq(ecOid, oid(0x2a, 0x04)), tlv(0x03, Uint8Array.from([0]))),
    });
    expect(one(toPem(oddCurve)).publicKey).toMatchObject({
      algorithm: 'EC',
      detail: '1.2.4',
      bits: null,
    });
  });

  it('fecha mal formada → structure', () => {
    const der = syntheticCert({
      notBefore: ascii(0x17, 'ayer'),
      spki: seq(ED448, tlv(0x03, Uint8Array.from([0]))),
    });
    expect(code(() => decodeAll(toPem(der)))).toBe('structure');
  });

  it('sin CN', () => {
    const d = one(
      toPem(
        syntheticCert({
          notBefore: ascii(0x17, '200101000000Z'),
          spki: seq(ED448, tlv(0x03, Uint8Array.from([0]))),
        }),
      ),
    );
    expect(commonName({ ...d, subject: [] })).toBeNull();
  });

  it('CSR sin atributos', () => {
    const csr = seq(
      seq(int(0), seq(set(seq(CN, ascii(0x0c, 'x')))), seq(ED448, tlv(0x03, Uint8Array.from([0])))),
      UNKNOWN_ALG,
      tlv(0x03, Uint8Array.from([0])),
    );
    const d = one(toPem(csr, 'CERTIFICATE REQUEST'));
    expect(d.extensions).toEqual([]);
    expect(commonName(d)).toBe('x');
  });

  it('extensiones desconocidas, mal formadas y nombres raros', () => {
    const exts = seq(
      seq(oid(0x2a, 0x05), tlv(0x04, seq())), // OID desconocido
      seq(
        oid(0x55, 0x1d, 0x0e),
        tlv(0x01, Uint8Array.from([0xff])),
        tlv(0x04, Uint8Array.from([0x04])),
      ), // SKI roto
      seq(
        oid(0x55, 0x1d, 0x11),
        tlv(
          0x04,
          seq(
            tlv(0xa4, seq(set(seq(CN, ascii(0x0c, 'dir'))))),
            tlv(0x87, Uint8Array.from([1, 2, 3])),
            tlv(0x88, Uint8Array.from([0x2a])),
          ),
        ),
      ),
      seq(oid(0x55, 0x1d, 0x25), tlv(0x04, seq(oid(0x2a, 0x06)))), // EKU desconocido
      seq(oid(0x55, 0x1d, 0x23), tlv(0x04, seq())), // AKI sin keyIdentifier
      seq(oid(0x55, 0x1d, 0x1f), tlv(0x04, seq(seq()))), // CRL DP vacío
      seq(
        oid(0x2b, 0x06, 0x01, 0x05, 0x05, 0x07, 0x01, 0x01),
        tlv(0x04, seq(seq(oid(0x2a, 0x07), tlv(0x86, Uint8Array.from([0x78]))))),
      ), // AIA con método desconocido
      seq(oid(0x55, 0x1d, 0x20), tlv(0x04, seq(seq(oid(0x2a, 0x08))))), // política sin nombre
    );
    const csr = seq(
      seq(
        int(0),
        seq(),
        seq(ED448, tlv(0x03, Uint8Array.from([0]))),
        tlv(0xa0, seq(oid(0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x09, 0x0e), set(exts))),
      ),
      UNKNOWN_ALG,
      tlv(0x03, Uint8Array.from([0])),
    );
    const d = one(toPem(csr, 'CERTIFICATE REQUEST'));
    expect(d.extensions.map((e) => [e.name, e.critical, e.values])).toEqual([
      ['1.2.5', false, []],
      ['subjectKeyIdentifier', true, []],
      ['subjectAltName', false, ['DirName:CN=dir', 'IP:01:02:03', '[8]']],
      ['extKeyUsage', false, ['1.2.6']],
      ['authorityKeyIdentifier', false, []],
      ['crlDistributionPoints', false, []],
      ['authorityInfoAccess', false, ['1.2.7 URI:x']],
      ['certificatePolicies', false, ['1.2.8']],
    ]);
  });

  it('largo de varios bytes y nodo vacío al final', () => {
    expect(code(() => decodeAll(toPem(Uint8Array.from([0x30, 0x82, 0x00]))))).toBe('der');
    expect(code(() => decodeAll(toPem(Uint8Array.from([0x30]))))).toBe('der');
  });
});
