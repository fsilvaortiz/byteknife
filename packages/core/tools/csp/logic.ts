import { DEPRECATED, DIRECTIVES, FETCH_DIRECTIVES } from './data';

export { looksLikeCsp } from './detect';
export { DIRECTIVES } from './data';

export interface Directive {
  name: string;
  sources: string[];
}

export interface Policy {
  directives: Directive[];
  reportOnly: boolean;
  /** Directivas repetidas: el navegador usa solo la primera. */
  duplicates: string[];
}

/** Acepta la política sola, con «Content-Security-Policy:» delante o el content de un <meta>. */
export function parsePolicy(input: string): Policy {
  let s = input.trim();
  const reportOnly = /^content-security-policy-report-only\s*:/i.test(s);
  s = s.replace(/^content-security-policy(?:-report-only)?\s*:\s*/i, '');
  const meta = s.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  if (meta) s = meta[1] ?? meta[2]!;
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const directives: Directive[] = [];
  for (const part of s.split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;
    const name = tokens[0]!.toLowerCase();
    if (seen.has(name)) {
      duplicates.push(name);
      continue;
    }
    seen.add(name);
    directives.push({ name, sources: tokens.slice(1) });
  }
  return { directives, reportOnly, duplicates };
}

export type Level = 'ok' | 'warn' | 'bad' | 'info';

export interface Finding {
  level: Level;
  /** Clave de i18n bajo «csp.f.». */
  key: string;
  params?: Record<string, string>;
}

const find = (p: Policy, name: string) => p.directives.find((d) => d.name === name);

/** Fuentes que aplican a una directiva, heredando de default-src si no está. */
export function effective(p: Policy, name: string): string[] | null {
  const own = find(p, name);
  if (own) return own.sources;
  if (name.startsWith('script-src-') || name.startsWith('style-src-')) {
    const base = find(p, name.replace(/-(elem|attr)$/, ''));
    if (base) return base.sources;
  }
  if (FETCH_DIRECTIVES.includes(name) || /-src-(elem|attr)$/.test(name)) {
    return find(p, 'default-src')?.sources ?? null;
  }
  return null;
}

const lower = (xs: string[]) => xs.map((x) => x.toLowerCase());

export function analyze(p: Policy): Finding[] {
  const out: Finding[] = [];
  if (!p.directives.length) return out;
  if (p.reportOnly) out.push({ level: 'warn', key: 'reportOnly' });
  for (const name of p.duplicates) out.push({ level: 'warn', key: 'duplicate', params: { name } });

  const script = effective(p, 'script-src');
  if (!script) out.push({ level: 'bad', key: 'noScript' });
  else {
    const src = lower(script);
    const safeInline =
      src.some((x) => /^'(nonce-|sha(256|384|512)-)/.test(x)) || src.includes("'strict-dynamic'");
    if (src.includes("'unsafe-inline'") && !safeInline)
      out.push({ level: 'bad', key: 'unsafeInline' });
    else if (src.includes("'unsafe-inline'")) out.push({ level: 'info', key: 'inlineIgnored' });
    if (src.includes("'unsafe-eval'")) out.push({ level: 'bad', key: 'unsafeEval' });
    for (const wild of ['*', 'https:', 'http:', 'data:', 'blob:']) {
      if (src.includes(wild))
        out.push({ level: 'bad', key: 'scriptWildcard', params: { source: wild } });
    }
    if (src.includes("'strict-dynamic'")) out.push({ level: 'ok', key: 'strictDynamic' });
    if (src.some((x) => /^'nonce-/.test(x))) out.push({ level: 'ok', key: 'nonce' });
  }
  const object = effective(p, 'object-src');
  if (!object || !lower(object).includes("'none'")) out.push({ level: 'warn', key: 'objectSrc' });
  if (!find(p, 'base-uri')) out.push({ level: 'warn', key: 'baseUri' });
  if (!find(p, 'frame-ancestors')) out.push({ level: 'warn', key: 'frameAncestors' });
  if (!find(p, 'form-action')) out.push({ level: 'info', key: 'formAction' });
  for (const d of p.directives) {
    if (d.sources.some((x) => /^http:\/\//i.test(x)))
      out.push({ level: 'warn', key: 'httpSource', params: { name: d.name } });
    if (DEPRECATED.has(d.name))
      out.push({ level: 'info', key: 'deprecated', params: { name: d.name } });
    else if (!DIRECTIVES[d.name])
      out.push({ level: 'warn', key: 'unknown', params: { name: d.name } });
  }
  if (!find(p, 'report-uri') && !find(p, 'report-to'))
    out.push({ level: 'info', key: 'noReports' });
  return out;
}

/** Política de una línea con las directivas ordenadas, lista para copiar. */
export const serialize = (p: Policy) =>
  p.directives.map((d) => [d.name, ...d.sources].join(' ')).join('; ');
