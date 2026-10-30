export type EscapeFormat = 'html' | 'json' | 'uni';
export type EscapeDirection = 'enc' | 'dec';

export type EscapeErrorCode = 'jsonString' | 'codePoint';

/** Error con código: la interfaz arma el mensaje en el idioma del usuario. */
export class EscapeError extends Error {
  constructor(readonly code: EscapeErrorCode) {
    super(code);
    this.name = 'EscapeError';
  }
}

const HTML_ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const htmlEscape = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESC[c]!);

// Las entidades con nombre más comunes; el resto se escribe en forma numérica.
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  euro: '€',
  middot: '·',
  deg: '°',
  times: '×',
  iexcl: '¡',
  iquest: '¿',
};

/** Decodifica entidades con nombre y numéricas en una sola pasada (`&amp;lt;` → `&lt;`). */
export function htmlUnescape(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, ref: string) => {
    if (ref[0] !== '#') return NAMED[ref] ?? m;
    const cp = ref[1] === 'x' || ref[1] === 'X' ? parseInt(ref.slice(2), 16) : Number(ref.slice(1));
    return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : '�';
  });
}

export const jsonEscape = (s: string) => JSON.stringify(s).slice(1, -1);

/** Acepta el contenido de una cadena JSON con o sin las comillas internas escapadas. */
export function jsonUnescape(s: string): string {
  // Los controles crudos (saltos, tabs) no son válidos en JSON: se escapan antes de parsear.
  // eslint-disable-next-line no-control-regex
  const body = s.replace(/\\[\s\S]|["\u0000-\u001f]/g, (m) =>
    m.length === 2 ? m : m === '"' ? '\\"' : `\\u${m.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
  try {
    return JSON.parse(`"${body}"`) as string;
  } catch {
    throw new EscapeError('jsonString');
  }
}

/** Todo lo que no sea ASCII imprimible ni salto de línea pasa a \uXXXX (unidades UTF-16). */
export const unicodeEscape = (s: string) =>
  s.replace(/[^\x20-\x7e\n]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

/** Acepta \uXXXX (incluidos pares sustitutos) y \u{X…}. */
export function unicodeUnescape(s: string): string {
  return s.replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})/gi, (_, cp?: string, unit?: string) => {
    if (unit) return String.fromCharCode(parseInt(unit, 16));
    const n = parseInt(cp!, 16);
    if (n > 0x10ffff) throw new EscapeError('codePoint');
    return String.fromCodePoint(n);
  });
}

const OPS: Record<EscapeFormat, Record<EscapeDirection, (s: string) => string>> = {
  html: { enc: htmlEscape, dec: htmlUnescape },
  json: { enc: jsonEscape, dec: jsonUnescape },
  uni: { enc: unicodeEscape, dec: unicodeUnescape },
};

export const escapeString = (s: string, fmt: EscapeFormat, dir: EscapeDirection) =>
  OPS[fmt][dir](s);
