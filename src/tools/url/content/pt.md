---
title: 'Codificar e decodificar URL (percent-encoding)'
description: 'Codifique e decodifique URLs e componentes com percent-encoding UTF-8, e separe uma URL em protocolo, host, porta, caminho e parâmetros.'
examples:
  - title: 'Codificar um valor para um parâmetro de consulta'
    input: |
      preço=10€ & frete grátis
    output: |
      pre%C3%A7o%3D10%E2%82%AC%20%26%20frete%20gr%C3%A1tis
  - title: 'Separar uma URL com parâmetros'
    input: |
      https://api.example.com:8443/v1/search?q=caf%C3%A9%20com%20leite&page=2#results
    output: |
      Protocolo   https:
      Host        api.example.com
      Porta       8443
      Caminho     /v1/search
      Fragmento   #results
      Origem      https://api.example.com:8443
      q           café com leite
      page        2
faq:
  - q: 'Qual é a diferença entre codificar um componente e a URL completa?'
    a: 'Codificar um componente (como encodeURIComponent) também escapa / ? & = e #, porque o valor vai dentro de um parâmetro. Codificar a URL completa (como encodeURI) mantém esses separadores para que a URL continue funcionando.'
  - q: 'Por que aparece %20 ou +?'
    a: 'Os dois representam um espaço. %20 é o percent-encoding padrão; + só significa espaço em formulários application/x-www-form-urlencoded. Esta ferramenta gera %20, que funciona em qualquer parte da URL.'
  - q: 'O que significa o erro de sequência % malformada?'
    a: 'Cada % precisa ser seguido de dois dígitos hexadecimais que formem UTF-8 válido. Um % solto, como em 100%, deve ser escrito %25.'
---

URLs só aceitam um conjunto limitado de caracteres. Espaços, acentos, emojis e símbolos com significado especial, como `&`, `=`, `?` ou `#`, são escritos com **percent-encoding**: cada byte UTF-8 vira `%` seguido de dois dígitos hexadecimais. Esta ferramenta faz essa conversão nos dois sentidos enquanto você digita.

Escolha **Codificar componente** quando o texto vai dentro de um parâmetro ou de um segmento de caminho. Nesse caso os separadores também são escapados, para que um `&` no valor não divida a consulta em duas. Use **Codificar URL completa** quando você tem uma URL inteira com espaços ou acentos e quer que ela continue navegável sem mexer nos separadores. **Decodificar** reverte as duas formas e avisa se encontrar um `%` que não forma uma sequência válida.

Se você colar uma URL absoluta, também verá a decomposição dela: protocolo, host, porta, caminho, fragmento, origem e a lista de parâmetros já decodificados. É o jeito rápido de ler um link de rastreamento longo, conferir um callback de OAuth ou ver o que a sua API realmente recebe.

Tudo é processado no navegador com as APIs padrão `URL` e `encodeURIComponent`; nada é enviado a um servidor.
