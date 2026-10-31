---
title: 'Codificar e decodificar Base64 online'
description: 'Codifique e decodifique Base64 com texto UTF-8, a variante segura para URL e arquivos em data URI. Nada é enviado: tudo roda no navegador.'
examples:
  - title: 'Codificar texto com acentos (UTF-8)'
    input: |
      Olá, mundo!
    output: |
      T2zDoSwgbXVuZG8h
  - title: 'Decodificar o cabeçalho de um JWT'
    input: |
      eyJhbGciOiJIUzI1NiJ9
    output: |
      {"alg":"HS256"}
faq:
  - q: 'Base64 é criptografia?'
    a: 'Não. Base64 é só uma codificação: qualquer pessoa pode revertê-la sem chave. Serve para transportar bytes por canais de texto, não para proteger informação.'
  - q: 'O que é Base64 URL-safe?'
    a: 'É a variante da RFC 4648 que troca + por - e / por _, e omite o preenchimento =. É usada em JWT, URLs e nomes de arquivo, onde esses caracteres causam problemas.'
  - q: 'Por que o resultado é maior que a entrada?'
    a: 'Base64 representa cada 3 bytes com 4 caracteres, então o resultado cresce cerca de 33 %. A ferramenta mostra os bytes de entrada e de saída.'
  - q: 'Posso converter uma imagem para Base64?'
    a: 'Sim. Com “Arquivo → data URI” você escolhe um arquivo local e recebe um data URI pronto para CSS ou HTML. O arquivo é lido no navegador e não é enviado a lugar nenhum.'
---

Base64 transforma bytes em texto usando 64 caracteres seguros, e é a forma comum de colocar dados binários em JSON, cabeçalhos HTTP, e-mails ou em um data URI. Esta ferramenta codifica e decodifica enquanto você digita e trata o texto como **UTF-8**, então acentos, ç e emojis são codificados exatamente como um servidor faria, e a decodificação não mostra caracteres quebrados.

Ao decodificar, se o resultado for texto legível, ele aparece como está. Se forem bytes binários, como uma imagem ou um arquivo compactado, você vê uma visualização hexadecimal e o tamanho em vez de caracteres sem sentido. A entrada aceita tanto o Base64 padrão quanto a variante **URL-safe**, com ou sem o preenchimento `=`, e com espaços ou quebras de linha no meio.

Ative **URL-safe** para gerar a variante usada em JWT e URLs, sem `+`, `/` nem `=`. Com **Arquivo → data URI** você transforma uma imagem ou uma fonte em um `data:` URI pronto para colar em CSS ou HTML.

Tudo acontece no seu navegador: nem o texto nem os arquivos são enviados a um servidor. Se você colar um Base64 na página inicial, o ByteKnife o reconhece e abre aqui.
