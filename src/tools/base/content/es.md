---
title: 'Convertir binario, octal, decimal y hexadecimal'
description: 'Convierte números entre binario, octal, decimal y hexadecimal sin límite de tamaño gracias a BigInt. Muestra bits, bytes y el carácter Unicode.'
examples:
  - title: 'Un byte en todas las bases'
    input: |
      255
    output: |
      Decimal        255
      Hexadecimal    FF
      Binario        1111 1111
      Octal          377
      8 bits · 1 bytes · U+00FF ÿ
  - title: 'Un entero de 64 bits sin perder precisión'
    input: |
      18446744073709551615
    output: |
      Hexadecimal    FFFF FFFF FFFF FFFF
      Octal          1777777777777777777777
      64 bits · 8 bytes
faq:
  - q: '¿Hay un límite de tamaño?'
    a: 'No en la práctica. La conversión usa BigInt, así que los enteros de 64, 128 o más bits se convierten sin el redondeo que sufre Number por encima de 2^53.'
  - q: '¿Cómo detecta la base de entrada?'
    a: 'En modo automático, el prefijo manda: 0x es hexadecimal, 0b binario y 0o octal; sin prefijo se lee como decimal. También puedes fijar la base a mano, por ejemplo para leer ff sin el 0x.'
  - q: '¿Acepta números negativos?'
    a: 'Sí. El signo se conserva en todas las representaciones; la herramienta no aplica complemento a dos.'
---

Pasar un número de una base a otra es una tarea diaria al leer un volcado de memoria, revisar permisos, depurar un protocolo binario o interpretar un código de color o de error. Escribe un número y la herramienta lo muestra a la vez en **decimal, hexadecimal, binario y octal**, con los dígitos agrupados para leerlos con facilidad: el hexadecimal y el binario en grupos de cuatro y el decimal con separador de miles.

La base de entrada se detecta por el prefijo, como en la mayoría de los lenguajes: `0x` para hexadecimal, `0b` para binario y `0o` para octal. Si prefieres, fija la base a mano. Cada representación se copia con su prefijo, lista para pegar en código.

Los números se manejan con `BigInt`, así que no hay límite práctico de tamaño ni pérdida de precisión: un `uint64` máximo o un hash de 256 bits se convierten exactos, cosa que `Number` no logra por encima de 2^53. También verás cuántos **bits y bytes** ocupa el valor y, si corresponde a un punto de código válido, el **carácter Unicode** que representa, útil para identificar un emoji o un carácter invisible a partir de su código.

Todo se calcula en tu navegador mientras escribes.
