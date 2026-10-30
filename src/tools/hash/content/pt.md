---
title: 'Gerar hash MD5, SHA-1, SHA-256 e SHA-512'
description: 'Calcule MD5, SHA-1, SHA-256, SHA-384 e SHA-512 de um texto ou de um arquivo local, em hexadecimal ou Base64. O arquivo nunca é enviado.'
examples:
  - title: 'Os cinco hashes de um texto'
    input: |
      hello
    output: |
      MD5      5d41402abc4b2a76b9719d911017c592
      SHA-1    aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
      SHA-256  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
      SHA-384  59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f
      SHA-512  9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043
  - title: 'SHA-256 em Base64, como no Subresource Integrity'
    input: |
      hello
    output: |
      LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=
faq:
  - q: 'Meu arquivo é enviado para algum servidor?'
    a: 'Não. O arquivo é lido com a File API e processado em um Web Worker dentro do seu navegador. Você pode calcular o hash de um instalador ou de um backup sem que ele saia da sua máquina.'
  - q: 'Posso usar MD5 ou SHA-1 para senhas ou assinaturas?'
    a: 'Não. Os dois têm colisões conhecidas e servem só para detectar corrupção acidental, não adulteração. Para senhas, use um algoritmo lento como Argon2, scrypt ou bcrypt.'
  - q: 'Por que meu hash não bate com o de outra ferramenta?'
    a: 'Quase sempre por uma quebra de linha no final ou pela codificação. Aqui o texto é processado como UTF-8 exatamente como você digitou; echo sem -n adiciona uma quebra de linha que muda o resultado.'
---

Uma função hash transforma qualquer entrada em uma impressão digital de tamanho fixo: o mesmo conteúdo sempre gera o mesmo resultado, e a menor mudança gera um completamente diferente. Esta ferramenta calcula ao mesmo tempo **MD5, SHA-1, SHA-256, SHA-384 e SHA-512**, para você comparar com o valor publicado sem precisar escolher o algoritmo antes.

Digite ou cole um texto e os hashes são atualizados enquanto você digita. O texto é codificado como UTF-8, como na maioria das linguagens e no `sha256sum`. Você também pode escolher um **arquivo local**: ele é lido em um Web Worker para que a página não trave, mesmo com arquivos grandes, e é assim que você confere se um download ou um backup não está corrompido.

O resultado pode aparecer em **hexadecimal**, em maiúsculas ou minúsculas, ou em **Base64**, o formato usado pelos atributos `integrity` do Subresource Integrity e por algumas APIs de armazenamento.

Os algoritmos SHA usam Web Crypto, a implementação nativa do navegador; o MD5, que o Web Crypto não inclui, usa uma implementação própria testada com os vetores da RFC 1321. Nem o texto nem os arquivos saem do seu navegador.
