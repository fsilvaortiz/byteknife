import { describe, expect, it } from 'vitest';
import {
  analyzeDkim,
  analyzeDmarc,
  detectDns,
  parseSpf,
  parseTags,
  parseZone,
  rsaBits,
  unquote,
  zoneFindings,
} from './logic';

const keys = (fs: { level: string; key: string }[]) => fs.map((f) => `${f.level}:${f.key}`);

describe('SPF', () => {
  it('lee términos y cuenta consultas', () => {
    const r = parseSpf(
      'v=spf1 ip4:203.0.113.0/24 ip6:2001:db8::/32 include:_spf.google.com mx -all',
    );
    expect(r.terms.map((t) => `${t.qualifier}${t.mechanism}:${t.value}`)).toEqual([
      '+ip4:203.0.113.0/24',
      '+ip6:2001:db8::/32',
      '+include:_spf.google.com',
      '+mx:',
      '-all:',
    ]);
    expect(keys(r.findings)).toEqual(['info:spf.lookups', 'ok:spf.fail']);
    expect(r.findings[0]!.params).toEqual({ count: 2 });
  });

  it('TXT partido entre comillas', () => {
    expect(parseSpf('"v=spf1 include:a.com " "~all"').terms).toHaveLength(2);
  });

  it.each([
    ['v=spf1 +all', 'bad:spf.passAll'],
    ['v=spf1 a ?all', 'warn:spf.neutralAll'],
    ['v=spf1 a ~all', 'info:spf.softfail'],
    ['v=spf1 a', 'warn:spf.noAll'],
    ['v=spf1 ptr -all', 'warn:spf.ptr'],
    ['v=spf1 -all a', 'warn:spf.afterAll'],
    ['v=spf1 ip4:999.1.1.1 -all', 'bad:spf.badIp'],
    ['v=spf1 ip6:zz::1 -all', 'bad:spf.badIp'],
    ['v=spf1 foo:bar -all', 'bad:spf.invalid'],
    ['v=spf1 inc@lude -all', 'bad:spf.invalid'],
  ])('%s → %s', (rec, key) => {
    expect(keys(parseSpf(rec).findings)).toContain(key);
  });

  it('más de 10 consultas y redirect', () => {
    const many = `v=spf1 ${Array.from({ length: 11 }, (_, i) => `include:s${i}.x`).join(' ')} -all`;
    expect(keys(parseSpf(many).findings)).toContain('bad:spf.tooMany');
    const r = parseSpf('v=spf1 redirect=_spf.x.dev exp=explain.x.dev');
    expect(keys(r.findings)).not.toContain('warn:spf.noAll');
    expect(r.terms.map((t) => [t.mechanism, t.lookup])).toEqual([
      ['redirect', true],
      ['exp', false],
    ]);
  });

  it('mecanismo a con prefijo /24', () => {
    expect(parseSpf('v=spf1 a/24 -all').terms[0]!.value).toBe('/24');
  });
});

describe('DMARC', () => {
  const k = (s: string) => keys(analyzeDmarc(parseTags(s)));
  it.each([
    ['v=DMARC1; p=reject; rua=mailto:d@x.dev', ['ok:dmarc.reject']],
    [
      'v=DMARC1; p=quarantine; pct=25; rua=mailto:d@x.dev',
      ['ok:dmarc.quarantine', 'warn:dmarc.pct'],
    ],
    ['v=DMARC1; p=none', ['warn:dmarc.none', 'info:dmarc.noRua']],
    ['v=DMARC1; rua=mailto:a@b', ['bad:dmarc.noPolicy']],
    ['v=DMARC1; p=block; rua=mailto:a@b', ['bad:dmarc.badPolicy']],
    ['v=DMARC1; p=reject; adkim=s; rua=mailto:a@b', ['ok:dmarc.reject', 'info:dmarc.strict']],
  ])('%s', (rec, expected) => {
    expect(k(rec)).toEqual(expected);
  });

  it('parseTags tolera etiquetas sin valor', () => {
    expect(parseTags('v=DMARC1; flag;')).toEqual([
      ['v', 'DMARC1'],
      ['flag', ''],
    ]);
  });
});

