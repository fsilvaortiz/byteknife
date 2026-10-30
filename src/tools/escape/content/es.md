---
title: 'Escapar HTML, cadenas JSON y Unicode'
description: 'Escapa y desescapa entidades HTML, literales de cadena JSON y secuencias Unicode \u. Ideal para pegar texto en código, plantillas o logs.'
examples:
  - title: 'Escapar HTML antes de mostrarlo en una página'
    input: |
      <a href="/buscar?q=1&lang=es">Tom's</a>
    output: |
      &lt;a href=&quot;/buscar?q=1&amp;lang=es&quot;&gt;Tom&#39;s&lt;/a&gt;
  - title: 'Pasar texto a secuencias Unicode \u'
    input: |
      café ☕ 🚀
    output: |
      café ☕ 🚀
faq:
  - q: '¿Qué caracteres escapa el modo HTML?'
    a: 'Los cinco que pueden romper el marcado o abrir una inyección: & < > " y la comilla simple. Al desescapar, además de esos, se entienden las entidades numéricas como &#233; o &#xE9; y las entidades con nombre más comunes.'
  - q: '¿Por qué el emoji se convierte en dos secuencias \u?'
    a: 'JavaScript y JSON representan los caracteres fuera del plano básico con un par sustituto UTF-16. 🚀 es U+1F680 y se escribe 🚀; al desescapar, el par vuelve a ser un solo carácter.'
  - q: '¿Cuándo uso el modo cadena JSON?'
    a: 'Cuando necesitas meter texto con saltos de línea, tabuladores, comillas o barras invertidas dentro de un string JSON o JavaScript. El resultado es el contenido entre las comillas, listo para pegar.'
---

Escapar es reemplazar los caracteres que tienen un significado especial en un formato por una secuencia que lo representa sin ambigüedad. Esta herramienta lo hace, y lo revierte, para los tres casos que más aparecen en el día a día:

- **HTML:** convierte `&`, `<`, `>`, comillas dobles y comillas simples en entidades. Es lo que necesitas para mostrar código o texto de usuario dentro de una página sin que el navegador lo interprete como marcado. Al desescapar, entiende entidades con nombre y numéricas.
- **Cadena JSON:** produce el contenido de un string JSON válido, con `\n`, `\t`, `\"` y `\\`. Sirve para incrustar un fragmento de texto, un mensaje de error o un bloque de SQL en un archivo JSON o en un test.
- **Unicode `\u`:** pasa todo lo que no es ASCII a secuencias `\uXXXX`, incluidos los pares sustitutos de los emojis. Es útil para archivos de propiedades, código que debe ser ASCII puro o para ver qué caracteres invisibles trae un texto copiado.

Elige el formato y la dirección, escapar o desescapar, y el resultado se actualiza mientras escribes. Si una secuencia no es válida, por ejemplo un código mayor que `10FFFF`, verás el error en vez de un resultado a medias. Todo ocurre en tu navegador.
