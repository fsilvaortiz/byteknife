---
title: 'Converter JSON para CSV e CSV para JSON'
description: 'Converta arrays de objetos JSON para CSV e de volta, com vírgula, ponto e vírgula ou tabulação. Detecta números e booleanos. Tudo no navegador.'
examples:
  - title: 'De JSON para CSV com um valor que tem vírgula'
    input: |
      [{"id":1,"name":"Ana","city":"Santiago"},{"id":2,"name":"Luis","city":"Lima, Perú"}]
    output: |
      id,name,city
      1,Ana,Santiago
      2,Luis,"Lima, Perú"
  - title: 'De CSV com ponto e vírgula para JSON, com tipos detectados'
    input: |
      id;name;active
      1;Ana;true
      2;"Luis ""Lucho""";false
    output: |
      [
        { "id": 1, "name": "Ana", "active": true },
        { "id": 2, "name": "Luis \"Lucho\"", "active": false }
      ]
faq:
  - q: 'O que acontece com objetos aninhados?'
    a: 'Cada chave de primeiro nível vira uma coluna. Se um valor é um objeto ou um array, ele é escrito como JSON dentro da célula, entre aspas, para não perder informação.'
  - q: 'Por que o Excel mostra tudo em uma única coluna?'
    a: 'Em regiões que usam vírgula decimal, como o Brasil, o Excel espera ponto e vírgula como separador. Escolha “Ponto e vírgula ;” antes de copiar o resultado e o Excel separa as colunas.'
  - q: 'Como as aspas são escapadas em CSV?'
    a: 'Seguindo a RFC 4180: uma célula com separador, quebra de linha ou aspas fica entre aspas duplas, e cada aspa interna é duplicada. A ferramenta faz isso ao gerar e entende ao ler.'
---

Esta ferramenta converte nos dois sentidos entre um array de objetos JSON e um CSV. De JSON para CSV, a primeira linha traz os nomes das colunas, tirados de todas as chaves que aparecem nos objetos, mesmo que nem todos tenham as mesmas. Células que contêm o separador, aspas ou quebras de linha ficam entre aspas, como pede a RFC 4180, para que Excel, Google Sheets ou qualquer leitor de CSV as abram sem quebrar linhas.

De CSV para JSON, cada linha vira um objeto cujas chaves são os cabeçalhos. Se você ativar **Detectar números e booleanos**, valores como `42`, `3.5`, `true` ou `false` são convertidos para o seu tipo em vez de ficarem como texto, o que poupa um passo quando o JSON vai direto para uma API ou um teste. Se o arquivo tiver uma aspa sem fechar, você vê a linha onde ela começa.

Você pode escolher vírgula, ponto e vírgula ou tabulação como separador. O ponto e vírgula é o padrão em planilhas configuradas em português ou espanhol, onde a vírgula é o separador decimal.

A conversão acontece toda no seu navegador: dá para colar exportações com dados de clientes ou de produção sem que saiam da aba.
