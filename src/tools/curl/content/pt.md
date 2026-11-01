---
title: 'Converter curl para fetch, Python, Java e Go'
description: 'Cole um comando curl e receba o código equivalente com fetch do JavaScript, requests do Python, HttpClient do Java ou net/http do Go.'
examples:
  - title: 'GET com token para fetch'
    input: |
      curl https://api.ejemplo.dev/v1/usuarios -H 'Authorization: Bearer abc123'
    output: |
      const res = await fetch("https://api.ejemplo.dev/v1/usuarios", {
        headers: {
          "Authorization": "Bearer abc123",
        },
      });
      const data = await res.text();
  - title: 'POST JSON para Python requests'
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
  - q: 'Quais opções do curl são entendidas?'
    a: 'Método (-X), cabeçalhos (-H), corpo (-d, --data-raw, --data-binary, --data-urlencode, --json), formulários multipart (-F), usuário (-u), cookies (-b), user agent (-A), -G, -I, -L, -k e --compressed. Opções que não mudam a requisição, como -s, -v, -o ou --retry, são ignoradas.'
  - q: 'Comandos copiados do navegador funcionam?'
    a: 'Sim. «Copiar como cURL» das ferramentas de desenvolvedor do Chrome ou do Firefox gera comandos com aspas simples, $''…'' e linhas terminadas em \, e todos são lidos como o bash leria.'
  - q: 'A requisição é executada?'
    a: 'Não. A ferramenta só lê o comando e escreve código; ela não faz nenhuma chamada de rede. Tokens e senhas que você colar não saem do navegador.'
---

Copiar um comando `curl` da documentação de uma API, de um ticket ou do «Copiar como cURL» do navegador é o jeito mais rápido de reproduzir uma requisição. Passá-lo para código à mão, porém, é tedioso. Esta ferramenta o **converte** para a linguagem que você usa.

Escolha o destino: **fetch** do JavaScript (navegador ou Node.js), **requests** do Python, **HttpClient** do Java 11+ ou **net/http** do Go. Método, URL, cabeçalhos, corpo e as opções mais comuns são respeitados: `-d` vira um formulário urlencoded, `--json` ou um `Content-Type: application/json` vira um corpo JSON legível, `-F` monta um formulário multipart, `-u` adiciona autenticação básica, `-G` passa os dados para a URL e `-L` faz o cliente seguir redirecionamentos.

O interpretador entende a sintaxe do shell: aspas simples e duplas, `$'…'`, escapes e linhas quebradas com `\`. Se faltar uma aspa ou a URL, você vê o erro.

Revise sempre o resultado: se o comando usa `-k`, o código desativa a verificação TLS, o que só deveria acontecer em desenvolvimento. A conversão acontece no navegador e nunca executa a requisição.
