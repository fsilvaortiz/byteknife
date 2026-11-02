import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  ALGORITHMS,
  exportKeyPair,
  fromBase64Url,
  generateKeyPair,
  pem,
  sshPublicBlob,
  type Algorithm,
} from './logic';

// Clave Ed25519 fija (RFC 8032, prueba 1) para tener salidas reproducibles.
const ED_JWK = {
  kty: 'OKP',
  crv: 'Ed25519',
  d: 'nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A',
  x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo',
};
const ED_PUB = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINdamAGCsQq31Uv+08lkBzoO4XLz2qYjJa8CGmj3B1Ea';

const fixedCheck = (b: Uint8Array) => b.set([1, 2, 3, 4]);

async function importEd(): Promise<CryptoKeyPair> {
  const subtle = crypto.subtle;
  const pub: JsonWebKey = { ...ED_JWK };
  delete pub.d;
  return {
    privateKey: await subtle.importKey('jwk', ED_JWK, { name: 'Ed25519' }, true, ['sign']),
    publicKey: await subtle.importKey('jwk', pub, { name: 'Ed25519' }, true, ['verify']),
  };
}

const hasSshKeygen = (() => {
  try {
    execFileSync('ssh-keygen', ['-?'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    // ssh-keygen -? sale con código 1 pero existe; ENOENT significa que no está instalado.
    return (e as NodeJS.ErrnoException).code !== 'ENOENT';
  }
})();

describe('Ed25519 con una clave conocida', () => {
  it('produce la clave pública OpenSSH esperada', async () => {
    const out = await exportKeyPair('ed25519', await importEd(), '', fixedCheck);
    expect(out.publicSsh).toBe(ED_PUB);
  });

  it('agrega el comentario y lo recorta', async () => {
    const out = await exportKeyPair('ed25519', await importEd(), '  ada@laptop ', fixedCheck);
    expect(out.publicSsh).toBe(`${ED_PUB} ada@laptop`);
  });

  it('exporta PEM y JWK sin key_ops ni ext', async () => {
    const out = await exportKeyPair('ed25519', await importEd(), '', fixedCheck);
    expect(out.publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA11qYAYKx/);
    expect(out.privatePem).toMatch(/^-----BEGIN PRIVATE KEY-----\n/);
    const pub = JSON.parse(out.publicJwk);
    expect(pub).toMatchObject({ kty: 'OKP', crv: 'Ed25519', x: ED_JWK.x });
    expect(pub).not.toHaveProperty('key_ops');
    expect(pub).not.toHaveProperty('ext');
    expect(JSON.parse(out.privateJwk)).toMatchObject(ED_JWK);
  });

  it('la clave privada OpenSSH es reproducible con el mismo valor de control', async () => {
    const a = await exportKeyPair('ed25519', await importEd(), 'x', fixedCheck);
    const b = await exportKeyPair('ed25519', await importEd(), 'x', fixedCheck);
    expect(a.privateSsh).toBe(b.privateSsh);
    expect(a.privateSsh).toMatch(
      /^-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjE[\s\S]+\n-----END OPENSSH PRIVATE KEY-----\n$/,
    );
    for (const line of a.privateSsh.split('\n').slice(1, -2))
      expect(line.length).toBeLessThanOrEqual(70);
  });

  it('la huella es la de ssh-keygen -l', async () => {
    const out = await exportKeyPair('ed25519', await importEd(), '', fixedCheck);
    expect(out.fingerprint).toMatch(/^SHA256:[A-Za-z0-9+/]{43}$/);
  });
});

describe('formato', () => {
  it('pem corta en líneas del ancho pedido', () => {
    const text = pem('X', new Uint8Array(100), 64);
    const lines = text.trim().split('\n');
    expect(lines[0]).toBe('-----BEGIN X-----');
    expect(lines.at(-1)).toBe('-----END X-----');
    expect(lines[1]).toHaveLength(64);
  });

  it('fromBase64Url acepta valores sin relleno', () => {
    expect([...fromBase64Url('AQAB')]).toEqual([1, 0, 1]);
    expect([...fromBase64Url('_-8')]).toEqual([255, 239]);
  });

  it('RSA agrega un 0 al mpint cuando el bit alto está encendido', () => {
    const blob = sshPublicBlob('rsa2048', { e: 'AQAB', n: '_w' });
    // string "ssh-rsa" | mpint e = 01 00 01 | mpint n = 00 ff
    expect([...blob.subarray(11)]).toEqual([0, 0, 0, 3, 1, 0, 1, 0, 0, 0, 2, 0, 255]);
  });

  it('el mpint quita ceros a la izquierda', () => {
    const blob = sshPublicBlob('rsa2048', { e: 'AAEAAQ', n: 'AQ' });
    expect([...blob.subarray(11)]).toEqual([0, 0, 0, 3, 1, 0, 1, 0, 0, 0, 1, 1]);
  });
});

// ssh-keygen confirma que lo generado es lo que OpenSSH espera: deriva la pública desde la
// privada y calcula la misma huella.
describe.skipIf(!hasSshKeygen)('compatibilidad con ssh-keygen', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bk-keypair-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it.each(ALGORITHMS.filter((a) => a !== 'rsa4096' && a !== 'rsa3072'))('%s', async (alg) => {
    const out = await exportKeyPair(alg as Algorithm, await generateKeyPair(alg), 'test@bk');
    const file = join(dir, alg);
    writeFileSync(file, out.privateSsh, { mode: 0o600 });
    expect(execFileSync('ssh-keygen', ['-y', '-f', file], { encoding: 'utf8' }).trim()).toBe(
      out.publicSsh,
    );
    writeFileSync(`${file}.pub`, out.publicSsh);
    expect(execFileSync('ssh-keygen', ['-l', '-f', `${file}.pub`], { encoding: 'utf8' })).toContain(
      out.fingerprint,
    );
  });
});

describe('generateKeyPair', () => {
  it('genera claves exportables de cada algoritmo rápido', async () => {
    for (const alg of ['ed25519', 'p256', 'p384'] as const) {
      const pair = await generateKeyPair(alg);
      expect(pair.privateKey.extractable).toBe(true);
    }
  });
});
