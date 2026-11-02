import { parseIPv4, parseIPv6 } from '../cidr/detect';
import { detectDns, type DnsKind } from './detect';

export { detectDns, type DnsKind };

export type Level = 'ok' | 'warn' | 'bad' | 'info';

export interface Finding {
  level: Level;
  key: string;
  params?: Record<string, string | number>;
}

/** Une las cadenas de un TXT partido («"v=spf1 " "include:…"») y quita comillas. */
export const unquote = (s: string) => {
  const parts = [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]!.replace(/\\(.)/g, '$1'));
  return parts.length ? parts.join('') : s.trim();
};

// ---------- SPF (RFC 7208) ----------

export interface SpfTerm {
  qualifier: '+' | '-' | '~' | '?';
  mechanism: string;
  value: string;
  /** Cuenta para el límite de 10 consultas DNS. */
  lookup: boolean;
}

const LOOKUPS = new Set(['include', 'a', 'mx', 'ptr', 'exists', 'redirect']);

export function parseSpf(record: string): { terms: SpfTerm[]; findings: Finding[] } {
  const tokens = unquote(record).split(/\s+/).slice(1).filter(Boolean);
  const terms: SpfTerm[] = [];
  const findings: Finding[] = [];
  let afterAll = false;
  for (const tok of tokens) {
    const mod = tok.match(/^(redirect|exp)=(.+)$/i);
    if (mod) {
      const name = mod[1]!.toLowerCase();
      terms.push({ qualifier: '+', mechanism: name, value: mod[2]!, lookup: name === 'redirect' });
      continue;
    }
    const m = tok.match(/^([+\-~?]?)([a-z0-9]+)(?::(.*)|(\/.*))?$/i);
    if (!m) {
      findings.push({ level: 'bad', key: 'spf.invalid', params: { term: tok } });
      continue;
    }
    const mechanism = m[2]!.toLowerCase();
    const value = m[3] ?? m[4] ?? '';
    if (!['all', 'include', 'a', 'mx', 'ptr', 'ip4', 'ip6', 'exists'].includes(mechanism)) {
      findings.push({ level: 'bad', key: 'spf.invalid', params: { term: tok } });
      continue;
    }
    if (afterAll) findings.push({ level: 'warn', key: 'spf.afterAll', params: { term: tok } });
    if (mechanism === 'ip4' && parseIPv4(value.split('/')[0]!) === null)
      findings.push({ level: 'bad', key: 'spf.badIp', params: { term: tok } });
    if (mechanism === 'ip6' && parseIPv6(value.split('/')[0]!) === null)
      findings.push({ level: 'bad', key: 'spf.badIp', params: { term: tok } });
    terms.push({
      qualifier: (m[1] || '+') as SpfTerm['qualifier'],
      mechanism,
      value,
      lookup: LOOKUPS.has(mechanism),
    });
    if (mechanism === 'all') afterAll = true;
  }
  const all = terms.find((t) => t.mechanism === 'all');
  const lookups = terms.filter((t) => t.lookup).length;
  if (lookups > 10) findings.push({ level: 'bad', key: 'spf.tooMany', params: { count: lookups } });
  else findings.push({ level: 'info', key: 'spf.lookups', params: { count: lookups } });
  if (terms.some((t) => t.mechanism === 'ptr')) findings.push({ level: 'warn', key: 'spf.ptr' });
  if (!all && !terms.some((t) => t.mechanism === 'redirect'))
    findings.push({ level: 'warn', key: 'spf.noAll' });
  else if (all?.qualifier === '+') findings.push({ level: 'bad', key: 'spf.passAll' });
  else if (all?.qualifier === '?') findings.push({ level: 'warn', key: 'spf.neutralAll' });
  else if (all?.qualifier === '~') findings.push({ level: 'info', key: 'spf.softfail' });
  else if (all?.qualifier === '-') findings.push({ level: 'ok', key: 'spf.fail' });
  return { terms, findings };
}

// ---------- Etiquetas tag=value (DMARC y DKIM) ----------

export function parseTags(record: string): [string, string][] {
  return unquote(record)
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const at = p.indexOf('=');
      return at < 0
        ? [p.toLowerCase(), '']
        : [p.slice(0, at).trim().toLowerCase(), p.slice(at + 1).trim()];
    });
}

export function analyzeDmarc(tags: [string, string][]): Finding[] {
  const get = (k: string) => tags.find(([n]) => n === k)?.[1];
  const out: Finding[] = [];
  const p = get('p')?.toLowerCase();
  if (!p) out.push({ level: 'bad', key: 'dmarc.noPolicy' });
  else if (!['none', 'quarantine', 'reject'].includes(p))
    out.push({ level: 'bad', key: 'dmarc.badPolicy', params: { value: p } });
  else if (p === 'none') out.push({ level: 'warn', key: 'dmarc.none' });
  else out.push({ level: 'ok', key: `dmarc.${p}` });
  const pct = get('pct');
  if (pct !== undefined && Number(pct) < 100)
    out.push({ level: 'warn', key: 'dmarc.pct', params: { pct } });
  if (!get('rua')) out.push({ level: 'info', key: 'dmarc.noRua' });
  if (get('adkim')?.toLowerCase() === 's' || get('aspf')?.toLowerCase() === 's')
    out.push({ level: 'info', key: 'dmarc.strict' });
  return out;
}

