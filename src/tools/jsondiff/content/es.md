---
title: 'Comparar JSON: diff estructural en línea'
description: 'Compara dos JSON por estructura y ve qué claves se agregaron, quitaron o cambiaron, con su ruta. Ignora el orden de claves y, si quieres, el de los arreglos.'
examples:
  - title: 'Dos versiones de una configuración'
    input: |
      {"version": "2.14.0", "limites": {"rps": 1200}, "flags": {"beta": true}}
      {"version": "2.15.0", "limites": {"rps": 1500, "timeoutMs": 2500}, "flags": {}}
    output: |
      $.version            "2.14.0"  →  "2.15.0"
      $.limites.rps        1200      →  1500
      + $.limites.timeoutMs          2500
      − $.flags.beta       true
  - title: 'Arreglos sin importar el orden'
    input: |
      ["admin", "dev", "ops"]
      ["ops", "admin", "qa"]
    output: |
      − $[1]  "dev"
      + $[2]  "qa"
faq:
  - q: '¿En qué se diferencia de un diff de texto?'
    a: 'Un diff de texto compara líneas, así que cambia todo si el JSON se formateó distinto o las claves vienen en otro orden. Este diff compara valores: dos JSON equivalentes no muestran diferencias aunque se vean distintos.'
  - q: '¿Cómo se leen las rutas?'
    a: 'Usan la notación de JSONPath: $ es la raíz, .clave entra en un objeto y [0] en un arreglo. Las claves con espacios o símbolos se escriben entre corchetes, como $["clave rara"].'
  - q: '¿Qué hace «Ignorar el orden en arreglos»?'
    a: 'Compara cada arreglo como un conjunto: si los mismos elementos aparecen en otro orden, no hay cambios. Solo se informan los elementos que faltan o sobran. Sirve para listas de permisos, etiquetas o IDs.'
  - q: '¿Puedo comparar respuestas de una API con datos reales?'
    a: 'Sí. La comparación ocurre en tu navegador y ninguno de los dos JSON se envía a un servidor.'
---

Cuando una API responde distinto entre dos versiones, o un archivo de configuración cambió entre entornos, comparar el JSON a ojo es lento y propenso a errores. Esta herramienta hace un **diff estructural**: interpreta ambos JSON y compara sus valores, no sus líneas.

El resultado es una tabla con la **ruta** de cada diferencia y sus valores **antes** y **después**. Las claves nuevas aparecen como agregadas, las que ya no están como quitadas, y los valores distintos como cambiados, incluso si cambió el tipo, por ejemplo de número a texto. El orden de las claves de un objeto nunca cuenta, y tampoco los espacios ni la sangría.

Los arreglos se comparan **por posición**: si insertas un elemento al principio, todos los siguientes cuentan como cambiados. Si el orden no importa, como en una lista de roles o de etiquetas, activa **Ignorar el orden en arreglos** y solo verás los elementos que faltan o sobran.

Es útil para revisar contratos de API, comparar fixtures de pruebas, auditar cambios en archivos de configuración o en feature flags, y entender qué cambió en un payload de webhook. Si alguno de los dos JSON tiene un error, verás su línea y columna.
