---
title: 'Converter cores HEX, RGB, HSL e OKLCH com contraste WCAG'
description: 'Converta cores entre HEX, RGB, HSL e OKLCH, confira o contraste WCAG sobre branco e preto e gere uma escala OKLCH de 10 passos.'
examples:
  - title: 'Um azul de marca em todos os formatos'
    input: |
      #2a4fd6
    output: |
      HEX     #2a4fd6
      RGB     rgb(42 79 214)
      HSL     hsl(227 68% 50%)
      OKLCH   oklch(49.2% 0.211 266.4)
      Sobre branco  6.59 : 1  AA
      Sobre preto   3.19 : 1  AA texto grande
  - title: 'Uma cor com nome CSS'
    input: |
      tomato
    output: |
      HEX     #ff6347
      OKLCH   oklch(69.6% 0.196 32.3)
      Sobre branco  2.95 : 1  Não passa
      Sobre preto   7.13 : 1  AAA
faq:
  - q: 'O que significam AA e AAA?'
    a: 'São os níveis da WCAG 2. AA exige contraste de pelo menos 4.5:1 para texto normal e 3:1 para texto grande; AAA exige 7:1 e 4.5:1. A ferramenta calcula a razão contra branco e contra preto.'
  - q: 'Por que OKLCH?'
    a: 'OKLCH é um espaço de cor perceptual: mudar a luminosidade L muda o quanto a cor parece clara de forma uniforme entre matizes. Por isso escalas em OKLCH parecem mais consistentes que as feitas em HSL, e o CSS já suporta com oklch().'
  - q: 'Quais entradas são aceitas?'
    a: 'Qualquer cor CSS válida: HEX de 3, 4, 6 ou 8 dígitos, rgb(), hsl(), oklch(), nomes como tomato ou rebeccapurple, e valores com transparência.'
---

Esta ferramenta recebe qualquer cor CSS e mostra nos formatos que você usa no dia a dia: **HEX**, **RGB**, **HSL** e **OKLCH**, além de um valor arbitrário do Tailwind (`bg-[#2a4fd6]`) e uma variável CSS pronta para colar. Você pode digitar a cor, colar do seu editor ou escolher no seletor de cores do sistema.

Ao lado da amostra aparece o **contraste WCAG** da cor sobre branco e sobre preto, com a razão exata e o nível atingido: AAA, AA, AA só para texto grande, ou se não passa. É o jeito rápido de saber se uma cor de marca serve para texto, para um botão ou só como fundo decorativo.

A **escala OKLCH** gera 10 tons da mesma cor, do muito claro ao muito escuro, mantendo o matiz e ajustando o croma para que todos fiquem dentro do sRGB. Como o OKLCH é perceptualmente uniforme, os passos parecem regulares, ao contrário das escalas feitas variando a luminosidade em HSL. Clique em qualquer passo para copiar o HEX.

A leitura da cor usa o motor CSS do seu navegador e as conversões são calculadas localmente, sem enviar nada a um servidor. Se você colar uma cor na página inicial do ByteKnife, ela é detectada e aberta aqui.
