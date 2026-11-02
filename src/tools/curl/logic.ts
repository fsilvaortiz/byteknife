export { isCurlCommand } from './detect';

export type CurlErrorCode = 'notCurl' | 'quote' | 'noUrl' | 'missingValue';

export class CurlError extends Error {
  constructor(
    readonly code: CurlErrorCode,
    readonly params: Record<string, string> = {},
  ) {
    super(code);
    this.name = 'CurlError';
  }
}

/**
 * Separa una línea de shell en argumentos: comillas simples y dobles, $'…', escapes con \
 * y continuaciones de línea (\ al final).
 */
export function tokenize(input: string): string[] {
  const out: string[] = [];
  let cur = '';
  let has = false;
  const s = input.replace(/\\\r?\n/g, ' ');
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (/\s/.test(c)) {
      if (has) out.push(cur);
      cur = '';
      has = false;
    } else if (c === "'") {
      const end = s.indexOf("'", i + 1);
      if (end < 0) throw new CurlError('quote');
      cur += s.slice(i + 1, end);
      has = true;
      i = end;
    } else if (c === '$' && s[i + 1] === "'") {
      let j = i + 2;
      for (; j < s.length && s[j] !== "'"; j++) {
        if (s[j] === '\\' && j + 1 < s.length) {
          const n = s[++j]!;
          cur += { n: '\n', t: '\t', r: '\r', '0': '\0' }[n] ?? n;
        } else cur += s[j];
      }
      if (j >= s.length) throw new CurlError('quote');
      has = true;
      i = j;
    } else if (c === '"') {
      let j = i + 1;
      for (; j < s.length && s[j] !== '"'; j++) {
        if (s[j] === '\\' && /["\\$`]/.test(s[j + 1] ?? '')) j++;
        cur += s[j];
      }
      if (j >= s.length) throw new CurlError('quote');
      has = true;
      i = j;
    } else if (c === '\\' && i + 1 < s.length) {
      cur += s[++i];
      has = true;
    } else {
      cur += c;
      has = true;
    }
  }
  if (has) out.push(cur);
  return out;
}

export type Body =
  | { kind: 'raw'; text: string }
  | { kind: 'json'; text: string }
  | { kind: 'urlencoded'; pairs: [string, string][] }
  | { kind: 'multipart'; fields: { name: string; value: string; file: boolean }[] };

export interface Request {
  method: string;
  url: string;
  headers: [string, string][];
  body: Body | null;
  auth: { user: string; password: string } | null;
  insecure: boolean;
  followRedirects: boolean;
  compressed: boolean;
}

/** Opciones con valor; las cortas pueden ir pegadas (-XPOST) o separadas. */
const WITH_VALUE: Record<string, string> = {
  '-X': 'request',
  '--request': 'request',
  '-H': 'header',
  '--header': 'header',
  '-d': 'data',
  '--data': 'data',
  '--data-raw': 'data-raw',
  '--data-ascii': 'data',
  '--data-binary': 'data',
  '--data-urlencode': 'data-urlencode',
  '--json': 'json',
  '-F': 'form',
  '--form': 'form',
  '--form-string': 'form-string',
  '-u': 'user',
  '--user': 'user',
  '-b': 'cookie',
  '--cookie': 'cookie',
  '-A': 'user-agent',
  '--user-agent': 'user-agent',
  '-e': 'referer',
  '--referer': 'referer',
  '--url': 'url',
  '-o': 'ignore',
  '--output': 'ignore',
  '-m': 'ignore',
  '--max-time': 'ignore',
  '--connect-timeout': 'ignore',
  '-w': 'ignore',
  '--write-out': 'ignore',
  '--retry': 'ignore',
  '-x': 'ignore',
  '--proxy': 'ignore',
  '--cacert': 'ignore',
  '--cert': 'ignore',
  '--key': 'ignore',
  '-r': 'ignore',
  '--range': 'ignore',
  '-T': 'ignore',
  '--upload-file': 'ignore',
};

const FLAGS: Record<string, string> = {
  '-G': 'get',
  '--get': 'get',
  '-I': 'head',
  '--head': 'head',
  '-L': 'location',
  '--location': 'location',
  '-k': 'insecure',
  '--insecure': 'insecure',
  '--compressed': 'compressed',
};

const SHORT_WITH_VALUE = new Set(
  Object.keys(WITH_VALUE)
    .filter((k) => /^-[A-Za-z]$/.test(k))
    .map((k) => k[1]),
);

/** Divide -sSLXPOST en -s -S -L -X POST. */
function expandShort(arg: string): string[] {
  if (!/^-[A-Za-z]{2,}/.test(arg) || arg.startsWith('--')) return [arg];
  const out: string[] = [];
  for (let i = 1; i < arg.length; i++) {
    const f = arg[i]!;
    out.push(`-${f}`);
    if (SHORT_WITH_VALUE.has(f)) {
      if (i + 1 < arg.length) out.push(arg.slice(i + 1));
      break;
    }
  }
  return out;
}

const header = (raw: string): [string, string] => {
  const at = raw.indexOf(':');
  return at < 0 ? [raw.trim(), ''] : [raw.slice(0, at).trim(), raw.slice(at + 1).trim()];
};

const hasHeader = (headers: [string, string][], name: string) =>
  headers.some(([n]) => n.toLowerCase() === name.toLowerCase());

/** --data-urlencode: «nombre=valor» codifica solo el valor; sin «=», todo. */
function urlencodePair(v: string): [string, string] {
  const at = v.indexOf('=');
  return at <= 0 ? ['', at === 0 ? v.slice(1) : v] : [v.slice(0, at), v.slice(at + 1)];
}

const decodeForm = (s: string): [string, string][] =>
  s
    .split('&')
    .filter(Boolean)
    .map((p) => {
      const at = p.indexOf('=');
      const dec = (x: string) => {
        try {
          return decodeURIComponent(x.replace(/\+/g, ' '));
        } catch {
          return x;
        }
      };
      return at < 0 ? [dec(p), ''] : [dec(p.slice(0, at)), dec(p.slice(at + 1))];
    });

export function parseCurl(input: string): Request {
  const args = tokenize(input.trim().replace(/^\$\s*/, ''));
  if (args[0] !== 'curl') throw new CurlError('notCurl');
  const req: Request = {
    method: '',
    url: '',
    headers: [],
    body: null,
    auth: null,
    insecure: false,
    followRedirects: false,
    compressed: false,
  };
  const data: string[] = [];
  const encoded: [string, string][] = [];
  const form: { name: string; value: string; file: boolean }[] = [];
  let json: string | null = null;
  let get = false;
  let head = false;

  const list = args.slice(1).flatMap(expandShort);
  for (let i = 0; i < list.length; i++) {
    let arg = list[i]!;
    let inline: string | undefined;
    const eq = arg.indexOf('=');
    if (arg.startsWith('--') && eq > 0 && WITH_VALUE[arg.slice(0, eq)]) {
      inline = arg.slice(eq + 1);
      arg = arg.slice(0, eq);
    }
    const kind = WITH_VALUE[arg];
    if (kind) {
      const value = inline ?? list[++i];
      if (value === undefined) throw new CurlError('missingValue', { option: arg });
      switch (kind) {
        case 'request':
          req.method = value.toUpperCase();
          break;
        case 'header':
          req.headers.push(header(value));
          break;
        case 'data':
        case 'data-raw':
          data.push(value);
          break;
        case 'data-urlencode':
          encoded.push(urlencodePair(value));
          break;
        case 'json':
          json = (json ?? '') + value;
          break;
        case 'form':
        case 'form-string': {
          const at = value.indexOf('=');
          const name = at < 0 ? value : value.slice(0, at);
          const v = at < 0 ? '' : value.slice(at + 1);
          const file = kind === 'form' && v.startsWith('@');
          form.push({ name, value: file ? v.slice(1) : v, file });
          break;
        }
        case 'user': {
          const at = value.indexOf(':');
          req.auth =
            at < 0
              ? { user: value, password: '' }
              : { user: value.slice(0, at), password: value.slice(at + 1) };
          break;
        }
        case 'cookie':
          req.headers.push(['Cookie', value]);
          break;
        case 'user-agent':
          req.headers.push(['User-Agent', value]);
          break;
        case 'referer':
          req.headers.push(['Referer', value]);
          break;
        case 'url':
          req.url = value;
          break;
      }
      continue;
    }
    const flag = FLAGS[arg];
    if (flag === 'get') get = true;
    else if (flag === 'head') head = true;
    else if (flag === 'location') req.followRedirects = true;
    else if (flag === 'insecure') req.insecure = true;
    else if (flag === 'compressed') req.compressed = true;
    else if (!arg.startsWith('-') && !req.url) req.url = arg;
  }

  if (!req.url) throw new CurlError('noUrl');
  if (!/^[a-z][\w+.-]*:\/\//i.test(req.url)) req.url = `http://${req.url}`;

  const formBody = [...data, ...encoded.map(([k, v]) => (k ? `${k}=` : '') + encodeURIComponent(v))]
    .filter((x) => x !== '')
    .join('&');

  if (get && formBody) {
    req.url += (req.url.includes('?') ? '&' : '?') + formBody;
  } else if (json !== null) {
    req.body = { kind: 'json', text: json };
    if (!hasHeader(req.headers, 'Content-Type'))
      req.headers.push(['Content-Type', 'application/json']);
    if (!hasHeader(req.headers, 'Accept')) req.headers.push(['Accept', 'application/json']);
  } else if (form.length) {
    req.body = { kind: 'multipart', fields: form };
  } else if (data.length || encoded.length) {
    const type = req.headers.find(([n]) => n.toLowerCase() === 'content-type')?.[1] ?? '';
    if (/json/i.test(type)) req.body = { kind: 'json', text: data.join('') };
    else if (!type || /x-www-form-urlencoded/i.test(type))
      req.body = { kind: 'urlencoded', pairs: decodeForm(formBody) };
    else req.body = { kind: 'raw', text: formBody };
  }
  req.method ||= head ? 'HEAD' : req.body ? 'POST' : 'GET';
  return req;
}

export type Target = 'fetch' | 'python' | 'java' | 'go';

const js = (s: string) => JSON.stringify(s);
const py = (s: string) => JSON.stringify(s);
const indentJson = (text: string, pad: string): string | null => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2).replace(/\n/g, `\n${pad}`);
  } catch {
    return null;
  }
};

