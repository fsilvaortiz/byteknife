import { formatIPv6 } from '../cidr/logic';
import { PEM_RE } from './detect';

export { pemKind } from './detect';

// Lector DER mínimo (X.690) para certificados X.509 (RFC 5280) y CSR PKCS#10 (RFC 2986).
// Solo lee: no valida firmas ni cadenas de confianza.

export class X509Error extends Error {
  constructor(readonly code: 'noPem' | 'base64' | 'der' | 'structure') {
    super(code);
    this.name = 'X509Error';
  }
}

interface Node {
  /** Byte de tag completo (clase, constructed y número). */
  tag: number;
  /** Bytes del contenido. */
  value: Uint8Array;
  children: Node[];
}

const CONSTRUCTED = 0x20;

function parseDer(bytes: Uint8Array): Node {
  const [node, end] = readNode(bytes, 0);
  if (end !== bytes.length) throw new X509Error('der');
  return node;
}

function readNode(bytes: Uint8Array, at: number): [Node, number] {
  if (at + 2 > bytes.length) throw new X509Error('der');
  const tag = bytes[at]!;
  if ((tag & 0x1f) === 0x1f) throw new X509Error('der');
  let len = bytes[at + 1]!;
  let pos = at + 2;
  if (len & 0x80) {
    const n = len & 0x7f;
    if (n === 0 || n > 4 || pos + n > bytes.length) throw new X509Error('der');
    len = 0;
    for (let i = 0; i < n; i++) len = len * 256 + bytes[pos + i]!;
    pos += n;
  }
  const end = pos + len;
  if (end > bytes.length) throw new X509Error('der');
  const value = bytes.subarray(pos, end);
  const children: Node[] = [];
  if (tag & CONSTRUCTED) {
    for (let p = pos; p < end;) {
      const [child, next] = readNode(bytes, p);
      children.push(child);
      p = next;
    }
  }
  return [{ tag, value, children }, end];
}

const child = (n: Node | undefined, i: number): Node => {
  const c = n?.children[i];
  if (!c) throw new X509Error('structure');
  return c;
};

/** Hijo con tag de contexto [n] explícito, si existe. */
const tagged = (n: Node, num: number) => n.children.find((c) => c.tag === (0xa0 | num));

export function decodeOid(bytes: Uint8Array): string {
  const parts: number[] = [];
  let v = 0;
  for (const b of bytes) {
    v = v * 128 + (b & 0x7f);
    if (!(b & 0x80)) {
      if (!parts.length) parts.push(v < 80 ? Math.floor(v / 40) : 2, v < 80 ? v % 40 : v - 80);
      else parts.push(v);
      v = 0;
    }
  }
  return parts.join('.');
}

const hex = (b: Uint8Array, sep = ':') =>
  Array.from(b, (x) => x.toString(16).padStart(2, '0').toUpperCase()).join(sep);

function decodeString(n: Node): string {
  switch (n.tag) {
    case 0x1e: {
      // BMPString: UTF-16 big-endian.
      let s = '';
      for (let i = 0; i + 1 < n.value.length; i += 2)
        s += String.fromCharCode((n.value[i]! << 8) | n.value[i + 1]!);
      return s;
    }
    case 0x14: // T61String: en la práctica, Latin-1.
      return Array.from(n.value, (c) => String.fromCharCode(c)).join('');
    default:
      return new TextDecoder().decode(n.value);
  }
}

function decodeTime(n: Node): Date {
  const s = new TextDecoder().decode(n.value);
  const m = s.match(/^(\d{2}|\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/);
  if (!m) throw new X509Error('structure');
  let year = Number(m[1]);
  if (m[1]!.length === 2) year += year < 50 ? 2000 : 1900; // UTCTime (RFC 5280 §4.1.2.5.1)
  return new Date(
    Date.UTC(year, Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)),
  );
}

/** Entero sin signo como texto decimal y hex, y su largo en bits. */
function integer(n: Node): { dec: string; hex: string; bits: number } {
  const bytes = n.value[0] === 0 && n.value.length > 1 ? n.value.subarray(1) : n.value;
  const big = bytes.reduce((acc, b) => (acc << 8n) | BigInt(b), 0n);
  return { dec: big.toString(), hex: hex(bytes), bits: big.toString(2).length };
}

export const NAME_OIDS: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.4': 'SN',
  '2.5.4.5': 'serialNumber',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.9': 'street',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.12': 'title',
  '2.5.4.42': 'GN',
  '2.5.4.97': 'organizationIdentifier',
  '0.9.2342.19200300.100.1.25': 'DC',
  '0.9.2342.19200300.100.1.1': 'UID',
  '1.2.840.113549.1.9.1': 'emailAddress',
};

