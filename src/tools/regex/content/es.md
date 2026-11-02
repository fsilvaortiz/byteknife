---
title: 'Probar expresiones regulares JavaScript online'
description: 'Prueba expresiones regulares de JavaScript con resaltado en vivo, grupos con nombre y reemplazo. Corre en un Worker con límite de tiempo.'
examples:
  - title: 'Capturar fechas y reordenarlas con un reemplazo'
    input: |
      Patrón:     (\d{4})-(\d{2})-(\d{2})   flags: g
      Texto:      deploy 2026-10-29, rollback 2026-10-30
      Reemplazo:  $3/$2/$1
    output: |
      2 coincidencias
      #1  2026-10-29   $1=2026  $2=10  $3=29
      #2  2026-10-30   $1=2026  $2=10  $3=30
      deploy 29/10/2026, rollback 30/10/2026
  - title: 'Grupos con nombre'
    input: |
      Patrón:  (?<user>[\w.]+)@(?<domain>[\w.-]+)   flags: gi
      Texto:   ana@example.com, luis.p@byteknife.dev
    output: |
      #1  ana@example.com        user=ana     domain=example.com
      #2  luis.p@byteknife.dev   user=luis.p  domain=byteknife.dev
faq:
  - q: '¿Qué motor de expresiones regulares usa?'
    a: 'El de JavaScript de tu navegador (RegExp de ECMAScript). Funciona igual en Node.js, Deno y en el frontend; otros motores como PCRE, Python o Java tienen diferencias en lookbehind, flags y clases Unicode.'
  - q: '¿Qué pasa si mi regex se queda colgada?'
    a: 'Se evalúa en un Web Worker con un límite de 1 segundo. Si lo supera, el Worker se detiene y verás un aviso de posible backtracking catastrófico, sin que la pestaña se congele.'
  - q: '¿Cómo uso los grupos en el reemplazo?'
    a: 'Con $1, $2… para los grupos numerados, $<nombre> para los grupos con nombre y $& para la coincidencia completa, igual que en String.prototype.replace.'
---

Las expresiones regulares son la forma más rápida de buscar, validar o transformar texto, y también la más fácil de equivocar. Esta herramienta te deja probar un patrón contra un texto real y ver al instante qué coincide: cada coincidencia queda **resaltada** en el texto, y debajo verás la lista con su posición y el valor de cada **grupo de captura**, incluidos los grupos con nombre (`(?<nombre>…)`).

Puedes activar las flags más usadas con un clic: `g` (global), `i` (ignorar mayúsculas), `m` (multilínea), `s` (el punto incluye saltos de línea) y `u` (Unicode). Si escribes un texto de **reemplazo**, verás el resultado de aplicar `replace` con referencias como `$1` o `$<nombre>`, listo para copiar.

El patrón se ejecuta con el motor `RegExp` de JavaScript, así que lo que funciona aquí funciona igual en tu código de Node.js o del navegador. Para que una expresión con **backtracking catastrófico**, como `(a+)+$`, no congele la página, la evaluación corre en un Web Worker con un límite de un segundo; si se pasa, la herramienta lo detiene y te avisa.

Si el patrón tiene un error de sintaxis, el mensaje aparece en lugar de los resultados. Ni el patrón ni el texto salen de tu navegador.