const basic = (a: { user: string; password: string }) => `${a.user}:${a.password}`;

/** Base64 de un texto UTF-8, para la cabecera Authorization: Basic. */
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

function toFetch(r: Request): string {
  const headers = [...r.headers];
  if (r.auth) headers.push(['Authorization', `Basic ${b64(basic(r.auth))}`]);
  const lines: string[] = [];
  let pre = '';
  if (r.body?.kind === 'multipart') {
    pre =
      'const form = new FormData();\n' +
      r.body.fields
        .map((f) =>
          f.file
            ? `form.append(${js(f.name)}, fileInput.files[0]); // ${f.value}`
            : `form.append(${js(f.name)}, ${js(f.value)});`,
        )
        .join('\n') +
      '\n\n';
  }
  if (r.method !== 'GET') lines.push(`  method: ${js(r.method)},`);
  if (headers.length) {
    lines.push('  headers: {');
    for (const [k, v] of headers) lines.push(`    ${js(k)}: ${js(v)},`);
    lines.push('  },');
  }
  if (r.body) {
    if (r.body.kind === 'json') {
      const obj = indentJson(r.body.text, '  ');
      lines.push(obj ? `  body: JSON.stringify(${obj}),` : `  body: ${js(r.body.text)},`);
    } else if (r.body.kind === 'urlencoded') {
      const pairs = r.body.pairs.map(([k, v]) => `    ${js(k)}: ${js(v)},`).join('\n');
      lines.push(`  body: new URLSearchParams({\n${pairs}\n  }),`);
    } else if (r.body.kind === 'multipart') lines.push('  body: form,');
    else lines.push(`  body: ${js(r.body.text)},`);
  }
  // Sin -L curl no sigue redirecciones, pero en el navegador redirect: 'manual' devuelve una
  // respuesta opaca: se deja el comportamiento por defecto de fetch.
  const opts = lines.length ? `, {\n${lines.join('\n')}\n}` : '';
  return `${pre}const res = await fetch(${js(r.url)}${opts});\nconst data = await res.text();\n`;
}

