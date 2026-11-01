---
title: 'Validar JSON contra JSON Schema online'
description: 'Cole um JSON Schema e um documento JSON e valide no navegador: drafts 4, 7, 2019-09 e 2020-12, com cada erro, o caminho e a regra que falha.'
examples:
  - title: 'Documento com vários erros'
    input: |
      Esquema: id inteiro ≥ 1, email com formato, plan em [free, pro, team], sem propriedades extras
      Documento: {"id": 0, "email": "ana.ejemplo.dev", "plan": "enterprise", "activo": true}
    output: |
      /id      minimum               0 is less than 1.
      /email   format                String does not match format "email".
      /plan    enum                  Instance does not match any of ["free","pro","team"].
      (raiz)   additionalProperties  Property "activo" does not match additional properties schema.
  - title: 'Documento válido'
    input: |
      {"id": 42, "email": "ana@ejemplo.dev", "plan": "pro"}
    output: |
      O documento atende ao esquema
faq:
  - q: 'Quais versões do JSON Schema são aceitas?'
    a: 'Draft 4, draft 7, 2019-09 e 2020-12. A versão vem do $schema; se o esquema não a declara, usa-se 2020-12. Você também pode escolhê-la à mão.'
  - q: 'Valida formatos como email, date-time ou uuid?'
    a: 'Sim, os formatos mais comuns são verificados: email, date, date-time, time, uri, uuid, ipv4, ipv6, hostname e regex, entre outros.'
  - q: 'Meus dados são enviados para algum servidor?'
    a: 'Não. A validação usa a biblioteca @cfworker/json-schema dentro do navegador. Ela foi escolhida porque interpreta o esquema sem gerar código, o que funciona com a CSP estrita do site.'
---

O **JSON Schema** descreve a forma que um JSON deve ter: quais campos são obrigatórios, de que tipo é cada um, quais valores são permitidos e que formato seguem. OpenAPI, validação de APIs, arquivos de configuração e muitos editores o usam. Este validador diz se um documento atende a um esquema e, se não, por quê.

Cole o **esquema** à esquerda e o **documento** à direita. A validação acontece enquanto você digita. Se algum dos dois não for JSON válido, você vê a linha e a coluna do erro.

Cada problema aparece com o **caminho** no documento, como `/items/0/email`, a **regra** que falha (`required`, `type`, `enum`, `minimum`, `format`, `additionalProperties`…) e o detalhe. Todos os erros são listados, não só o primeiro, e as mensagens que só resumem outras são omitidas para a lista ficar clara.

O **draft** é detectado a partir do `$schema` e você pode forçá-lo: 4, 7, 2019-09 ou 2020-12. É útil para testar um esquema antes de publicá-lo, depurar por que uma API rejeita um payload ou revisar a configuração de um serviço.

Nada sai do seu navegador.