export interface NameAttr {
  type: string;
  value: string;
}

function decodeName(n: Node): NameAttr[] {
  return n.children.flatMap((set) =>
    set.children.map((atv) => {
      const oid = decodeOid(child(atv, 0).value);
      return { type: NAME_OIDS[oid] ?? oid, value: decodeString(child(atv, 1)) };
    }),
  );
}

export const formatName = (attrs: NameAttr[]) =>
  attrs.map((a) => `${a.type}=${a.value.replace(/([,+"\\<>;])/g, '\\$1')}`).join(', ');

export const SIG_OIDS: Record<string, string> = {
  '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
  '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
  '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
  '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
  '1.2.840.113549.1.1.10': 'RSASSA-PSS',
  '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
  '1.2.840.10045.4.3.3': 'ecdsa-with-SHA384',
  '1.2.840.10045.4.3.4': 'ecdsa-with-SHA512',
  '1.3.101.112': 'Ed25519',
  '1.3.101.113': 'Ed448',
};

const CURVES: Record<string, string> = {
  '1.2.840.10045.3.1.7': 'P-256',
  '1.3.132.0.34': 'P-384',
  '1.3.132.0.35': 'P-521',
  '1.3.132.0.10': 'secp256k1',
};

export interface PublicKeyInfo {
  /** RSA, EC, Ed25519, Ed448 o el OID si no se reconoce. */
  algorithm: string;
  bits: number | null;
  /** Curva EC o exponente RSA. */
  detail: string | null;
  /** SHA-256 de la SPKI en DER, como base para pinning (se completa en `fingerprints`). */
  spki: Uint8Array;
}

function decodePublicKey(n: Node, raw: Uint8Array): PublicKeyInfo {
  const algId = child(n, 0);
  const oid = decodeOid(child(algId, 0).value);
  const bitString = child(n, 1).value.subarray(1); // el primer byte es la cantidad de bits sobrantes
  if (oid === '1.2.840.113549.1.1.1') {
    const key = parseDer(bitString);
    return {
      algorithm: 'RSA',
      bits: integer(child(key, 0)).bits,
      detail: `e = ${integer(child(key, 1)).dec}`,
      spki: raw,
    };
  }
  if (oid === '1.2.840.10045.2.1') {
    const curveOid = decodeOid(child(algId, 1).value);
    const curve = CURVES[curveOid] ?? curveOid;
    const bits = { 'P-256': 256, 'P-384': 384, 'P-521': 521, secp256k1: 256 }[curve] ?? null;
    return { algorithm: 'EC', bits, detail: curve, spki: raw };
  }
  if (oid === '1.3.101.112') return { algorithm: 'Ed25519', bits: 256, detail: null, spki: raw };
  if (oid === '1.3.101.113') return { algorithm: 'Ed448', bits: 456, detail: null, spki: raw };
  return { algorithm: oid, bits: null, detail: null, spki: raw };
}

export const EXT_OIDS: Record<string, string> = {
  '2.5.29.14': 'subjectKeyIdentifier',
  '2.5.29.15': 'keyUsage',
  '2.5.29.17': 'subjectAltName',
  '2.5.29.19': 'basicConstraints',
  '2.5.29.31': 'crlDistributionPoints',
  '2.5.29.32': 'certificatePolicies',
  '2.5.29.35': 'authorityKeyIdentifier',
  '2.5.29.37': 'extKeyUsage',
  '1.3.6.1.5.5.7.1.1': 'authorityInfoAccess',
  '1.3.6.1.4.1.11129.2.4.2': 'ctPrecertificateScts',
};

export const KEY_USAGES = [
  'digitalSignature',
  'nonRepudiation',
  'keyEncipherment',
  'dataEncipherment',
  'keyAgreement',
  'keyCertSign',
  'cRLSign',
  'encipherOnly',
  'decipherOnly',
] as const;

export const EKU_OIDS: Record<string, string> = {
  '1.3.6.1.5.5.7.3.1': 'serverAuth',
  '1.3.6.1.5.5.7.3.2': 'clientAuth',
  '1.3.6.1.5.5.7.3.3': 'codeSigning',
  '1.3.6.1.5.5.7.3.4': 'emailProtection',
  '1.3.6.1.5.5.7.3.8': 'timeStamping',
  '1.3.6.1.5.5.7.3.9': 'OCSPSigning',
  '2.5.29.37.0': 'anyExtendedKeyUsage',
};

const POLICY_OIDS: Record<string, string> = {
  '2.23.140.1.2.1': 'DV',
  '2.23.140.1.2.2': 'OV',
  '2.23.140.1.2.3': 'IV',
  '2.23.140.1.1': 'EV',
};