function toPython(r: Request): string {
  const args = [py(r.url)];
  if (r.headers.length) {
    const h = r.headers.map(([k, v]) => `        ${py(k)}: ${py(v)},`).join('\n');
    args.push(`headers={\n${h}\n    }`);
  }
  if (r.body?.kind === 'json') {
    const obj = indentJson(r.body.text, '    ');
    args.push(obj ? `json=${pyLiteral(obj)}` : `data=${py(r.body.text)}`);
  } else if (r.body?.kind === 'urlencoded') {
    const d = r.body.pairs.map(([k, v]) => `        ${py(k)}: ${py(v)},`).join('\n');
    args.push(`data={\n${d}\n    }`);
  } else if (r.body?.kind === 'multipart') {
    const plain = r.body.fields.filter((f) => !f.file);
    const files = r.body.fields.filter((f) => f.file);
    if (plain.length)
      args.push(`data={${plain.map((f) => `${py(f.name)}: ${py(f.value)}`).join(', ')}}`);
    if (files.length)
      args.push(
        `files={${files.map((f) => `${py(f.name)}: open(${py(f.value)}, "rb")`).join(', ')}}`,
      );
  } else if (r.body) args.push(`data=${py(r.body.text)}`);
  if (r.auth) args.push(`auth=(${py(r.auth.user)}, ${py(r.auth.password)})`);
  if (r.insecure) args.push('verify=False');
  if (!r.followRedirects && r.method !== 'HEAD') args.push('allow_redirects=False');
  if (r.followRedirects && r.method === 'HEAD') args.push('allow_redirects=True');
  const fn = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(r.method)
    ? `requests.${r.method.toLowerCase()}(`
    : `requests.request(${py(r.method)}, `;
  return `import requests\n\nres = ${fn}\n    ${args.join(',\n    ')},\n)\nprint(res.status_code, res.text)\n`;
}

