---
title: 'Generador de códigos QR: URL, texto y Wi-Fi'
description: 'Crea códigos QR para una URL, un texto o una red Wi-Fi, elige la corrección de errores y los colores, y descárgalos en SVG o PNG sin marcas de agua.'
examples:
  - title: 'QR de una URL'
    input: |
      https://byteknife.dev
    output: |
      Versión 2 · 25×25 módulos (corrección M)
      Descargas: SVG y PNG
  - title: 'QR para compartir el Wi-Fi'
    input: |
      SSID: Oficina-5G · WPA · clave: café&té;2026
    output: |
      WIFI:T:WPA;S:Oficina-5G;P:café&té\;2026;;
faq:
  - q: '¿Los códigos caducan o tienen límite de escaneos?'
    a: 'No. El QR contiene el texto o la URL directamente, sin redirecciones a un servicio intermedio, así que funciona para siempre y nadie registra quién lo escanea.'
  - q: '¿Qué nivel de corrección de errores elijo?'
    a: 'M (15 %) sirve para casi todo. Usa Q o H si el código se imprimirá en superficies que se ensucian o si quieres poner un logo encima: el código crece, pero se sigue leyendo aunque se dañe una parte.'
  - q: '¿Puedo usarlo en impresos?'
    a: 'Sí. Descarga el SVG para imprenta: es vectorial y se escala sin perder nitidez. Deja el margen blanco alrededor y mantén buen contraste entre el color y el fondo.'
---

Esta herramienta genera **códigos QR** en tu navegador, sin cuentas, sin marcas de agua y sin redirecciones: el contenido va directo dentro del código.

En **Texto o URL** escribe lo que quieras codificar: un enlace, un texto, un número de teléfono con `tel:` o un correo con `mailto:`. En **Wi-Fi** completa el nombre de la red, el tipo de seguridad y la contraseña, y obtendrás el código que los teléfonos reconocen para conectarse sin escribir la clave. Los caracteres especiales se escapan como pide el formato.

La **corrección de errores** decide cuánto del código puede dañarse sin que deje de leerse: de L (7 %) a H (30 %). Más corrección significa un código más denso. Puedes cambiar el **color** y el **fondo**; si el contraste es bajo, verás un aviso porque muchos lectores fallarán.

Descarga el resultado en **SVG**, vectorial e ideal para imprimir, o en **PNG** de 1024 píxeles para presentaciones y documentos. También ves la versión del código y su tamaño en módulos.

El código se dibuja en tu navegador con la librería `qrcode`: ni el texto ni la clave del Wi-Fi se envían a ningún servidor.
