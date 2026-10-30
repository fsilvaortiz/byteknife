---
title: 'Generador de UUID v4 y v7 e inspector'
description: 'Genera UUID v4 y v7 en lote con crypto del navegador e inspecciona cualquier UUID: versión, variante y la fecha que lleva un v7.'
examples:
  - title: 'Inspeccionar un UUID v7 y leer su fecha'
    input: |
      01a18a1b-3000-710e-b358-7da2c7ec1136
    output: |
      Versión         7
      Variante        RFC 9562
      Fecha embebida  2026-10-30T00:00:00.000Z
  - title: 'Normalizar un UUID en mayúsculas y sin guiones'
    input: |
      F47AC10B58CC4372A5670E02B2C3D479
    output: |
      Versión     4
      Variante    RFC 9562
      Canónico    f47ac10b-58cc-4372-a567-0e02b2c3d479
faq:
  - q: '¿Uso UUID v4 o v7?'
    a: 'v4 es completamente aleatorio y sirve para casi todo. v7 empieza con el instante de creación en milisegundos, así que los UUID quedan ordenados por tiempo; eso mejora el rendimiento de los índices de bases de datos cuando se usan como clave primaria.'
  - q: '¿Los UUID generados aquí son seguros?'
    a: 'Se generan con crypto.getRandomValues, el generador criptográfico del navegador. v4 tiene 122 bits aleatorios; v7, tras el timestamp, un contador de 12 bits que parte en un valor aleatorio y 62 bits aleatorios. Los UUID de un mismo lote v7 son estrictamente crecientes.'
  - q: '¿Un UUID v7 revela cuándo se creó?'
    a: 'Sí. Los primeros 48 bits son el timestamp Unix en milisegundos, y el inspector lo muestra como fecha. Si ese dato no debe ser público, usa v4.'
---

Un UUID es un identificador de 128 bits que se puede generar en cualquier lugar sin coordinarse con un servidor, con una probabilidad de colisión despreciable. Esta herramienta genera **UUID v4**, completamente aleatorios, y **UUID v7**, el formato de RFC 9562 que antepone el instante de creación y por eso se ordena por tiempo. Puedes generar hasta 500 de una vez, quitar los guiones o pasarlos a mayúsculas, y copiarlos todos con un clic.

El **inspector** acepta cualquier UUID, con o sin guiones, en mayúsculas o minúsculas, y te dice su versión, su variante y su forma canónica. Si es un v1, v6 o v7, además extrae la fecha embebida. Reconoce también los valores especiales Nil (`00000000-…`) y Max (`ffffffff-…`).

Los v7 son una buena elección como clave primaria en PostgreSQL, MySQL u otras bases de datos con índices B-tree: al llegar en orden, las inserciones no fragmentan el índice como ocurre con los v4. Los v4 siguen siendo la opción por defecto cuando el identificador no debe revelar cuándo se creó.

La aleatoriedad viene de `crypto.getRandomValues` y nada sale de tu navegador. Si pegas un UUID en el inicio de ByteKnife, se abre aquí en el inspector.
