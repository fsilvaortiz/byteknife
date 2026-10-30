---
title: 'Decodificar JWT e verificar assinatura HS256'
description: 'Decodifique um JWT e leia o cabeçalho, o payload e as datas exp, iat e nbf. Verifique assinaturas HS256, HS384 e HS512 sem o token sair do navegador.'
examples:
  - title: 'Ler um token'
    input: |
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBZGEiLCJpYXQiOjE3OTMzMTg0MDAsImV4cCI6MTc5MzMyMjAwMH0._DX8uh7t6vcFdmwuAPKekQPEJ93tmXRQp9w8arzwRwo
    output: |
      Cabeçalho  {"alg": "HS256", "typ": "JWT"}
      Payload    {"sub": "42", "name": "Ada", "iat": 1793318400, "exp": 1793322000}
      Emitido (iat)  2026-10-30T00:00:00.000Z
      Expira (exp)   2026-10-30T01:00:00.000Z
  - title: 'Verificar a assinatura com o segredo HMAC'
    input: |
      Segredo: byteknife    →  mesmo token
      Segredo: outro        →  mesmo token
    output: |
      Assinatura válida
      Assinatura não confere
faq:
  - q: 'É seguro colar um JWT de produção aqui?'
    a: 'O token e o segredo são processados só nesta aba com Web Crypto e não são enviados a nenhum servidor. Mesmo assim, um JWT válido é uma credencial: trate-o como uma senha e não o compartilhe.'
  - q: 'Decodificar um JWT é o mesmo que verificá-lo?'
    a: 'Não. Qualquer pessoa pode decodificar o cabeçalho e o payload, porque estão só em Base64URL. Verificar significa conferir a assinatura com a chave, e é a única coisa que prova que o token não foi alterado.'
  - q: 'Por que não consigo verificar RS256 ou ES256?'
    a: 'Esses algoritmos usam uma chave pública (RSA ou curva elíptica) em vez de um segredo compartilhado. Por enquanto a ferramenta verifica HS256, HS384 e HS512; para os demais, mostra o algoritmo e decodifica o conteúdo.'
---

Um JSON Web Token tem três partes separadas por pontos: o **cabeçalho**, o **payload** e a **assinatura**, sendo as duas primeiras JSON codificado em Base64URL. Cole um token e você vê o cabeçalho e o payload formatados, com o algoritmo em destaque, e uma linha do tempo com as datas que costumam definir a validade: `iat` (emitido), `nbf` (válido a partir de), `exp` (expira) e `auth_time`. Cada data aparece em ISO 8601 e em tempo relativo, e um indicador mostra se o token está ativo, ainda não é válido ou já expirou.

Se o token usa HMAC (`HS256`, `HS384` ou `HS512`), você pode digitar o segredo e a ferramenta verifica a assinatura com Web Crypto enquanto você digita. É útil para depurar uma integração: você descobre se o problema é o segredo, o algoritmo ou um payload alterado, sem escrever código nem instalar nada.

A ferramenta aceita tokens com o prefixo `Bearer` ou com espaços em volta, do jeito que você copia de um cabeçalho `Authorization`. Se o formato estiver errado, ela diz qual parte falha.

Nem o token nem o segredo saem do seu navegador. Se você colar um JWT na página inicial do ByteKnife, ele é reconhecido e aberto aqui.
