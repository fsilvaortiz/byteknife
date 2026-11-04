---
title: 'Convertir JSON a CSV y CSV a JSON'
description: 'Convierte arreglos de objetos JSON a CSV y de vuelta, con coma, punto y coma o tabulador. Detecta números y booleanos. Todo en tu navegador.'
examples:
  - title: 'De JSON a CSV con un valor que lleva coma'
    input: |
      [{"id":1,"name":"Ana","city":"Santiago"},{"id":2,"name":"Luis","city":"Lima, Perú"}]
    output: |
      id,name,city
      1,Ana,Santiago
      2,Luis,"Lima, Perú"
  - title: 'De CSV con punto y coma a JSON, con tipos detectados'
    input: |
      id;name;active
      1;Ana;true
      2;"Luis ""Lucho""";false
    output: |
      [
        { "id": 1, "name": "Ana", "active": true },
        { "id": 2, "name": "Luis \"Lucho\"", "active": false }
      ]
faq:
  - q: '¿Qué pasa con los objetos anidados?'
    a: 'Cada clave de primer nivel es una columna. Si un valor es un objeto o un arreglo, se escribe como JSON dentro de la celda, entre comillas, para que no se pierda información.'
  - q: '¿Por qué Excel muestra todo en una sola columna?'
    a: 'En países que usan coma decimal, Excel espera punto y coma como separador. Elige «Punto y coma ;» antes de copiar el resultado y Excel lo separará en columnas.'
  - q: '¿Cómo se escapan las comillas en CSV?'
    a: 'Siguiendo RFC 4180: una celda con separador, salto de línea o comillas se encierra entre comillas dobles, y cada comilla interna se duplica. La herramienta lo hace al generar y lo entiende al leer.'
---

Esta herramienta convierte en ambas direcciones entre un arreglo de objetos JSON y un CSV. Al pasar de JSON a CSV, la primera fila lleva los nombres de columna, tomados de todas las claves que aparecen en los objetos, aunque no todos tengan las mismas. Las celdas que contienen el separador, comillas o saltos de línea se encierran entre comillas, como pide RFC 4180, para que Excel, Google Sheets o cualquier lector de CSV las abran sin romper filas.

Al pasar de CSV a JSON, cada fila se transforma en un objeto cuyas claves son los encabezados. Si activas **Detectar números y booleanos**, valores como `42`, `3.5`, `true` o `false` se convierten a su tipo en lugar de quedar como texto, lo que ahorra un paso cuando el JSON va directo a una API o a un test. Si el archivo tiene una comilla sin cerrar, verás la línea donde empieza.

Puedes elegir coma, punto y coma o tabulador como separador. El punto y coma es el habitual en planillas configuradas en español o portugués, donde la coma se usa como separador decimal.

La conversión ocurre completa en tu navegador: puedes pegar exportaciones con datos de clientes o de producción sin que salgan de la pestaña.