/** JSON → literal de Python: true/false/null pasan a True/False/None fuera de los textos. */
function pyLiteral(json: string): string {
  return json.replace(/"(?:[^"\\]|\\.)*"|\b(true|false|null)\b/g, (m, word: string | undefined) =>
    word ? { true: 'True', false: 'False', null: 'None' }[word]! : m,
  );
}

const javaString = (s: string) => JSON.stringify(s);

function toJava(r: Request): string {
  const lines = [
    'import java.net.URI;',
    'import java.net.http.HttpClient;',
    'import java.net.http.HttpRequest;',
    'import java.net.http.HttpResponse;',
  ];
  if (r.auth) lines.push('import java.util.Base64;');
  lines.push('');
  const client = r.followRedirects
    ? 'HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()'
    : 'HttpClient.newHttpClient()';
  lines.push(`HttpClient client = ${client};`);
  let body = 'HttpRequest.BodyPublishers.noBody()';
  // Multipart no tiene BodyPublisher en java.net.http: la UI lo avisa y el cuerpo queda vacío.
  if (r.body?.kind === 'urlencoded') {
    const text = r.body.pairs
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    body = `HttpRequest.BodyPublishers.ofString(${javaString(text)})`;
  } else if (r.body && r.body.kind !== 'multipart') {
    body = `HttpRequest.BodyPublishers.ofString(${javaString(r.body.text)})`;
  }
  lines.push('HttpRequest request = HttpRequest.newBuilder()');
  lines.push(`    .uri(URI.create(${javaString(r.url)}))`);
  for (const [k, v] of r.headers) lines.push(`    .header(${javaString(k)}, ${javaString(v)})`);
  if (r.body?.kind === 'urlencoded' && !hasHeader(r.headers, 'Content-Type'))
    lines.push('    .header("Content-Type", "application/x-www-form-urlencoded")');
  if (r.auth)
    lines.push(
      `    .header("Authorization", "Basic " + Base64.getEncoder().encodeToString(${javaString(basic(r.auth))}.getBytes()))`,
    );
  lines.push(`    .method(${javaString(r.method)}, ${body})`);
  lines.push('    .build();');
  lines.push(
    'HttpResponse<String> res = client.send(request, HttpResponse.BodyHandlers.ofString());',
  );
  lines.push('System.out.println(res.statusCode() + " " + res.body());');
  return lines.join('\n') + '\n';
}

