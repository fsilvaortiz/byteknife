import { ATTRIBUTE } from './detect';

export { detectCookie } from './detect';

export interface SetCookie {
  name: string;
  value: string;
  expires: Date | null;
  maxAge: number | null;
  domain: string | null;
  path: string | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None' | null;
  partitioned: boolean;
  priority: string | null;
  /** Atributos que no se reconocen. */
  unknown: string[];
}

export interface Parsed {
  setCookies: SetCookie[];
  /** Pares de una cabecera Cookie: name=value; name2=value2. */
  pairs: [string, string][];
}

const decode = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

export function parseSetCookie(line: string): SetCookie {
  const [first = '', ...attrs] = line.replace(/^set-cookie\s*:\s*/i, '').split(';');
  const at = first.indexOf('=');
  const c: SetCookie = {
    name: (at < 0 ? '' : first.slice(0, at)).trim(),
    value: (at < 0 ? first : first.slice(at + 1)).trim().replace(/^"(.*)"$/, '$1'),
    expires: null,
    maxAge: null,
    domain: null,
    path: null,
    secure: false,
    httpOnly: false,
    sameSite: null,
    partitioned: false,
    priority: null,
    unknown: [],
  };
  for (const raw of attrs) {
    const a = raw.trim();
    if (!a) continue;
    const eq = a.indexOf('=');
    const key = (eq < 0 ? a : a.slice(0, eq)).trim().toLowerCase();
    const val = eq < 0 ? '' : a.slice(eq + 1).trim();
    switch (key) {
      case 'expires': {
        const d = new Date(val);
        if (!Number.isNaN(+d)) c.expires = d;
        break;
      }
      case 'max-age':
        if (/^-?\d+$/.test(val)) c.maxAge = Number(val);
        break;
      case 'domain':
        c.domain = val;
        break;
      case 'path':
        c.path = val;
        break;
      case 'secure':
        c.secure = true;
        break;
      case 'httponly':
        c.httpOnly = true;
        break;
      case 'samesite': {
        const v = val.toLowerCase();
        c.sameSite = v === 'strict' ? 'Strict' : v === 'lax' ? 'Lax' : v === 'none' ? 'None' : null;
        if (!c.sameSite) c.unknown.push(a);
        break;
      }
      case 'partitioned':
        c.partitioned = true;
        break;
      case 'priority':
        c.priority = val;
        break;
      default:
        c.unknown.push(a);
    }
  }
  return c;
}

export function parseCookies(input: string): Parsed {
  const out: Parsed = { setCookies: [], pairs: [] };
  for (const line of input.replace(/\r/g, '').split('\n')) {
    const s = line.trim();
    if (!s) continue;
    if (/^set-cookie\s*:/i.test(s) || ATTRIBUTE.test(s)) out.setCookies.push(parseSetCookie(s));
    else {
      for (const part of s.replace(/^cookie\s*:\s*/i, '').split(';')) {
        const p = part.trim();
        if (!p) continue;
        const at = p.indexOf('=');
        out.pairs.push(
          at < 0 ? ['', decode(p)] : [p.slice(0, at).trim(), decode(p.slice(at + 1).trim())],
        );
      }
    }
  }
  return out;
}

/** Cuándo vence: Max-Age manda sobre Expires; null es una cookie de sesión. */
export function expiry(
  c: SetCookie,
  now: Date,
): { kind: 'session' | 'deleted' | 'at'; date?: Date } {
  if (c.maxAge !== null) {
    return c.maxAge <= 0
      ? { kind: 'deleted' }
      : { kind: 'at', date: new Date(+now + c.maxAge * 1000) };
  }
  if (c.expires) return +c.expires <= +now ? { kind: 'deleted' } : { kind: 'at', date: c.expires };
  return { kind: 'session' };
}

export type Level = 'ok' | 'warn' | 'bad' | 'info';

export interface Finding {
  level: Level;
  key: string;
}

const SENSITIVE = /sess|sid|token|auth|jwt|login|remember/i;

export function audit(c: SetCookie): Finding[] {
  const out: Finding[] = [];
  if (!c.name) out.push({ level: 'bad', key: 'noName' });
  if (c.name.startsWith('__Host-') && (!c.secure || c.path !== '/' || c.domain !== null))
    out.push({ level: 'bad', key: 'hostPrefix' });
  if (c.name.startsWith('__Secure-') && !c.secure) out.push({ level: 'bad', key: 'securePrefix' });
  if (c.sameSite === 'None' && !c.secure) out.push({ level: 'bad', key: 'noneWithoutSecure' });
  if (c.partitioned && !c.secure) out.push({ level: 'bad', key: 'partitionedWithoutSecure' });
  if (!c.secure) out.push({ level: 'warn', key: 'noSecure' });
  if (!c.httpOnly) out.push({ level: SENSITIVE.test(c.name) ? 'warn' : 'info', key: 'noHttpOnly' });
  if (!c.sameSite) out.push({ level: 'info', key: 'noSameSite' });
  if (c.domain) out.push({ level: 'info', key: 'domain' });
  if (c.unknown.length) out.push({ level: 'warn', key: 'unknown' });
  if (!out.some((f) => f.level === 'bad' || f.level === 'warn'))
    out.unshift({ level: 'ok', key: 'good' });
  return out;
}

/** Pista sobre el valor: JWT, Base64 o percent-encoding. */
export function valueHint(v: string): 'jwt' | 'encoded' | null {
  if (/^eyJ[\w-]+\.[\w-]+\.[\w-]*$/.test(v)) return 'jwt';
  if (/%[0-9a-f]{2}/i.test(v)) return 'encoded';
  return null;
}

export { decode as decodeValue };