export interface Extension {
  /** Nombre conocido (clave de i18n) o el OID. */
  name: string;
  oid: string;
  critical: boolean;
  /** Valores legibles; vacío si la extensión no se interpreta. */
  values: string[];
}

function formatIp(b: Uint8Array): string {
  if (b.length === 4) return Array.from(b).join('.');
  if (b.length === 16) return formatIPv6(b.reduce((acc, x) => (acc << 8n) | BigInt(x), 0n));
  return hex(b);
}

/** GeneralName (RFC 5280 §4.2.1.6) como «DNS:…», «IP:…», «email:…», «URI:…». */
function generalName(n: Node): string {
  const text = () => new TextDecoder().decode(n.value);
  switch (n.tag & 0x1f) {
    case 1:
      return `email:${text()}`;
    case 2:
      return `DNS:${text()}`;
    case 4:
      return `DirName:${formatName(decodeName(child(n, 0)))}`;
    case 6:
      return `URI:${text()}`;
    case 7:
      return `IP:${formatIp(n.value)}`;
    default:
      return `[${n.tag & 0x1f}]`;
  }
}

function extensionValues(name: string, n: Node): string[] {
  switch (name) {
    case 'subjectAltName':
      return n.children.map(generalName);
    case 'keyUsage': {
      // BIT STRING: el primer byte cuenta los bits sobrantes; el bit 0 es el más alto.
      const bits = n.value.subarray(1);
      return KEY_USAGES.filter((_, i) => ((bits[i >> 3] ?? 0) & (0x80 >> (i & 7))) !== 0);
    }
    case 'extKeyUsage':
      return n.children.map((c) => {
        const oid = decodeOid(c.value);
        return EKU_OIDS[oid] ?? oid;
      });
    case 'basicConstraints': {
      const ca = n.children.find((c) => c.tag === 0x01)?.value[0] ? 'CA:TRUE' : 'CA:FALSE';
      const path = n.children.find((c) => c.tag === 0x02);
      return path ? [ca, `pathlen:${integer(path).dec}`] : [ca];
    }
    case 'subjectKeyIdentifier':
      return [hex(n.value)];
    case 'authorityKeyIdentifier': {
      const id = n.children.find((c) => c.tag === 0x80);
      return id ? [hex(id.value)] : [];
    }
    case 'crlDistributionPoints':
      // DistributionPoint → [0] distributionPoint → [0] fullName → GeneralNames
      return n.children.flatMap((dp) =>
        (tagged(dp, 0)?.children ?? []).flatMap((full) => full.children.map(generalName)),
      );
    case 'authorityInfoAccess':
      return n.children.map((ad) => {
        const method = decodeOid(child(ad, 0).value);
        const kind =
          method === '1.3.6.1.5.5.7.48.1'
            ? 'OCSP'
            : method === '1.3.6.1.5.5.7.48.2'
              ? 'caIssuers'
              : method;
        return `${kind} ${generalName(child(ad, 1))}`;
      });
    case 'certificatePolicies':
      return n.children.map((p) => {
        const oid = decodeOid(child(p, 0).value);
        return POLICY_OIDS[oid] ? `${oid} (${POLICY_OIDS[oid]})` : oid;
      });
    default:
      return [];
  }
}

function decodeExtensions(list: Node): Extension[] {
  return list.children.map((ext) => {
    const oid = decodeOid(child(ext, 0).value);
    const critical = ext.children.length === 3 && child(ext, 1).value[0] !== 0;
    const octets = child(ext, ext.children.length - 1).value;
    const name = EXT_OIDS[oid] ?? oid;
    let values: string[];
    try {
      values = extensionValues(name, parseDer(octets));
    } catch {
      values = [];
    }
    return { name, oid, critical, values };
  });
}

export interface Decoded {
  kind: 'cert' | 'csr';
  /** DER completo, para las huellas. */
  der: Uint8Array;
  version: number;
  serial: { dec: string; hex: string } | null;
  signatureAlgorithm: string;
  subject: NameAttr[];
  issuer: NameAttr[] | null;
  notBefore: Date | null;
  notAfter: Date | null;
  publicKey: PublicKeyInfo;
  extensions: Extension[];
  /** Emisor y sujeto iguales: autofirmado. */
  selfSigned: boolean;
}

