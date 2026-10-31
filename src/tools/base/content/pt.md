---
title: 'Converter binário, octal, decimal e hexadecimal'
description: 'Converta números entre binário, octal, decimal e hexadecimal sem limite de tamanho graças ao BigInt. Mostra bits, bytes e o caractere Unicode.'
examples:
  - title: 'Um byte em todas as bases'
    input: |
      255
    output: |
      Decimal        255
      Hexadecimal    FF
      Binário        1111 1111
      Octal          377
      8 bits · 1 bytes · U+00FF ÿ
  - title: 'Um inteiro de 64 bits sem perder precisão'
    input: |
      18446744073709551615
    output: |
      Hexadecimal    FFFF FFFF FFFF FFFF
      Octal          1777777777777777777777
      64 bits · 8 bytes
faq:
  - q: 'Existe limite de tamanho?'
    a: 'Na prática, não. A conversão usa BigInt, então inteiros de 64, 128 ou mais bits são convertidos sem o arredondamento que o Number sofre acima de 2^53.'
  - q: 'Como a base de entrada é detectada?'
    a: 'No modo automático, o prefixo decide: 0x é hexadecimal, 0b binário e 0o octal; sem prefixo, é lido como decimal. Você também pode fixar a base manualmente, por exemplo para ler ff sem o 0x.'
  - q: 'Aceita números negativos?'
    a: 'Sim. O sinal é mantido em todas as representações; a ferramenta não aplica complemento de dois.'
---

Converter um número de uma base para outra é tarefa diária ao ler um dump de memória, conferir permissões, depurar um protocolo binário ou interpretar um código de cor ou de erro. Digite um número e a ferramenta mostra ao mesmo tempo em **decimal, hexadecimal, binário e octal**, com os dígitos agrupados para facilitar a leitura: hexadecimal e binário em grupos de quatro e decimal com separador de milhar.

A base de entrada é detectada pelo prefixo, como na maioria das linguagens: `0x` para hexadecimal, `0b` para binário e `0o` para octal. Se preferir, fixe a base manualmente. Cada representação é copiada com o prefixo, pronta para colar no código.

Os números são tratados com `BigInt`, então não há limite prático de tamanho nem perda de precisão: um `uint64` máximo ou um hash de 256 bits são convertidos exatos, algo que o `Number` não consegue acima de 2^53. Você também vê quantos **bits e bytes** o valor ocupa e, quando é um ponto de código válido, o **caractere Unicode** que ele representa, útil para identificar um emoji ou um caractere invisível pelo código.

Tudo é calculado no seu navegador enquanto você digita.
