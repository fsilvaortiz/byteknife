---
title: 'Formatear y validar JSON online'
description: 'Formatea, minifica y valida JSON en tu navegador. Ordena claves y te dice la línea y la columna exactas del error. Nada se envía a un servidor.'
examples:
  - title: 'Formatear un JSON minificado'
    input: |
      {"name":"ByteKnife","tools":16,"offline":true,"langs":["es","en","pt"]}
    output: |
      {
        "name": "ByteKnife",
        "tools": 16,
        "offline": true,
        "langs": [
          "es",
          "en",
          "pt"
        ]
      }
  - title: 'Ordenar claves para comparar dos respuestas'
    input: |
      {"version":2,"name":"api","deps":{"zod":"4.1.0","astro":"7.4.4"}}
    output: |
      {
        "deps": {
          "astro": "7.4.4",
          "zod": "4.1.0"
        },
        "name": "api",
        "version": 2
      }
faq:
  - q: '¿Mi JSON se envía a algún servidor?'
    a: 'No. El análisis usa JSON.parse del propio navegador y todo ocurre en esta pestaña. Puedes desconectarte de internet y la herramienta sigue funcionando.'
  - q: '¿Por qué mi JSON es inválido si funciona en JavaScript?'
    a: 'JSON es más estricto que un objeto literal de JavaScript: las claves van entre comillas dobles, no se permiten comillas simples, comentarios ni comas al final de un arreglo u objeto. El error indica la línea y la columna donde está el problema.'
  - q: '¿Ordenar las claves cambia el significado del JSON?'
    a: 'No. En un objeto JSON el orden de las claves no tiene significado; ordenarlas alfabéticamente sirve para comparar dos documentos o tener diffs estables. El orden de los arreglos se respeta siempre.'
  - q: '¿Cuánto pesa mi JSON?'
    a: 'Bajo el resultado verás el tamaño en bytes, la cantidad de nodos y la profundidad máxima, útiles para detectar respuestas que crecieron más de lo esperado.'
---

Pega un JSON y se formatea mientras escribes, sin botón de enviar. Si el documento es válido, lo verás indentado con 2 o 4 espacios, o con tabuladores, y con colores para claves, textos, números y booleanos. Si tiene un error, la herramienta te dice qué encontró y en qué línea y columna, para que vayas directo al problema en vez de buscar una coma perdida a ojo.

Además de formatear, puedes **minificar** el documento para quitar espacios y saltos de línea antes de pegarlo en una variable de entorno o en una petición, u **ordenar las claves** de forma recursiva. Ordenar es útil cuando comparas dos respuestas de una API o cuando quieres que un archivo de configuración tenga siempre el mismo orden en el control de versiones.

Todo corre en tu navegador con `JSON.parse` y `JSON.stringify`. Ningún dato sale de la pestaña, así que puedes pegar respuestas con tokens, datos de clientes o configuraciones internas sin exponerlos. Si pegas un JSON en el inicio de ByteKnife, se detecta automáticamente y se abre aquí con tu contenido.

Para pasar un arreglo de objetos a una planilla, usa la herramienta JSON ⇄ CSV.
