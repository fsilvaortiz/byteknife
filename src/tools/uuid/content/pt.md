---
title: 'Gerador de UUID v4 e v7 e inspetor'
description: 'Gere UUID v4 e v7 em lote com o crypto do navegador e inspecione qualquer UUID: versão, variante e a data que um v7 carrega.'
examples:
  - title: 'Inspecionar um UUID v7 e ler a data'
    input: |
      01a18a1b-3000-710e-b358-7da2c7ec1136
    output: |
      Versão          7
      Variante        RFC 9562
      Data embutida   2026-10-30T00:00:00.000Z
  - title: 'Normalizar um UUID em maiúsculas e sem hífens'
    input: |
      F47AC10B58CC4372A5670E02B2C3D479
    output: |
      Versão      4
      Variante    RFC 9562
      Canônico    f47ac10b-58cc-4372-a567-0e02b2c3d479
faq:
  - q: 'Uso UUID v4 ou v7?'
    a: 'O v4 é totalmente aleatório e serve para quase tudo. O v7 começa com o instante de criação em milissegundos, então os UUIDs ficam ordenados por tempo; isso melhora o desempenho dos índices do banco de dados quando são usados como chave primária.'
  - q: 'Os UUIDs gerados aqui são seguros?'
    a: 'Eles são gerados com crypto.getRandomValues, o gerador criptográfico do navegador. O v4 tem 122 bits aleatórios; o v7, depois do timestamp, um contador de 12 bits que começa em um valor aleatório e 62 bits aleatórios. Os UUIDs de um mesmo lote v7 são estritamente crescentes.'
  - q: 'Um UUID v7 revela quando foi criado?'
    a: 'Sim. Os primeiros 48 bits são o timestamp Unix em milissegundos, e o inspetor mostra isso como data. Se esse dado não pode ser público, use v4.'
---

Um UUID é um identificador de 128 bits que pode ser gerado em qualquer lugar sem coordenar com um servidor, com probabilidade de colisão desprezível. Esta ferramenta gera **UUID v4**, totalmente aleatórios, e **UUID v7**, o formato da RFC 9562 que coloca o instante de criação na frente e por isso é ordenado por tempo. Você pode gerar até 500 de uma vez, tirar os hífens ou passar para maiúsculas, e copiar todos com um clique.

O **inspetor** aceita qualquer UUID, com ou sem hífens, em maiúsculas ou minúsculas, e mostra a versão, a variante e a forma canônica. Para v1, v6 e v7, também extrai a data embutida. Ele reconhece ainda os valores especiais Nil (`00000000-…`) e Max (`ffffffff-…`).

O v7 é uma boa escolha como chave primária no PostgreSQL, no MySQL e em outros bancos com índices B-tree: como os valores novos chegam em ordem, as inserções não fragmentam o índice como acontece com o v4. O v4 continua sendo a opção padrão quando o identificador não deve revelar quando foi criado.

A aleatoriedade vem de `crypto.getRandomValues` e nada sai do seu navegador. Se você colar um UUID na página inicial do ByteKnife, ele abre aqui no inspetor.
