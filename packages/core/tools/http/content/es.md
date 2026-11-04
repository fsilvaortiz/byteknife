---
title: 'Códigos de estado HTTP y cabeceras: referencia'
description: 'Busca qué significa cada código de estado HTTP (200, 301, 404, 422, 429, 503) y para qué sirve cada cabecera de petición y de respuesta.'
examples:
  - title: 'Buscar por código'
    input: |
      429
    output: |
      429  Too Many Requests · RFC 6585
           Límite de tasa superado; ver Retry-After.
  - title: 'Buscar cabeceras por tema'
    input: |
      cors
    output: |
      Access-Control-Allow-Credentials  Respuesta  CORS: permite enviar cookies o credenciales.
      Access-Control-Allow-Headers      Respuesta  CORS: cabeceras permitidas en la petición real.
      Access-Control-Allow-Methods      Respuesta  CORS: métodos permitidos en la petición real.
      Access-Control-Allow-Origin       Respuesta  CORS: orígenes que pueden leer la respuesta.
faq:
  - q: '¿Cuál es la diferencia entre 401 y 403?'
    a: '401 significa que falta autenticarse o que las credenciales no son válidas. 403 significa que el servidor sabe quién eres, pero no tienes permiso para ese recurso.'
  - q: '¿Uso 301, 302, 307 o 308 para redirigir?'
    a: '301 y 308 son permanentes; 302 y 307 son temporales. 307 y 308 conservan el método y el cuerpo, así que un POST sigue siendo POST. Para APIs, prefiere 307 y 308.'
  - q: '¿Cuándo devolver 400 y cuándo 422?'
    a: '400 cuando la petición está mal formada, por ejemplo con un JSON roto. 422 cuando la sintaxis es correcta pero los datos no pasan la validación, como un correo inválido.'
  - q: '¿De dónde salen los textos?'
    a: 'Los nombres y los números de RFC vienen de las especificaciones del IETF, principalmente la RFC 9110. Las descripciones son un resumen práctico.'
---

Cada respuesta HTTP trae un **código de estado** de tres dígitos que resume lo que pasó, y un conjunto de **cabeceras** con metadatos: tipo de contenido, caché, cookies, CORS o seguridad. Esta referencia reúne los códigos registrados y las cabeceras más usadas, con una explicación corta en tu idioma.

En **Códigos de estado** puedes escribir un número exacto (`404`), un prefijo (`5` muestra todos los errores de servidor) o una palabra (`redirección`, `límite`). Cada código muestra su nombre oficial, la RFC que lo define y para qué se usa. El color indica la familia: verde para éxito, amarillo para errores del cliente y rojo para errores del servidor.

En **Cabeceras** buscas por nombre o por tema: `cache`, `cors`, `cookie`, `seguridad`. Verás si la cabecera va en la petición, en la respuesta o en ambas, y qué controla.

Sirve para elegir el código correcto al diseñar una API, entender un error en los logs o recordar qué hacía `Vary` o `Retry-After`. Si quieres analizar las cabeceras reales de una respuesta, usa el analizador de cabeceras HTTP.
