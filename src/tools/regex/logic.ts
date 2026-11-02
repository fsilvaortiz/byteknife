export const MAX_MATCHES = 1000;

export type Compiled = { ok: true; re: RegExp } | { ok: false; error: string };

/** Compila y deja el mensaje del motor sin el prefijo repetido «Invalid regular expression: /…/: ». */
export function compile(pattern: string, flags: string): Compiled {
  try {
    return { ok: true, re: new RegExp(pattern, flags) };
  } catch (e) {
    // El constructor de RegExp solo lanza SyntaxError.
    const msg = (e as SyntaxError).message;
    return { ok: false, error: msg.replace(/^Invalid regular expression: \/.*\/[a-z]*: /s, '') };
  }
}

/**
 * Nombre de cada grupo de captura en orden (null si no tiene nombre). Recorre el patrón
 * saltando escapes y clases de caracteres; ignora (?:…), lookarounds y modificadores.
 */
export function captureNames(pattern: string): (string | null)[] {
  const names: (string | null)[] = [];
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '\\') i++;
    else if (inClass) inClass = c !== ']';
    else if (c === '[') inClass = true;
    else if (c === '(') {
      if (pattern[i + 1] !== '?') names.push(null);
      else {
        // (?<nombre>…) captura; (?<=…) y (?<!…) son lookbehind. El nombre admite Unicode.
        const named = /^\(\?<([^=!>][^>]*)>/u.exec(pattern.slice(i));
        if (named) names.push(named[1]!);
      }
    }
  }
  return names;
}

export interface Match {
  index: number;
  text: string;
  /** Grupos numerados; undefined si el grupo no participó. */
  groups: (string | undefined)[];
}

export interface Segment {
  text: string;
  /** Alterna 0/1 para distinguir coincidencias pegadas. */
  mark?: 0 | 1;
}

export interface RegexQuery {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
}

export type RegexResult =
  | {
      ok: true;
      matches: Match[];
      truncated: boolean;
      groupNames: (string | null)[];
      segments: Segment[];
      replaced: string;
    }
  | { ok: false; error: string };

export function runRegex({ pattern, flags, text, replacement }: RegexQuery): RegexResult {
  const compiled = compile(pattern, flags);
  if (!compiled.ok) return compiled;
  const matches: Match[] = [];
  let truncated = false;
  if (pattern) {
    const global = flags.includes('g');
    // matchAll exige la bandera g; avanza solo en coincidencias vacías.
    const all = new RegExp(pattern, global ? flags : `${flags}g`);
    for (const m of text.matchAll(all)) {
      if (matches.length === MAX_MATCHES) {
        truncated = true;
        break;
      }
      matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
      if (!global) break;
    }
  }
  const segments: Segment[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (!m.text) return;
    if (m.index > last) segments.push({ text: text.slice(last, m.index) });
    segments.push({ text: m.text, mark: (i % 2) as 0 | 1 });
    last = m.index + m.text.length;
  });
  if (last < text.length) segments.push({ text: text.slice(last) });
  return {
    ok: true,
    matches,
    truncated,
    groupNames: captureNames(pattern),
    segments,
    replaced: replacement ? text.replace(compiled.re, replacement) : '',
  };
}

const FLAG_CHARS = 'dgimsuvy';

/** Activa o desactiva una bandera conservando el resto (incluidas las desconocidas). */
export function toggleFlag(flags: string, flag: string, on: boolean): string {
  const rest = flags.replaceAll(flag, '');
  return on
    ? [...rest, flag].sort((a, b) => FLAG_CHARS.indexOf(a) - FLAG_CHARS.indexOf(b)).join('')
    : rest;
}
