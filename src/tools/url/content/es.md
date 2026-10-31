---
title: 'Codificar y decodificar URL (percent-encoding)'
description: 'Codifica y decodifica URLs y componentes con percent-encoding UTF-8, y desglosa una URL en protocolo, host, puerto, ruta y parámetros.'
examples:
  - title: 'Codificar un valor para un parámetro de consulta'
    input: |
      precio=10€ & envío gratis
    output: |
      precio%3D10%E2%82%AC%20%26%20env%C3%ADo%20gratis
  - title: 'Desglosar una URL con parámetros'
    input: |
      https://api.example.com:8443/v1/search?q=caf%C3%A9%20con%20leche&page=2#results
    output: |
      Protocolo   https:
      Host        api.example.com
      Puerto      8443
      Ruta        /v1/search
      Fragmento   #results
      Origen      https://api.example.com:8443
      q           café con leche
      page        2
faq:
  - q: '¿Qué diferencia hay entre codificar un componente y la URL completa?'
    a: 'Codificar un componente (como encodeURIComponent) escapa también / ? & = y #, porque el valor va dentro de un parámetro. Codificar la URL completa (como encodeURI) deja esos separadores intactos para que la URL siga funcionando.'
  - q: '¿Por qué aparece %20 o +?'
    a: 'Ambos representan un espacio. %20 es el percent-encoding estándar; + solo significa espacio dentro de formularios application/x-www-form-urlencoded. Esta herramienta genera %20, que funciona en cualquier parte de la URL.'
  - q: '¿Qué significa el error de secuencia % mal formada?'
    a: 'Cada % debe ir seguido de dos dígitos hexadecimales que formen UTF-8 válido. Un % suelto, como en 100%, debe escribirse %25.'
---

Las URLs solo admiten un conjunto limitado de caracteres. Los espacios, los acentos, los emojis y los símbolos con significado especial, como `&`, `=`, `?` o `#`, se escriben con **percent-encoding**: cada byte UTF-8 se convierte en `%` seguido de dos dígitos hexadecimales. Esta herramienta hace esa conversión en ambas direcciones mientras escribes.

Elige **Codificar componente** cuando el texto va dentro de un parámetro o de un segmento de ruta. En ese caso se escapan también los separadores, para que un `&` en el valor no parta la consulta en dos. Usa **Codificar URL completa** cuando tienes una URL entera con espacios o acentos y quieres que siga siendo navegable sin tocar sus separadores. **Decodificar** revierte ambas formas y te avisa si encuentra un `%` que no forma una secuencia válida.

Si pegas una URL absoluta, verás además su desglose: protocolo, host, puerto, ruta, fragmento, origen y la lista de parámetros ya decodificados. Es la forma rápida de leer un enlace de seguimiento largo, revisar un callback de OAuth o comprobar qué recibe realmente tu API.

Todo se procesa en el navegador con las APIs estándar `URL` y `encodeURIComponent`; nada se envía a un servidor.
