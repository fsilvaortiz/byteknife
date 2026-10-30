export type TokenType = 'key' | 'string' | 'number' | 'bool' | 'plain';

export interface Token {
  type: TokenType;
  text: string;
}

const RE = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

/** Divide JSON ya formateado en tokens para colorearlo sin innerHTML. */
export function tokenizeJson(src: string): Token[] {
  const out: Token[] = [];
  const plain = (text: string) => {
    if (!text) return;
    const prev = out[out.length - 1];
    if (prev?.type === 'plain') prev.text += text;
    else out.push({ type: 'plain', text });
  };
  let last = 0;
  for (const m of src.matchAll(RE)) {
    plain(src.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push({ type: 'key', text: m[1] });
      plain(m[2]);
    } else if (m[1]) out.push({ type: 'string', text: m[1] });
    else if (m[3]) out.push({ type: 'bool', text: m[3] });
    else out.push({ type: 'number', text: m[0] });
    last = m.index + m[0].length;
  }
  plain(src.slice(last));
  return out;
}
