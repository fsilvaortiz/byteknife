---
title: 'Analisar cabeçalhos HTTP: segurança, cache e CORS'
description: 'Cole os cabeçalhos de uma resposta HTTP e revise HSTS, CSP, nosniff, clickjacking, cookies, CORS e cache, com a explicação de cada cabeçalho.'
examples:
  - title: 'Resposta de um servidor sem proteção'
    input: |
      HTTP/1.1 200 OK
      Server: Apache/2.4.41 (Ubuntu)
      X-Powered-By: PHP/8.1
      Set-Cookie: PHPSESSID=1; path=/
    output: |
      ✗ Falta Strict-Transport-Security
      ✗ Falta Content-Security-Policy
      ! Falta X-Content-Type-Options: nosniff
      ! Server revela a versão: «Apache/2.4.41 (Ubuntu)»
      ! O cookie «PHPSESSID» não tem Secure e HttpOnly juntos.
  - title: 'Cache de uma resposta'
    input: |
      HTTP/2 200
      cache-control: public, max-age=3600
    output: |
      i Cache public: fresco por 3600 s.
faq:
  - q: 'Como obtenho os cabeçalhos de uma URL?'
    a: 'Com curl -sI https://seu-site.dev, ou curl -si para incluir o corpo, ou nas DevTools do navegador: aba Rede, escolha a requisição e copie os cabeçalhos da resposta.'
  - q: 'Por que a ferramenta não os baixa sozinha?'
    a: 'Porque o ByteKnife não faz requisições de rede com seus dados: tudo acontece no navegador. Além disso, uma consulta a partir de um servidor alheio não veria sua rede interna nem seus cookies.'
  - q: 'Quais cabeçalhos de segurança são os mais importantes?'
    a: 'Strict-Transport-Security para forçar HTTPS, Content-Security-Policy contra XSS, X-Content-Type-Options: nosniff, frame-ancestors ou X-Frame-Options contra clickjacking, e Referrer-Policy.'
---

Os **cabeçalhos HTTP** de uma resposta dizem muito sobre a configuração de um site: se ele força HTTPS, se se defende contra XSS e clickjacking, por quanto tempo fica em cache ou quais origens podem lê-lo. Este analisador os interpreta e mostra o que importa.

Cole a saída de `curl -i`, `curl -I` ou os cabeçalhos copiados das DevTools. A linha de status, as linhas em branco e o corpo, que é ignorado, são reconhecidos. Você vê o código de status com o nome e uma tabela com cada cabeçalho, o valor e para que serve.

A **revisão** aponta o que falta ou convém mudar: HSTS ausente ou curto demais, uma CSP que não existe ou está só em report-only, `nosniff`, proteção contra iframes, `Referrer-Policy`, servidores que revelam a versão, cookies sem `Secure` ou `HttpOnly` e combinações perigosas de CORS. Ela também resume a política de **cache**: `no-store`, revalidação ou tempo de frescor.

É útil para auditar um deploy, comparar ambientes ou revisar a resposta de uma API antes de publicá-la. Os cabeçalhos são analisados no seu navegador e não são enviados a nenhum servidor.
