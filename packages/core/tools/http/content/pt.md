---
title: 'Códigos de status e cabeçalhos HTTP: referência'
description: 'Veja o que significa cada código de status HTTP (200, 301, 404, 422, 429, 503) e para que serve cada cabeçalho de requisição e de resposta.'
examples:
  - title: 'Buscar por código'
    input: |
      429
    output: |
      429  Too Many Requests · RFC 6585
           Limite de taxa excedido; veja Retry-After.
  - title: 'Buscar cabeçalhos por tema'
    input: |
      cors
    output: |
      Access-Control-Allow-Credentials  Resposta  CORS: permite enviar cookies ou credenciais.
      Access-Control-Allow-Headers      Resposta  CORS: cabeçalhos permitidos na requisição real.
      Access-Control-Allow-Methods      Resposta  CORS: métodos permitidos na requisição real.
      Access-Control-Allow-Origin       Resposta  CORS: origens que podem ler a resposta.
faq:
  - q: 'Qual a diferença entre 401 e 403?'
    a: '401 significa que falta autenticação ou que as credenciais são inválidas. 403 significa que o servidor sabe quem você é, mas você não tem permissão para esse recurso.'
  - q: 'Redireciono com 301, 302, 307 ou 308?'
    a: '301 e 308 são permanentes; 302 e 307 são temporários. 307 e 308 mantêm o método e o corpo, então um POST continua POST. Para APIs, prefira 307 e 308.'
  - q: 'Quando devolver 400 e quando 422?'
    a: '400 quando a requisição está malformada, por exemplo com um JSON quebrado. 422 quando a sintaxe está certa mas os dados não passam na validação, como um e-mail inválido.'
  - q: 'De onde vêm os textos?'
    a: 'Os nomes e os números de RFC vêm das especificações do IETF, principalmente a RFC 9110. As descrições são um resumo prático.'
---

Toda resposta HTTP traz um **código de status** de três dígitos que resume o que aconteceu e um conjunto de **cabeçalhos** com metadados: tipo de conteúdo, cache, cookies, CORS ou segurança. Esta referência reúne os códigos registrados e os cabeçalhos mais usados, com uma explicação curta no seu idioma.

Em **Códigos de status** você pode digitar um número exato (`404`), um prefixo (`5` mostra todos os erros de servidor) ou uma palavra (`redirecionamento`, `limite`). Cada código mostra o nome oficial, a RFC que o define e para que é usado. A cor indica a família: verde para sucesso, amarelo para erros do cliente e vermelho para erros do servidor.

Em **Cabeçalhos** você busca por nome ou por tema: `cache`, `cors`, `cookie`, `segurança`. Você vê se o cabeçalho vai na requisição, na resposta ou em ambas, e o que ele controla.

Serve para escolher o código certo ao projetar uma API, entender um erro nos logs ou lembrar o que `Vary` ou `Retry-After` faziam. Para analisar os cabeçalhos reais de uma resposta, use o analisador de cabeçalhos HTTP.
