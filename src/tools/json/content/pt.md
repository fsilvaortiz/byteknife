---
title: 'Formatar e validar JSON online'
description: 'Formate, minifique e valide JSON no seu navegador. Ordene chaves e veja a linha e a coluna exatas do erro. Nada é enviado a um servidor.'
examples:
  - title: 'Formatar um JSON minificado'
    input: |
      {"name":"ByteKnife","tools":16,"offline":true,"langs":["es","en","pt"]}
    output: |
      {
        "name": "ByteKnife",
        "tools": 16,
        "offline": true,
        "langs": [
          "es",
          "en",
          "pt"
        ]
      }
  - title: 'Ordenar chaves para comparar duas respostas'
    input: |
      {"version":2,"name":"api","deps":{"zod":"4.1.0","astro":"7.4.4"}}
    output: |
      {
        "deps": {
          "astro": "7.4.4",
          "zod": "4.1.0"
        },
        "name": "api",
        "version": 2
      }
faq:
  - q: 'Meu JSON é enviado para algum servidor?'
    a: 'Não. A análise usa o JSON.parse do próprio navegador e tudo acontece nesta aba. Você pode ficar offline e a ferramenta continua funcionando.'
  - q: 'Por que meu JSON é inválido se funciona em JavaScript?'
    a: 'JSON é mais rígido que um objeto literal de JavaScript: as chaves precisam de aspas duplas e não são permitidas aspas simples, comentários nem vírgulas no final. O erro mostra a linha e a coluna do problema.'
  - q: 'Ordenar as chaves muda o significado do JSON?'
    a: 'Não. Em um objeto JSON a ordem das chaves não tem significado; ordená-las ajuda a comparar dois documentos ou manter diffs estáveis. A ordem dos arrays é sempre preservada.'
  - q: 'Qual é o tamanho do meu JSON?'
    a: 'Abaixo do resultado aparecem o tamanho em bytes, a quantidade de nós e a profundidade máxima, úteis para notar respostas que cresceram mais do que o esperado.'
---

Cole um JSON e ele é formatado enquanto você digita, sem botão de enviar. Se o documento for válido, ele aparece indentado com 2 ou 4 espaços ou com tabulação, com cores para chaves, textos, números e booleanos. Se tiver um erro, a ferramenta diz o que encontrou e em qual linha e coluna, para você ir direto ao problema em vez de procurar uma vírgula perdida no olho.

Além de formatar, você pode **minificar** o documento para tirar espaços e quebras de linha antes de colocá-lo em uma variável de ambiente ou no corpo de uma requisição, ou **ordenar as chaves** de forma recursiva. Ordenar é útil quando você compara duas respostas de uma API ou quer que um arquivo de configuração mantenha sempre a mesma ordem no controle de versão.

Tudo roda no seu navegador com `JSON.parse` e `JSON.stringify`. Nenhum dado sai da aba, então você pode colar respostas com tokens, dados de clientes ou configurações internas sem expô-los. Se você colar um JSON na página inicial do ByteKnife, ele é detectado automaticamente e aberto aqui com o seu conteúdo.

Para transformar um array de objetos em planilha, use a ferramenta JSON ⇄ CSV.