function decodeCert(der: Uint8Array): Decoded {
  const root = parseDer(der);
  const tbs = child(root, 0);
  const hasVersion = tbs.children[0]?.tag === 0xa0;
  const i = hasVersion ? 1 : 0;
  const version = hasVersion ? Number(integer(child(child(tbs, 0), 0)).dec) + 1 : 1;
  const validity = child(tbs, i + 3);
  const spki = child(tbs, i + 5);
  const exts = tagged(tbs, 3);
  const subject = decodeName(child(tbs, i + 4));
  const issuer = decodeName(child(tbs, i + 2));
  return {
    kind: 'cert',
    der,
    version,
    serial: integer(child(tbs, i)),
    signatureAlgorithm: sigName(child(root, 1)),
    subject,
    issuer,
    notBefore: decodeTime(child(validity, 0)),
    notAfter: decodeTime(child(validity, 1)),
    publicKey: decodePublicKey(spki, encode(spki)),
    extensions: exts ? decodeExtensions(child(exts, 0)) : [],
    selfSigned: formatName(subject) === formatName(issuer),
  };
}

const EXTENSION_REQUEST = '1.2.840.113549.1.9.14';

function decodeCsr(der: Uint8Array): Decoded {
  const root = parseDer(der);
  const info = child(root, 0);
  const spki = child(info, 2);
  const attrs = tagged(info, 0)?.children ?? [];
  const extReq = attrs.find((a) => decodeOid(child(a, 0).value) === EXTENSION_REQUEST);
  return {
    kind: 'csr',
    der,
    version: Number(integer(child(info, 0)).dec) + 1,
    serial: null,
    signatureAlgorithm: sigName(child(root, 1)),
    subject: decodeName(child(info, 1)),
    issuer: null,
    notBefore: null,
    notAfter: null,
    publicKey: decodePublicKey(spki, encode(spki)),
    extensions: extReq ? decodeExtensions(child(child(extReq, 1), 0)) : [],
    selfSigned: false,
  };
}

function sigName(algId: Node): string {
  const oid = decodeOid(child(algId, 0).value);
  return SIG_OIDS[oid] ?? oid;
}

/** Vuelve a serializar un nodo (tag + largo + contenido) para hashear la SPKI. */
function encode(n: Node): Uint8Array {
  const len = n.value.length;
  const lenBytes =
    len < 0x80
      ? [len]
      : (() => {
          const out: number[] = [];
          for (let l = len; l > 0; l = Math.floor(l / 256)) out.unshift(l & 0xff);
          return [0x80 | out.length, ...out];
        })();
  const out = new Uint8Array(1 + lenBytes.length + len);
  out.set([n.tag, ...lenBytes]);
  out.set(n.value, 1 + lenBytes.length);
  return out;
}

export interface PemBlock {
  label: string;
  der: Uint8Array;
}

export function pemBlocks(input: string): PemBlock[] {
  const blocks = [...input.matchAll(PEM_RE)].map((m) => {
    const b64 = m[2]!.replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new X509Error('base64');
    let bin: string;
    try {
      bin = atob(b64);
    } catch {
      throw new X509Error('base64');
    }
    return { label: m[1]!, der: Uint8Array.from(bin, (c) => c.charCodeAt(0)) };
  });
  if (!blocks.length) throw new X509Error('noPem');
  return blocks;
}

/** Decodifica todos los certificados y CSR del texto (una cadena completa, por ejemplo). */
export function decodeAll(input: string): Decoded[] {
  return pemBlocks(input).map(({ label, der }) => {
    try {
      return label.endsWith('REQUEST') ? decodeCsr(der) : decodeCert(der);
    } catch (e) {
      if (e instanceof X509Error) throw e;
      throw new X509Error('structure');
    }
  });
}

export type Validity = 'valid' | 'expired' | 'notYet';

export function validity(d: Decoded, now: Date): { state: Validity; days: number } | null {
  if (!d.notBefore || !d.notAfter) return null;
  const day = 86_400_000;
  if (now < d.notBefore) return { state: 'notYet', days: Math.ceil((+d.notBefore - +now) / day) };
  if (now > d.notAfter) return { state: 'expired', days: Math.floor((+now - +d.notAfter) / day) };
  return { state: 'valid', days: Math.floor((+d.notAfter - +now) / day) };
}

export const commonName = (d: Decoded) => d.subject.find((a) => a.type === 'CN')?.value ?? null;

export interface Fingerprints {
  sha256: string;
  sha1: string;
  /** SHA-256 de la SPKI en Base64: el pin de HPKP y de muchas librerías de pinning. */
  spkiSha256: string;
}

export async function fingerprints(d: Decoded): Promise<Fingerprints> {
  const digest = async (alg: string, data: Uint8Array) =>
    new Uint8Array(await crypto.subtle.digest(alg, data as Uint8Array<ArrayBuffer>));
  const [sha256, sha1, spki] = await Promise.all([
    digest('SHA-256', d.der),
    digest('SHA-1', d.der),
    digest('SHA-256', d.publicKey.spki),
  ]);
  return { sha256: hex(sha256), sha1: hex(sha1), spkiSha256: btoa(String.fromCharCode(...spki)) };
}
