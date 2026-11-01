---
title: 'Convert curl to fetch, Python, Java and Go'
description: 'Paste a curl command and get the equivalent code with JavaScript fetch, Python requests, Java HttpClient or Go net/http.'
examples:
  - title: 'GET with a token to fetch'
    input: |
      curl https://api.ejemplo.dev/v1/usuarios -H 'Authorization: Bearer abc123'
    output: |
      const res = await fetch("https://api.ejemplo.dev/v1/usuarios", {
        headers: {
          "Authorization": "Bearer abc123",
        },
      });
      const data = await res.text();
  - title: 'POST JSON to Python requests'
    input: |
      curl -X POST https://api.ejemplo.dev/v1/pedidos --json '{"sku": "TEC-01", "cantidad": 2}'
    output: |
      import requests

      res = requests.post(
          "https://api.ejemplo.dev/v1/pedidos",
          headers={
              "Content-Type": "application/json",
              "Accept": "application/json",
          },
          json={
            "sku": "TEC-01",
            "cantidad": 2
          },
          allow_redirects=False,
      )
      print(res.status_code, res.text)
faq:
  - q: 'Which curl options does it understand?'
    a: 'Method (-X), headers (-H), body (-d, --data-raw, --data-binary, --data-urlencode, --json), multipart forms (-F), user (-u), cookies (-b), user agent (-A), -G, -I, -L, -k and --compressed. Options that do not change the request, such as -s, -v, -o or --retry, are ignored.'
  - q: 'Do commands copied from the browser work?'
    a: 'Yes. "Copy as cURL" in Chrome or Firefox dev tools produces commands with single quotes, $''…'' and lines ending in \, and they are all read the way bash would.'
  - q: 'Is the request executed?'
    a: 'No. The tool only reads the command and writes code; it makes no network calls. Tokens and passwords you paste never leave your browser.'
---

Copying a `curl` command from API docs, a ticket or the browser's "Copy as cURL" is the quickest way to reproduce a request. Turning it into code by hand, though, is tedious. This tool **converts** it into the language you use.

Pick the target: JavaScript **fetch** (browser or Node.js), Python **requests**, Java 11+ **HttpClient** or Go **net/http**. Method, URL, headers, body and the common options are kept: `-d` becomes a urlencoded form, `--json` or a `Content-Type: application/json` header becomes a readable JSON body, `-F` builds a multipart form, `-u` adds basic auth, `-G` moves the data into the URL and `-L` makes the client follow redirects.

The parser understands shell syntax: single and double quotes, `$'…'`, escapes and lines split with `\`. If a quote or the URL is missing, you see the error.

Always review the result: if the command uses `-k`, the code turns off TLS verification, which should only happen in development. The conversion runs in your browser and never executes the request.
