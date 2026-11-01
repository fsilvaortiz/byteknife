import { headerInfo, STATUSES } from '../http/data';

export { looksLikeHeaders } from './detect';

export interface Header {
  name: string;
  value: string;
}

export interface Message {
  kind: 'response' | 'request' | 'unknown';
  /** «HTTP/1.1 200 OK» o «GET /api HTTP/1.1». */
  startLine: string | null;
  status: number | null;
  headers: Header[];
}

/** Lee cabeceras crudas: de curl -i, de las DevTools o de un log. Ignora el cuerpo. */
export function parseMessage(input: string): Message {
  const lines = input.replace(/\r/g, '').split('\n');
  const msg: Message = { kind: 'unknown', startLine: null, status: null, headers: [] };
  let i = 0;
  while (i < lines.length && !lines[i]!.trim()) i++;
  const first = lines[i]?.trim() ?? '';
  const status = first.match(/^HTTP\/[\d.]+\s+(\d{3})/);
  if (status) {
    msg.kind = 'response';
    msg.status = Number(status[1]);
    msg.startLine = first;
    i++;
  } else if (/^[A-Z]+ \S+ HTTP\/[\d.]+$/.test(first)) {
    msg.kind = 'request';
    msg.startLine = first;
    i++;
  }
  for (; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.trim()) {
      if (msg.headers.length) break; // línea en blanco: empieza el cuerpo
      continue;
    }
    // Continuación obsoleta (obs-fold): una línea que empieza con espacio sigue a la anterior.
    if (/^[ \t]/.test(line) && msg.headers.length) {
      msg.headers.at(-1)!.value += ` ${line.trim()}`;
      continue;
    }
    const at = line.indexOf(':');
    if (at <= 0) continue;
    msg.headers.push({ name: line.slice(0, at).trim(), value: line.slice(at + 1).trim() });
  }
  if (msg.kind === 'unknown') {
    const names = new Set(msg.headers.map((h) => h.name.toLowerCase()));
    if (
      ['set-cookie', 'server', 'strict-transport-security', 'content-security-policy', 'etag'].some(
        (n) => names.has(n),
      )
    )
      msg.kind = 'response';
    else if (['host', 'user-agent', 'accept', 'cookie', 'authorization'].some((n) => names.has(n)))
      msg.kind = 'request';
  }
  return msg;
}

export const statusName = (code: number) => STATUSES.find((s) => s.code === code)?.name ?? null;

export const get = (m: Message, name: string) =>
  m.headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? null;

export type Level = 'ok' | 'warn' | 'bad' | 'info';

export interface Finding {
  level: Level;
  /** Clave de i18n bajo «hdr.f.». */
  key: string;
  params?: Record<string, string | number>;
}

const HALF_YEAR = 15_552_000;

/** Revisión de seguridad y caché de una respuesta. */
export function audit(m: Message): Finding[] {
  if (m.kind === 'request') return [];
  const out: Finding[] = [];
  const hsts = get(m, 'strict-transport-security');
  if (!hsts) out.push({ level: 'bad', key: 'hstsMissing' });
  else {
    const age = Number(hsts.match(/max-age=(\d+)/i)?.[1] ?? 0);
    if (age < HALF_YEAR)
      out.push({ level: 'warn', key: 'hstsShort', params: { days: Math.floor(age / 86400) } });
    else out.push({ level: 'ok', key: 'hstsOk', params: { days: Math.floor(age / 86400) } });
  }
  const csp = get(m, 'content-security-policy');
  if (csp) out.push({ level: 'ok', key: 'cspOk' });
  else if (get(m, 'content-security-policy-report-only'))
    out.push({ level: 'warn', key: 'cspReportOnly' });
  else out.push({ level: 'bad', key: 'cspMissing' });
  if ((get(m, 'x-content-type-options') ?? '').toLowerCase() !== 'nosniff')
    out.push({ level: 'warn', key: 'nosniffMissing' });
  if (!get(m, 'x-frame-options') && !/frame-ancestors/i.test(csp ?? ''))
    out.push({ level: 'warn', key: 'framingMissing' });
  if (!get(m, 'referrer-policy')) out.push({ level: 'warn', key: 'referrerMissing' });
  const server = get(m, 'server');
  if (server && /\d/.test(server))
    out.push({ level: 'warn', key: 'serverVersion', params: { value: server } });
  const powered = get(m, 'x-powered-by');
  if (powered) out.push({ level: 'warn', key: 'poweredBy', params: { value: powered } });
  for (const h of m.headers.filter((x) => x.name.toLowerCase() === 'set-cookie')) {
    const name = h.value.split('=')[0]!.trim();
    if (!/;\s*secure/i.test(h.value) || !/;\s*httponly/i.test(h.value))
      out.push({ level: 'warn', key: 'cookieFlags', params: { name } });
  }
  const acao = get(m, 'access-control-allow-origin');
  if (acao === '*' && /true/i.test(get(m, 'access-control-allow-credentials') ?? ''))
    out.push({ level: 'bad', key: 'corsCredentials' });
  else if (acao === '*') out.push({ level: 'info', key: 'corsAny' });
  const cache = cacheSummary(m);
  if (cache) out.push({ level: 'info', key: `cache.${cache.kind}`, params: cache.params });
  return out;
}

export function cacheSummary(m: Message): {
  kind: 'noStore' | 'noCache' | 'maxAge' | 'none';
  params: Record<string, string | number>;
} | null {
  const cc = (get(m, 'cache-control') ?? '').toLowerCase();
  if (/no-store/.test(cc)) return { kind: 'noStore', params: {} };
  if (/no-cache|max-age=0\b/.test(cc)) return { kind: 'noCache', params: {} };
  const age = cc.match(/(?:s-maxage|max-age)=(\d+)/);
  if (age) {
    const s = Number(age[1]);
    return {
      kind: 'maxAge',
      params: { seconds: s, scope: /private/.test(cc) ? 'private' : 'public' },
    };
  }
  return m.kind === 'response' && !get(m, 'expires') ? { kind: 'none', params: {} } : null;
}

export { headerInfo };
