---
title: 'Validar JSON contra JSON Schema en línea'
description: 'Pega un JSON Schema y un documento JSON y valídalo en tu navegador: drafts 4, 7, 2019-09 y 2020-12, con cada error, su ruta y la regla que falla.'
examples:
  - title: 'Documento con varios errores'
    input: |
      Esquema: id entero ≥ 1, email con formato, plan en [free, pro, team], sin propiedades extra
      Documento: {"id": 0, "email": "ana.ejemplo.dev", "plan": "enterprise", "activo": true}
    output: |
      /id      minimum               0 is less than 1.
      /email   format                String does not match format "email".
      /plan    enum                  Instance does not match any of ["free","pro","team"].
      (raíz)   additionalProperties  Property "activo" does not match additional properties schema.
  - title: 'Documento válido'
    input: |
      {"id": 42, "email": "ana@ejemplo.dev", "plan": "pro"}
    output: |
      El documento cumple el esquema
faq:
  - q: '¿Qué versiones de JSON Schema admite?'
    a: 'Draft 4, draft 7, 2019-09 y 2020-12. La versión se toma de $schema; si el esquema no la declara, se usa 2020-12. También puedes elegirla a mano.'
  - q: '¿Valida formatos como email, date-time o uuid?'
    a: 'Sí, los formatos más comunes se comprueban: email, date, date-time, time, uri, uuid, ipv4, ipv6, hostname y regex, entre otros.'
  - q: '¿Mis datos se envían a algún servidor?'
    a: 'No. La validación usa la librería @cfworker/json-schema dentro de tu navegador. Se eligió porque interpreta el esquema sin generar código, compatible con la CSP estricta del sitio.'
---

**JSON Schema** describe la forma que debe tener un JSON: qué campos son obligatorios, de qué tipo es cada uno, qué valores se permiten y qué formato siguen. Lo usan OpenAPI, la validación de APIs, los archivos de configuración y muchos editores. Este validador te dice si un documento cumple un esquema y, si no, por qué.

Pega el **esquema** a la izquierda y el **documento** a la derecha. La validación ocurre mientras escribes. Si alguno de los dos no es JSON válido, verás la línea y la columna del error.

Cada problema aparece con su **ruta** en el documento, como `/items/0/email`, la **regla** que falla (`required`, `type`, `enum`, `minimum`, `format`, `additionalProperties`…) y el detalle. Se muestran todos los errores, no solo el primero, y se omiten los mensajes que solo resumen a otros para que la lista sea clara.

El **draft** se detecta a partir de `$schema` y puedes forzarlo: 4, 7, 2019-09 o 2020-12. Es útil para probar un esquema antes de publicarlo, depurar por qué una API rechaza un payload o revisar la configuración de un servicio.

Nada sale de tu navegador.
