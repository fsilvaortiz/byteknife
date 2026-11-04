---
title: 'Testar expressões regulares JavaScript online'
description: 'Teste expressões regulares JavaScript com destaque ao vivo, grupos nomeados e substituição. Roda em um Worker com limite de tempo.'
examples:
  - title: 'Capturar datas e reordená-las com uma substituição'
    input: |
      Padrão:        (\d{4})-(\d{2})-(\d{2})   flags: g
      Texto:         deploy 2026-10-29, rollback 2026-10-30
      Substituição:  $3/$2/$1
    output: |
      2 correspondências
      #1  2026-10-29   $1=2026  $2=10  $3=29
      #2  2026-10-30   $1=2026  $2=10  $3=30
      deploy 29/10/2026, rollback 30/10/2026
  - title: 'Grupos nomeados'
    input: |
      Padrão:  (?<user>[\w.]+)@(?<domain>[\w.-]+)   flags: gi
      Texto:   ana@example.com, luis.p@byteknife.dev
    output: |
      #1  ana@example.com        user=ana     domain=example.com
      #2  luis.p@byteknife.dev   user=luis.p  domain=byteknife.dev
faq:
  - q: 'Qual motor de expressões regulares é usado?'
    a: 'O de JavaScript do seu navegador (RegExp do ECMAScript). Ele funciona igual no Node.js, no Deno e no frontend; outros motores como PCRE, Python ou Java têm diferenças em lookbehind, flags e classes Unicode.'
  - q: 'E se minha regex travar?'
    a: 'Ela é avaliada em um Web Worker com limite de 1 segundo. Se passar disso, o Worker é interrompido e aparece um aviso de possível backtracking catastrófico, sem a aba congelar.'
  - q: 'Como uso os grupos na substituição?'
    a: 'Com $1, $2… para grupos numerados, $<nome> para grupos nomeados e $& para a correspondência inteira, como em String.prototype.replace.'
---

Expressões regulares são o jeito mais rápido de buscar, validar ou transformar texto, e também o mais fácil de errar. Esta ferramenta permite testar um padrão contra um texto real e ver na hora o que corresponde: cada correspondência fica **destacada** no texto e, abaixo, aparece a lista com a posição e o valor de cada **grupo de captura**, incluindo grupos nomeados (`(?<nome>…)`).

Você pode ativar as flags mais usadas com um clique: `g` (global), `i` (ignorar maiúsculas), `m` (multilinha), `s` (o ponto inclui quebras de linha) e `u` (Unicode). Se você digitar um texto de **substituição**, verá o resultado de aplicar `replace` com referências como `$1` ou `$<nome>`, pronto para copiar.

O padrão roda no motor `RegExp` do JavaScript, então o que funciona aqui funciona igual no seu código Node.js ou no navegador. Para que uma expressão com **backtracking catastrófico**, como `(a+)+$`, não trave a página, a avaliação roda em um Web Worker com limite de um segundo; se demorar mais, a ferramenta interrompe e avisa.

Se o padrão tiver um erro de sintaxe, a mensagem aparece no lugar dos resultados. Nem o padrão nem o texto saem do seu navegador.