describe('DKIM', () => {
  const key2048 = 'M'.repeat(392);
  it.each([
    [`v=DKIM1; k=rsa; p=${key2048}`, ['ok:dkim.rsa']],
    [`v=DKIM1; p=${'M'.repeat(216)}`, ['warn:dkim.rsa']],
    ['v=DKIM1; k=ed25519; p=11qYAYKxCrfVS/7TyWQHOg7hcvPapiMlrwIaaPcHURo=', ['ok:dkim.ed25519']],
    ['v=DKIM1; p=', ['warn:dkim.revoked']],
    ['v=DKIM1; k=rsa', ['bad:dkim.noKey']],
    [`v=DKIM1; t=y:s; p=${key2048}`, ['ok:dkim.rsa', 'warn:dkim.testing']],
  ])('%s', (rec, expected) => {
    expect(keys(analyzeDkim(parseTags(rec)))).toEqual(expected);
  });

  it.each([
    [730, 4096],
    [550, 3072],
    [392, 2048],
    [216, 1024],
    [80, 512],
  ])('rsaBits(%i chars) = %i', (n, bits) => {
    expect(rsaBits('A'.repeat(n))).toBe(bits);
  });
});

describe('zona', () => {
  const ZONE = `$ORIGIN ejemplo.dev.
$TTL 3600
@   IN SOA ns1.ejemplo.dev. admin.ejemplo.dev. (
        2026103101 ; serial
        7200 3600 1209600 300 )
    IN NS  ns1.ejemplo.dev.
    IN MX  10 mail.ejemplo.dev.
    IN TXT "v=spf1 include:_spf.google.com ~all"
www 300 IN CNAME ejemplo.dev.
www     IN A 203.0.113.10 ; conflicto con el CNAME
_dmarc  IN TXT "v=DMARC1; p=none"
basura sin tipo`;

  it('lee directivas, SOA multilínea, nombres heredados y comentarios', () => {
    const r = parseZone(ZONE);
    expect(r.map((x) => [x.name, x.ttl, x.type])).toEqual([
      ['ejemplo.dev.', '3600', 'SOA'],
      ['ejemplo.dev.', '3600', 'NS'],
      ['ejemplo.dev.', '3600', 'MX'],
      ['ejemplo.dev.', '3600', 'TXT'],
      ['www', '300', 'CNAME'],
      ['www', '3600', 'A'],
      ['_dmarc', '3600', 'TXT'],
    ]);
    expect(r[0]!.data).toBe('ns1.ejemplo.dev. admin.ejemplo.dev. 2026103101 7200 3600 1209600 300');
  });

  it('salida de dig', () => {
    const r = parseZone(
      ';; ANSWER SECTION:\nejemplo.dev.\t\t300\tIN\tA\t203.0.113.10\nejemplo.dev. 300 CH TXT "x"',
    );
    expect(r).toEqual([
      { name: 'ejemplo.dev.', ttl: '300', cls: 'IN', type: 'A', data: '203.0.113.10' },
      { name: 'ejemplo.dev.', ttl: '300', cls: 'CH', type: 'TXT', data: '"x"' },
    ]);
  });

  it('@ sin $ORIGIN', () => {
    expect(parseZone('@ IN A 1.2.3.4')[0]!.name).toBe('@');
  });

  it('hallazgos: SPF, DMARC y CNAME en conflicto', () => {
    expect(keys(zoneFindings(parseZone(ZONE)))).toEqual([
      'info:spf.softfail',
      'warn:dmarc.none',
      'info:dmarc.noRua',
      'bad:zone.cnameConflict',
    ]);
    const two = parseZone('a IN TXT "v=spf1 -all"\na IN TXT "v=spf1 mx -all"');
    expect(keys(zoneFindings(two))).toContain('bad:zone.multipleSpf');
  });
});

describe('detección y comillas', () => {
  it.each([
    ['v=spf1 -all', 'spf'],
    ['"v=spf1 mx ~all"', 'spf'],
    ['v=DMARC1; p=none', 'dmarc'],
    ['v=DKIM1; k=rsa; p=MIGf', 'dkim'],
    ['k=rsa; p=MIGf', 'dkim'],
    ['www 300 IN A 1.2.3.4', 'zone'],
    ['hola mundo', null],
  ])('detectDns(%j) = %s', (s, k) => {
    expect(detectDns(s)).toBe(k);
  });

  it('unquote une cadenas y respeta escapes', () => {
    expect(unquote('"a b" "c\\"d"')).toBe('a bc"d');
    expect(unquote(' sin comillas ')).toBe('sin comillas');
  });
});
