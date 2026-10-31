---
title: 'Escapar HTML, strings JSON e Unicode'
description: 'Escape e desescape entidades HTML, literais de string JSON e sequências Unicode \u. Ideal para colar texto em código, templates ou logs.'
examples:
  - title: 'Escapar HTML antes de mostrá-lo em uma página'
    input: |
      <a href="/busca?q=1&lang=pt">Tom's</a>
    output: |
      &lt;a href=&quot;/busca?q=1&amp;lang=pt&quot;&gt;Tom&#39;s&lt;/a&gt;
  - title: 'Transformar texto em sequências Unicode \u'
    input: |
      café ☕ 🚀
    output: |
      café ☕ 🚀
faq:
  - q: 'Quais caracteres o modo HTML escapa?'
    a: 'Os cinco que podem quebrar a marcação ou abrir uma injeção: & < > " e a aspa simples. Ao desescapar, ele também entende entidades numéricas como &#233; ou &#xE9; e as entidades nomeadas mais comuns.'
  - q: 'Por que o emoji vira duas sequências \u?'
    a: 'JavaScript e JSON representam caracteres fora do plano básico com um par substituto UTF-16. 🚀 é U+1F680 e se escreve 🚀; ao desescapar, o par volta a ser um único caractere.'
  - q: 'Quando uso o modo string JSON?'
    a: 'Quando você precisa colocar texto com quebras de linha, tabulações, aspas ou barras invertidas dentro de uma string JSON ou JavaScript. O resultado é o conteúdo entre as aspas, pronto para colar.'
---

Escapar é trocar os caracteres que têm significado especial em um formato por uma sequência que os representa sem ambiguidade. Esta ferramenta faz isso, e desfaz, para os três casos que mais aparecem no dia a dia:

- **HTML:** transforma `&`, `<`, `>`, aspas duplas e aspas simples em entidades. É o que você precisa para mostrar código ou texto de usuário dentro de uma página sem que o navegador o interprete como marcação. Ao desescapar, entende entidades nomeadas e numéricas.
- **String JSON:** gera o conteúdo de uma string JSON válida, com `\n`, `\t`, `\"` e `\\`. Serve para embutir um trecho de texto, uma mensagem de erro ou um bloco de SQL em um arquivo JSON ou em um teste.
- **Unicode `\u`:** passa tudo o que não é ASCII para sequências `\uXXXX`, incluindo os pares substitutos dos emojis. É útil para arquivos de propriedades, código que precisa ser ASCII puro ou para ver quais caracteres invisíveis um texto copiado traz.

Escolha o formato e a direção, escapar ou desescapar, e o resultado é atualizado enquanto você digita. Se uma sequência for inválida, por exemplo um código acima de `10FFFF`, você vê o erro em vez de um resultado pela metade. Tudo acontece no seu navegador.
