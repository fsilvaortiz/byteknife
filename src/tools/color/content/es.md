---
title: 'Convertir colores HEX, RGB, HSL y OKLCH con contraste WCAG'
description: 'Convierte colores entre HEX, RGB, HSL y OKLCH, mide el contraste WCAG sobre blanco y negro y genera una escala OKLCH de 10 pasos.'
examples:
  - title: 'Un azul de marca en todos los formatos'
    input: |
      #2a4fd6
    output: |
      HEX     #2a4fd6
      RGB     rgb(42 79 214)
      HSL     hsl(227 68% 50%)
      OKLCH   oklch(49.2% 0.211 266.4)
      Sobre blanco  6.59 : 1  AA
      Sobre negro   3.19 : 1  AA texto grande
  - title: 'Un color con nombre CSS'
    input: |
      tomato
    output: |
      HEX     #ff6347
      OKLCH   oklch(69.6% 0.196 32.3)
      Sobre blanco  2.95 : 1  No pasa
      Sobre negro   7.13 : 1  AAA
faq:
  - q: '¿Qué significan AA y AAA?'
    a: 'Son los niveles de WCAG 2. AA pide un contraste de al menos 4.5:1 para texto normal y 3:1 para texto grande; AAA pide 7:1 y 4.5:1. La herramienta calcula la razón contra blanco y contra negro.'
  - q: '¿Por qué OKLCH?'
    a: 'OKLCH es un espacio de color perceptual: cambiar la luminosidad L cambia cuán claro se ve el color de forma pareja entre tonos. Por eso las escalas en OKLCH se ven más consistentes que las hechas en HSL, y CSS ya lo soporta con oklch().'
  - q: '¿Qué entradas acepta?'
    a: 'Cualquier color CSS válido: HEX de 3, 4, 6 u 8 dígitos, rgb(), hsl(), oklch(), nombres como tomato o rebeccapurple, y valores con transparencia.'
---

Esta herramienta toma cualquier color CSS y lo muestra en los formatos que usas a diario: **HEX**, **RGB**, **HSL** y **OKLCH**, además de un valor arbitrario de Tailwind (`bg-[#2a4fd6]`) y una variable CSS lista para pegar. Puedes escribir el color, pegarlo desde tu editor o elegirlo con el selector de color del sistema.

Junto a la muestra verás el **contraste WCAG** del color sobre blanco y sobre negro, con la razón exacta y el nivel que alcanza: AAA, AA, AA solo para texto grande, o si no pasa. Es la forma rápida de saber si un color de marca sirve para texto, para un botón o solo como fondo decorativo.

La **escala OKLCH** genera 10 tonos del mismo color, de muy claro a muy oscuro, manteniendo el matiz y ajustando el croma para que todos queden dentro de sRGB. Como OKLCH es perceptualmente uniforme, los pasos se ven parejos, a diferencia de las escalas hechas variando la luminosidad en HSL. Haz clic en cualquier paso para copiar su HEX.

El análisis del color usa el motor CSS de tu navegador y las conversiones se calculan localmente, sin enviar nada a un servidor. Si pegas un color en el inicio de ByteKnife, se detecta y se abre aquí.