function toGo(r: Request): string {
  const imports = ['"fmt"', '"io"', '"net/http"'];
  let body = 'nil';
  let pre = '';
  if (r.body?.kind === 'urlencoded') {
    imports.push('"net/url"', '"strings"');
    const pairs = r.body.pairs.map(([k, v]) => `\tform.Add(${js(k)}, ${js(v)})`).join('\n');
    pre = `\tform := url.Values{}\n${pairs}\n`;
    body = 'strings.NewReader(form.Encode())';
  } else if (r.body && r.body.kind !== 'multipart') {
    imports.push('"strings"');
    body = `strings.NewReader(${js(r.body.text)})`;
  }
  if (r.insecure) imports.push('"crypto/tls"');
  const lines = [
    `package main\n\nimport (\n\t${imports.sort().join('\n\t')}\n)\n`,
    'func main() {',
  ];
  if (pre) lines.push(pre.replace(/\n$/, ''));
  lines.push(`\treq, err := http.NewRequest(${js(r.method)}, ${js(r.url)}, ${body})`);
  lines.push('\tif err != nil {\n\t\tpanic(err)\n\t}');
  for (const [k, v] of r.headers) lines.push(`\treq.Header.Set(${js(k)}, ${js(v)})`);
  if (r.body?.kind === 'urlencoded' && !hasHeader(r.headers, 'Content-Type'))
    lines.push('\treq.Header.Set("Content-Type", "application/x-www-form-urlencoded")');
  if (r.auth) lines.push(`\treq.SetBasicAuth(${js(r.auth.user)}, ${js(r.auth.password)})`);
  const client: string[] = [];
  if (r.insecure)
    client.push(
      'Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}',
    );
  if (!r.followRedirects)
    client.push(
      'CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }',
    );
  lines.push(
    client.length
      ? `\tclient := &http.Client{\n\t\t${client.join(',\n\t\t')},\n\t}`
      : '\tclient := &http.Client{}',
  );
  lines.push('\tres, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}');
  lines.push('\tdefer res.Body.Close()');
  lines.push('\tdata, _ := io.ReadAll(res.Body)');
  lines.push('\tfmt.Println(res.StatusCode, string(data))');
  lines.push('}');
  return lines.join('\n') + '\n';
}

export function generate(r: Request, target: Target): string {
  switch (target) {
    case 'fetch':
      return toFetch(r);
    case 'python':
      return toPython(r);
    case 'java':
      return toJava(r);
    default:
      return toGo(r);
  }
}
