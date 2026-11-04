import { describe, expect, it } from 'vitest';
import { detectAll, MAX_DETECT_INPUT } from './detect';
import type { ToolMeta } from './types';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGYzYTIxIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImVtYWlsIjoiYWRhQGVqZW1wbG8uZGV2Iiwicm9sZXMiOlsiYWRtaW4iLCJkZXYiXSwiaWF0IjoxNzkyNTQwODAwLCJleHAiOjE4MzAyOTc2MDB9.80xahJwPRarA9O2w9o-NaTMcwxhsChNjaL6o7UjBXII';
const SAMPLE_JSON =
  '{"id":4821,"servicio":"pagos-api","version":"2.14.0","activo":true,"regiones":["sa-east-1","us-east-1"],"limites":{"rps":1200,"burst":300,"timeoutMs":2500},"dueño":null}';

const top = (input: string) => {
  const [first] = detectAll(input);
  return first && { tool: first.tool.id, label: first.label };
};

describe('detección: los 9 formatos del prototipo', () => {
  it.each([
    ['JSON', SAMPLE_JSON, 'json', 'valid'],
    ['JWT', SAMPLE_JWT, 'jwt', 'jwt'],
    ['Base64', 'aG9sYSBtdW5kbywgwr9xdcOpIHRhbD8=', 'base64', 'base64'],
    ['URL', 'https://api.ejemplo.dev/v2/pedidos?estado=pagado&limite=50', 'url', 'url'],
    ['UUID', '0192b5a4-3c1e-7d2f-9a8b-6c5d4e3f2a1b', 'uuid', 'uuid'],
    ['timestamp Unix', '1793318400', 'time', 'timestamp'],
    ['cron', '0 9 * * 1-5', 'cron', 'cron'],
    ['color', '#2a4fd6', 'color', 'color'],
    ['número', '0xFF', 'base', 'number'],
  ])('%s', (_, input, tool, label) => {
    expect(top(input)).toEqual({ tool, label });
  });
});

describe('detección: variantes', () => {
  it.each([
    ['JSON arreglo', '[1, 2, 3]', 'json'],
    ['timestamp en ms', '1793318400000', 'time'],
    ['fecha ISO', '2026-10-30T12:00:00Z', 'time'],
    ['fecha sola', '2026-10-30', 'time'],
    ['UUID sin guiones', '0192b5a43c1e7d2f9a8b6c5d4e3f2a1b', 'uuid'],
    ['macro cron', '@daily', 'cron'],
    ['color rgb()', 'rgb(42, 79, 214)', 'color'],
    ['color oklch()', 'oklch(0.5 0.2 265)', 'color'],
    ['binario', '0b1011', 'base'],
    ['octal', '0o755', 'base'],
    ['http sin TLS', 'http://localhost:4321/es/', 'url'],
    ['IPv4', '192.168.1.10', 'cidr'],
    ['bloque CIDR', '10.0.0.0/8', 'cidr'],
    ['IPv6', '2001:db8::1', 'cidr'],
    ['YAML', 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: web', 'yaml'],
    ['SQL', 'SELECT id, nombre FROM usuarios WHERE activo', 'sql'],
    ['comando curl', "curl -X POST https://api.x.dev -d 'a=1'", 'curl'],
    ['permisos de ls', '-rwxr-xr-x', 'chmod'],
    ['comando chmod', 'chmod 600 ~/.ssh/id_ed25519', 'chmod'],
    ['respuesta HTTP', 'HTTP/1.1 200 OK\nServer: nginx\nContent-Type: text/html', 'headers'],
    ['cabeceras sueltas', 'content-type: text/html\ncache-control: no-store\nserver: x', 'headers'],
    ['CSP', "default-src 'self'; script-src 'self'", 'csp'],
    ['Set-Cookie', 'Set-Cookie: sid=1; Path=/; HttpOnly', 'cookie'],
    ['SPF', 'v=spf1 include:_spf.google.com ~all', 'dns'],
    ['DMARC', 'v=DMARC1; p=reject', 'dns'],
    ['User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) Firefox/132.0', 'useragent'],
    ['puerto', 'puerto 5432', 'ports'],
    ['MAC', '3c:22:fb:7a:91:0e', 'mac'],
    ['código HTTP', '404', 'http'],
    ['certificado PEM', '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----', 'x509'],
    [
      'CSR PEM',
      '-----BEGIN CERTIFICATE REQUEST-----\nMIIB\n-----END CERTIFICATE REQUEST-----',
      'x509',
    ],
  ])('%s', (_, input, tool) => {
    expect(top(input)?.tool).toBe(tool);
  });

  it('JSON con errores se ofrece con menor confianza', () => {
    const [hit] = detectAll('{"a": 1,}');
    expect(hit?.tool.id).toBe('json');
    expect(hit?.label).toBe('invalid');
    expect(hit?.confidence).toBeLessThan(0.5);
  });

  it('ignora espacios alrededor', () => {
    expect(top('  #2a4fd6\n')?.tool).toBe('color');
  });
});

describe('detección: casos negativos', () => {
  it.each([
    ['vacío', ''],
    ['solo espacios', '   \n\t'],
    ['texto libre', 'hola, ¿cómo estás?'],
    ['número corto', '12345'],
    ['palabra', 'kubernetes'],
    ['color inválido', '#12345'],
    ['fecha imposible', '2026-13-45'],
  ])('%s no detecta nada', (_, input) => {
    expect(detectAll(input)).toEqual([]);
  });

  it('ignora entradas más largas que el límite', () => {
    expect(detectAll('[' + '1,'.repeat(MAX_DETECT_INPUT) + '1]')).toEqual([]);
  });
});

describe('motor de detección', () => {
  const fake = (id: string, detect: ToolMeta['detect']): ToolMeta => ({
    id,
    category: 'text',
    order: 0,
    i18n: {} as ToolMeta['i18n'],
    ...(detect ? { detect } : {}),
  });

  it('ordena por confianza descendente', () => {
    const hits = detectAll('x', [
      fake('low', () => ({ label: 'a', confidence: 0.2 })),
      fake('high', () => ({ label: 'b', confidence: 0.9 })),
      fake('none', () => null),
      fake('no-detect', undefined),
    ]);
    expect(hits.map((h) => h.tool.id)).toEqual(['high', 'low']);
  });

  it('un detect() que lanza error no afecta a los demás', () => {
    const hits = detectAll('x', [
      fake('broken', () => {
        throw new Error('boom');
      }),
      fake('ok', () => ({ label: 'a', confidence: 0.5 })),
    ]);
    expect(hits.map((h) => h.tool.id)).toEqual(['ok']);
  });

  it('cada detect() real corre en menos de 5 ms', () => {
    const inputs = [SAMPLE_JSON, SAMPLE_JWT, 'x'.repeat(10_000), '0 9 * * 1-5'];
    for (const input of inputs) {
      const t0 = performance.now();
      detectAll(input);
      expect(performance.now() - t0).toBeLessThan(5 * 16);
    }
  });
});
