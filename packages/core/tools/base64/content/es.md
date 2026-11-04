---
title: 'Codificar y decodificar Base64 online'
description: 'Codifica y decodifica Base64 con texto UTF-8, la variante segura para URL y archivos a data URI. Sin subir nada: todo corre en tu navegador.'
examples:
  - title: 'Codificar texto con acentos (UTF-8)'
    input: |
      ¡Hola, mundo!
    output: |
      wqFIb2xhLCBtdW5kbyE=
  - title: 'Decodificar la cabecera de un JWT'
    input: |
      eyJhbGciOiJIUzI1NiJ9
    output: |
      {"alg":"HS256"}
faq:
  - q: '¿Base64 es cifrado?'
    a: 'No. Base64 es solo una codificación: cualquiera puede revertirla sin clave. Sirve para transportar bytes por canales de texto, no para proteger información.'
  - q: '¿Qué es Base64 URL-safe?'
    a: 'Es la variante de RFC 4648 que reemplaza + por - y / por _, y omite el relleno =. Se usa en JWT, en URLs y en nombres de archivo, donde esos caracteres causan problemas.'
  - q: '¿Por qué el resultado es más largo que la entrada?'
    a: 'Base64 representa cada 3 bytes con 4 caracteres, así que el resultado crece alrededor de un 33 %. La herramienta muestra los bytes de entrada y de salida.'
  - q: '¿Puedo convertir una imagen a Base64?'
    a: 'Sí. Con «Archivo → data URI» eliges un archivo local y obtienes un data URI listo para CSS o HTML. El archivo se lee en el navegador y no se sube a ningún lado.'
---

Base64 convierte bytes en texto usando 64 caracteres seguros, y es la forma habitual de meter datos binarios en JSON, en cabeceras HTTP, en correos o en un data URI. Esta herramienta codifica y decodifica mientras escribes y trata el texto como **UTF-8**, así que los acentos, la ñ y los emojis se codifican igual que en un servidor y no aparecen caracteres rotos al decodificar.

Al decodificar, si el resultado es texto legible lo verás tal cual. Si son bytes binarios, por ejemplo una imagen o un archivo comprimido, verás una vista hexadecimal y el tamaño, en lugar de caracteres sin sentido. La entrada acepta tanto Base64 estándar como la variante **URL-safe**, con o sin relleno `=`, y espacios o saltos de línea en medio.

Activa **URL-safe** para generar la variante que usan los JWT y las URLs, sin `+`, `/` ni `=`. Con **Archivo → data URI** conviertes una imagen o una fuente en un `data:` URI listo para pegar en CSS o HTML.

Todo pasa en tu navegador: ni el texto ni los archivos se envían a un servidor. Si pegas un Base64 en el inicio, ByteKnife lo reconoce y lo abre aquí.
