import { describe, expect, it } from 'vitest';
import { CurlError, generate, isCurlCommand, parseCurl, tokenize } from './logic';

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof CurlError) return e.code;
    throw e;
  }
  return null;
};

describe('tokenize', () => {
  it('comillas, escapes y continuaciones', () => {
    expect(tokenize(`curl -H 'A: b c' "x \\"y\\" \\$z" \\\n  -d a\\ b`)).toEqual([
      'curl',
      '-H',
      'A: b c',
      'x "y" $z',
      '-d',
      'a b',
    ]);
    expect(tokenize("curl $'a\\nb\\'' ''")).toEqual(['curl', "a\nb'", '']);
    expect(tokenize('curl "a\\nb"')).toEqual(['curl', 'a\\nb']);
  });

  it.each(["curl 'abc", 'curl "abc', "curl $'abc"])('comilla sin cerrar: %s', (s) => {
    expect(code(() => tokenize(s))).toBe('quote');
  });
});

describe('parseCurl', () => {
  it('GET simple con cabeceras', () => {
    expect(
      parseCurl("curl https://api.x.dev/v1/users -H 'Authorization: Bearer abc' -H Accept:json"),
    ).toEqual({
      method: 'GET',
      url: 'https://api.x.dev/v1/users',
      headers: [
        ['Authorization', 'Bearer abc'],
        ['Accept', 'json'],
      ],
      body: null,
      auth: null,
      insecure: false,
      followRedirects: false,
      compressed: false,
    });
  });

  it('POST JSON con flags combinadas y opciones con =', () => {
    const r = parseCurl(
      `$ curl -sSLk -XPUT --url=https://x.dev/a -H 'Content-Type: application/json' --data-raw '{"a":1}' --compressed`,
    );
    expect(r).toMatchObject({
      method: 'PUT',
      url: 'https://x.dev/a',
      body: { kind: 'json', text: '{"a":1}' },
      insecure: true,
      followRedirects: true,
      compressed: true,
    });
  });

  it('--json agrega Content-Type y Accept', () => {
    const r = parseCurl(`curl --json '{"b":2}' x.dev/api`);
    expect(r.method).toBe('POST');
    expect(r.url).toBe('http://x.dev/api');
    expect(r.headers).toEqual([
      ['Content-Type', 'application/json'],
      ['Accept', 'application/json'],
    ]);
  });

  it('formulario urlencoded con -d y --data-urlencode', () => {
    const r = parseCurl(
      `curl -d 'a=1&b=hola+mundo' --data-urlencode 'q=café & más' --data-urlencode '=x y' https://x.dev`,
    );
    expect(r.body).toEqual({
      kind: 'urlencoded',
      pairs: [
        ['a', '1'],
        ['b', 'hola mundo'],
        ['q', 'café & más'],
        ['x y', ''],
      ],
    });
  });

  it('-G pasa los datos a la URL', () => {
    const r = parseCurl(`curl -G https://x.dev/s?x=1 -d q=a --data-urlencode 'n=b c'`);
    expect(r).toMatchObject({ method: 'GET', url: 'https://x.dev/s?x=1&q=a&n=b%20c', body: null });
    expect(parseCurl('curl -G https://x.dev/s -d q=a').url).toBe('https://x.dev/s?q=a');
  });

  it('cuerpo con otro Content-Type queda crudo', () => {
    const r = parseCurl(`curl -H 'Content-Type: text/plain' -d hola https://x.dev`);
    expect(r.body).toEqual({ kind: 'raw', text: 'hola' });
  });

  it('multipart, usuario, cookie, agente, referer, HEAD', () => {
    const r = parseCurl(
      `curl -F 'file=@foto.png' -F nombre=Ana --form-string 'x=@no' -u ana:se:creto -b 'a=1' -A bot -e https://r.dev https://x.dev`,
    );
    expect(r.body).toEqual({
      kind: 'multipart',
      fields: [
        { name: 'file', value: 'foto.png', file: true },
        { name: 'nombre', value: 'Ana', file: false },
        { name: 'x', value: '@no', file: false },
      ],
    });
    expect(r.auth).toEqual({ user: 'ana', password: 'se:creto' });
    expect(r.headers).toEqual([
      ['Cookie', 'a=1'],
      ['User-Agent', 'bot'],
      ['Referer', 'https://r.dev'],
    ]);
    expect(parseCurl('curl -I https://x.dev').method).toBe('HEAD');
    expect(parseCurl('curl -u ana https://x.dev').auth).toEqual({ user: 'ana', password: '' });
    expect(parseCurl('curl -F solo https://x.dev').body).toMatchObject({
      fields: [{ name: 'solo', value: '', file: false }],
    });
  });

  it('ignora opciones que no afectan la request', () => {
    const r = parseCurl('curl -o out.json -m 5 --retry 3 -w "%{http_code}" https://x.dev -v');
    expect(r.url).toBe('https://x.dev');
    expect(r.method).toBe('GET');
  });

  it('cabecera sin dos puntos y JSON con Content-Type explícito', () => {
    expect(parseCurl('curl -H X-Flag https://x.dev').headers).toEqual([['X-Flag', '']]);
    const r = parseCurl(
      `curl -H 'content-type: application/json' -d '{"a":' -d '1}' https://x.dev`,
    );
    expect(r.body).toEqual({ kind: 'json', text: '{"a":1}' });
  });

  it('urlencoded con % mal formado no rompe', () => {
    expect(parseCurl('curl -d a=%zz https://x.dev').body).toEqual({
      kind: 'urlencoded',
      pairs: [['a', '%zz']],
    });
  });

  it.each([
    ['wget https://x.dev', 'notCurl'],
    ['curl -s', 'noUrl'],
    ['curl https://x.dev -H', 'missingValue'],
  ])('%s → %s', (s, c) => {
    expect(code(() => parseCurl(s))).toBe(c);
  });
});