/** Tamaño aproximado de una clave RSA a partir del largo de su SPKI en Base64. */
export function rsaBits(base64: string): number {
  const bytes = Math.floor((base64.replace(/\s/g, '').length * 3) / 4);
  if (bytes >= 540) return 4096;
  if (bytes >= 400) return 3072;
  if (bytes >= 270) return 2048;
  if (bytes >= 140) return 1024;
  return 512;
}

export function analyzeDkim(tags: [string, string][]): Finding[] {
  const get = (k: string) => tags.find(([n]) => n === k)?.[1];
  const out: Finding[] = [];
  const key = get('p');
  const type = (get('k') ?? 'rsa').toLowerCase();
  if (key === undefined) out.push({ level: 'bad', key: 'dkim.noKey' });
  else if (key === '') out.push({ level: 'warn', key: 'dkim.revoked' });
  else if (type === 'ed25519') out.push({ level: 'ok', key: 'dkim.ed25519' });
  else {
    const bits = rsaBits(key);
    out.push({ level: bits < 2048 ? 'warn' : 'ok', key: 'dkim.rsa', params: { bits } });
  }
  if (get('t')?.split(':').includes('y')) out.push({ level: 'warn', key: 'dkim.testing' });
  return out;
}

// ---------- Archivo de zona y salida de dig ----------

export interface ZoneRecord {
  name: string;
  ttl: string;
  cls: string;
  type: string;
  data: string;
}

const TYPES = new Set(
  'A AAAA CNAME MX NS TXT SOA SRV CAA PTR DS DNSKEY RRSIG NSEC NSEC3 HTTPS SVCB TLSA NAPTR SPF'.split(
    ' ',
  ),
);
const CLASSES = new Set(['IN', 'CH', 'HS', 'CS']);

export function parseZone(input: string): ZoneRecord[] {
  // Une los registros multilínea entre paréntesis (como el SOA).
  const text = input
    .replace(/\r/g, '')
    .replace(/\(([^)]*)\)/g, (_, inner: string) =>
      inner.replace(/;[^\n]*/g, '').replace(/\s+/g, ' '),
    );
  const out: ZoneRecord[] = [];
  let origin = '';
  let last = '';
  let defaultTtl = '';
  for (const raw of text.split('\n')) {
    const line = raw.replace(/(^|\s);.*$/, '').trimEnd();
    if (!line.trim()) continue;
    const dir = line.match(/^\$(ORIGIN|TTL)\s+(\S+)/i);
    if (dir) {
      if (dir[1]!.toUpperCase() === 'ORIGIN') origin = dir[2]!;
      else defaultTtl = dir[2]!;
      continue;
    }
    const tokens = line.trim().split(/\s+/);
    let name = /^\s/.test(line) ? last : tokens.shift()!;
    if (name === '@') name = origin || '@';
    let ttl = defaultTtl;
    let cls = 'IN';
    while (tokens.length && !TYPES.has(tokens[0]!.toUpperCase())) {
      const tok = tokens.shift()!;
      if (/^\d+[smhdw]?$/i.test(tok)) ttl = tok;
      else if (CLASSES.has(tok.toUpperCase())) cls = tok.toUpperCase();
      else {
        tokens.length = 0;
      }
    }
    const type = tokens.shift()?.toUpperCase();
    if (!type) continue;
    last = name;
    out.push({ name, ttl, cls, type, data: tokens.join(' ') });
  }
  return out;
}

/** Revisa los TXT de SPF y DMARC que aparezcan en una zona. */
export function zoneFindings(records: ZoneRecord[]): Finding[] {
  const out: Finding[] = [];
  const spf = records.filter((r) => r.type === 'TXT' && /^v=spf1/i.test(unquote(r.data)));
  if (spf.length > 1) out.push({ level: 'bad', key: 'zone.multipleSpf' });
  for (const r of spf)
    out.push(...parseSpf(r.data).findings.filter((f) => f.key !== 'spf.lookups'));
  for (const r of records.filter((x) => x.type === 'TXT' && /^v=DMARC1/i.test(unquote(x.data))))
    out.push(...analyzeDmarc(parseTags(r.data)));
  const cnames = new Set(records.filter((r) => r.type === 'CNAME').map((r) => r.name));
  for (const r of records) {
    if (cnames.has(r.name) && r.type !== 'CNAME' && !['RRSIG', 'NSEC'].includes(r.type)) {
      out.push({ level: 'bad', key: 'zone.cnameConflict', params: { name: r.name } });
      cnames.delete(r.name);
    }
  }
  return out;
}
