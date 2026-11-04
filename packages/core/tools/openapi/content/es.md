---
title: 'Validar OpenAPI y Swagger en línea'
description: 'Valida una especificación OpenAPI 3.0, 3.1, 3.2 o Swagger 2.0 en tu navegador: estructura oficial, $ref rotos, parámetros de ruta y operationId repetidos.'
examples:
  - title: 'Parámetro sin declarar y un error de tipeo'
    input: |
      openapi: 3.1.0
      info: { title: Pedidos API, version: 2.14.0 }
      paths:
        /pedidos/{pedidoId}:
          get:
            responses:
              '200':
                descripton: El pedido
    output: |
      5  Error  La ruta usa {pedidoId}, pero ningún parámetro in: path lo declara
                paths › /pedidos/{pedidoId} › get
      7  Error  Falta la propiedad obligatoria «description»
                paths › /pedidos/{pedidoId} › get › responses › 200
      7  Error  Propiedad no permitida aquí: «descripton»
                paths › /pedidos/{pedidoId} › get › responses › 200
  - title: 'Referencia rota'
    input: |
      openapi: 3.0.3
      info: { title: Pagos, version: '1' }
      paths:
        /pagos:
          post:
            requestBody:
              $ref: '#/components/requestBodies/Pago'
            responses:
              '201': { description: Creado }
    output: |
      6  Error  La referencia #/components/requestBodies/Pago no existe en el documento
                paths › /pagos › post › requestBody
faq:
  - q: '¿Qué versiones de OpenAPI admite?'
    a: 'OpenAPI 3.0, 3.1 y 3.2, y Swagger 2.0. La versión se toma del campo openapi o swagger del documento, y la estructura se valida con el esquema JSON oficial de la OpenAPI Initiative para esa versión.'
  - q: '¿Qué revisa además del esquema oficial?'
    a: 'Cosas que el esquema no puede comprobar: $ref locales que no existen, parámetros de ruta como {id} sin declarar o declarados de más, parámetros repetidos, operationId duplicados, rutas equivalentes como /users/{id} y /users/{name}, esquemas de seguridad sin definir y esquemas que nadie usa.'
  - q: '¿Sigue los $ref a otros archivos o URLs?'
    a: 'No. Las referencias externas se marcan como aviso y no se descargan: la herramienta no hace ninguna petición de red con tu especificación.'
  - q: '¿Mi especificación se envía a algún servidor?'
    a: 'No. El análisis de YAML o JSON y la validación ocurren en tu navegador. Puedes pegar especificaciones internas sin publicarlas.'
---

**OpenAPI** (antes Swagger) describe una API HTTP: sus rutas, operaciones, parámetros, cuerpos, respuestas y seguridad. A partir de ese archivo se generan documentación, clientes, servidores y pruebas de contrato, así que un error en la especificación termina en código roto o en documentación que miente. Este validador te dice si tu especificación es válida y, si no, dónde y por qué.

Pega la especificación en **YAML o JSON**. La versión se detecta sola: OpenAPI 3.0, 3.1, 3.2 o Swagger 2.0. La validación ocurre mientras escribes, y cada problema aparece con su **línea**, su **ubicación** dentro del documento (por ejemplo, `paths › /pedidos › post › responses › 201`) y un detalle en tu idioma.

Hay dos tipos de revisión. La **estructural** usa el esquema JSON oficial de la OpenAPI Initiative y encuentra propiedades obligatorias que faltan, nombres mal escritos y valores no permitidos; de las alternativas del esquema muestra solo la que corresponde, no una lista de errores repetidos. Las **revisiones propias** cubren lo que el esquema no ve: `$ref` rotos, parámetros de ruta sin declarar, `operationId` repetidos, rutas equivalentes y esquemas de seguridad sin definir. Los esquemas sin usar aparecen como aviso.

Debajo verás un resumen con el título y la versión de la API y la lista de operaciones, útil para revisar de un vistazo qué expone.

Nada sale de tu navegador.