describe('generate', () => {
  const post = parseCurl(
    `curl -X POST https://api.x.dev/orders -H 'Content-Type: application/json' -d '{"sku":"A1","qty":2,"gift":false,"note":null}' -u ana:pw -L`,
  );

  it('fetch', () => {
    expect(generate(post, 'fetch')).toBe(`const res = await fetch("https://api.x.dev/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic YW5hOnB3",
  },
  body: JSON.stringify({
    "sku": "A1",
    "qty": 2,
    "gift": false,
    "note": null
  }),
});
const data = await res.text();
`);
    expect(generate(parseCurl('curl https://x.dev'), 'fetch')).toBe(
      'const res = await fetch("https://x.dev");\nconst data = await res.text();\n',
    );
  });

  it('python', () => {
    expect(generate(post, 'python')).toBe(`import requests

res = requests.post(
    "https://api.x.dev/orders",
    headers={
        "Content-Type": "application/json",
    },
    json={
      "sku": "A1",
      "qty": 2,
      "gift": False,
      "note": None
    },
    auth=("ana", "pw"),
)
print(res.status_code, res.text)
`);
  });

  it('java', () => {
    const out = generate(post, 'java');
    expect(out).toContain('import java.util.Base64;');
    expect(out).toContain('HttpClient.Redirect.NORMAL');
    expect(out).toContain('.method("POST", HttpRequest.BodyPublishers.ofString("{\\"sku\\":');
  });

  it('go', () => {
    const out = generate(parseCurl('curl -k -d a=1 https://x.dev'), 'go');
    expect(out).toContain('"crypto/tls"');
    expect(out).toContain('form.Add("a", "1")');
    expect(out).toContain('InsecureSkipVerify: true');
    expect(out).toContain('http.ErrUseLastResponse');
    expect(out).toContain('req.Header.Set("Content-Type", "application/x-www-form-urlencoded")');
  });

  it('variantes de cuerpo en cada lenguaje', () => {
    const form = parseCurl('curl -d a=1 -d b=2 https://x.dev');
    expect(generate(form, 'fetch')).toContain('new URLSearchParams({');
    expect(generate(form, 'python')).toContain('data={');
    expect(generate(form, 'java')).toContain('ofString("a=1&b=2")');
    const raw = parseCurl("curl -H 'Content-Type: text/plain' -d hola -k https://x.dev");
    expect(generate(raw, 'fetch')).toContain('body: "hola"');
    expect(generate(raw, 'python')).toContain('data="hola"');
    expect(generate(raw, 'python')).toContain('verify=False');
    expect(generate(raw, 'go')).toContain('strings.NewReader("hola")');
    const multi = parseCurl('curl -F f=@a.png -F n=1 -L https://x.dev');
    expect(generate(multi, 'fetch')).toContain('form.append("f", fileInput.files[0]); // a.png');
    expect(generate(multi, 'python')).toContain('files={"f": open("a.png", "rb")}');
    expect(generate(multi, 'java')).toContain('BodyPublishers.noBody()');
    expect(generate(multi, 'go')).toContain('http.NewRequest("POST", "https://x.dev", nil)');
    const badJson = parseCurl(`curl --json '{x' https://x.dev`);
    expect(generate(badJson, 'fetch')).toContain('body: "{x"');
    expect(generate(badJson, 'python')).toContain('data="{x"');
    const head = parseCurl('curl -I -L https://x.dev');
    expect(generate(head, 'python')).toContain('requests.head(');
    expect(generate(head, 'python')).toContain('allow_redirects=True');
    expect(generate(parseCurl('curl -X PURGE https://x.dev'), 'python')).toContain(
      'requests.request("PURGE", ',
    );
    expect(generate(parseCurl('curl -u a:b https://x.dev'), 'go')).toContain(
      'req.SetBasicAuth("a", "b")',
    );
  });
});

describe('isCurlCommand', () => {
  it.each(['curl https://x', '$ curl -s x', '  curl -X POST'])('sí: %s', (s) => {
    expect(isCurlCommand(s)).toBe(true);
  });
  it.each(['curly', 'curl', 'wget x'])('no: %s', (s) => {
    expect(isCurlCommand(s)).toBe(false);
  });
});
