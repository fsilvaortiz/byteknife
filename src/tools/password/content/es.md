---
title: 'Generador de contraseñas seguras'
description: 'Genera contraseñas aleatorias con crypto.getRandomValues, elige largo y tipos de caracteres, evita los ambiguos y ve su entropía en bits.'
examples:
  - title: '16 caracteres con mayúsculas, minúsculas, dígitos y símbolos'
    input: |
      Largo 16 · A–Z · a–z · 0–9 · Símbolos
    output: |
      N]sFEgPHc%v9EGFE        (ejemplo: cada clic genera otras)
      Fuerte · 103 bits de entropía
  - title: '24 caracteres sin símbolos ni caracteres ambiguos'
    input: |
      Largo 24 · A–Z · a–z · 0–9 · Evitar ambiguos (Il1O0)
    output: |
      RfRFGAG6aE7zcv7YqqLDbpGF   (ejemplo)
      Excelente · 140 bits de entropía
faq:
  - q: '¿Las contraseñas se generan en un servidor?'
    a: 'No. Se generan en tu navegador con crypto.getRandomValues, el generador criptográfico del sistema, y nunca se transmiten ni se guardan.'
  - q: '¿Qué significa la entropía en bits?'
    a: 'Mide cuántos intentos necesitaría, en promedio, un atacante que conoce el método pero no la contraseña: cada bit duplica el esfuerzo. Se calcula como largo × log2 del total de caracteres posibles.'
  - q: '¿Cuántos bits necesito?'
    a: 'Como referencia, 80 bits ya resisten ataques de fuerza bruta en línea y 100 o más son una buena meta para claves maestras, cuentas de servicio o secretos de API.'
  - q: '¿Por qué evitar caracteres ambiguos?'
    a: 'I, l, 1, O y 0 se confunden al leer o dictar una contraseña. Quitarlos reduce un poco la entropía por carácter, lo que compensas con un largo mayor.'
---

Una contraseña segura es, ante todo, larga y realmente aleatoria. Esta herramienta genera varias a la vez usando `crypto.getRandomValues`, el generador criptográfico del navegador, y elige cada carácter de forma uniforme, sin el sesgo que introduce el típico `Math.random() % n`.

Puedes ajustar el **largo** y los conjuntos de caracteres: mayúsculas, minúsculas, dígitos y símbolos. Cada contraseña incluye al menos un carácter de cada conjunto que actives, para que cumpla las políticas que exigen, por ejemplo, un número y un símbolo. La opción **Evitar ambiguos** quita `I`, `l`, `1`, `O` y `0`, útil cuando la contraseña se va a leer en voz alta o copiar a mano.

Junto al resultado verás la **entropía** estimada en bits y una etiqueta de fuerza. La entropía depende del largo y del tamaño del alfabeto, no de que la contraseña «parezca» difícil: sumar cuatro caracteres suele aportar más que agregar símbolos.

Usa estas contraseñas para cuentas nuevas, secretos de API, claves de bases de datos o variables de entorno, y guárdalas en un gestor de contraseñas. Nada de lo que se genera sale de tu navegador ni se guarda en él.
