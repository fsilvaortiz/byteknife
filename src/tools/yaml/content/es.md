---
title: 'Convertir YAML a JSON y JSON a YAML'
description: 'Convierte YAML a JSON y viceversa en tu navegador: anclas y alias, varios documentos, sangría a elección y errores con línea y columna.'
examples:
  - title: 'Configuración YAML a JSON'
    input: |
      servicio: pagos-api
      replicas: 3
      puertos:
        - 8080
        - 9090
    output: |
      {
        "servicio": "pagos-api",
        "replicas": 3,
        "puertos": [
          8080,
          9090
        ]
      }
  - title: 'JSON a YAML'
    input: |
      {"env": {"LOG_LEVEL": "info", "FEATURE_PIX": true}}
    output: |
      env:
        LOG_LEVEL: info
        FEATURE_PIX: true
faq:
  - q: '¿Qué pasa con las anclas y los alias?'
    a: 'Se resuelven al convertir: un alias *img copia el valor del ancla &img, y las claves de fusión <<: *base mezclan el mapa referido. El JSON resultante no tiene referencias.'
  - q: '¿Y si el YAML tiene varios documentos?'
    a: 'Si el texto tiene varios documentos separados por ---, como un manifiesto de Kubernetes con varios recursos, el resultado es un arreglo JSON con un elemento por documento.'
  - q: '¿Se pierden los comentarios?'
    a: 'Sí. JSON no admite comentarios, así que al pasar de YAML a JSON se descartan, y al volver a YAML no se pueden recuperar.'
  - q: '¿Mi configuración se envía a algún servidor?'
    a: 'No. La conversión usa la librería yaml dentro de tu navegador; ni el YAML ni el JSON salen de la pestaña.'
---

YAML es el formato de Kubernetes, Docker Compose, GitHub Actions, OpenAPI y muchas configuraciones; JSON es lo que esperan las APIs, `jq` y la mayoría de los lenguajes. Esta herramienta convierte entre ambos mientras escribes.

En **YAML → JSON** se resuelven las **anclas** (`&nombre`), los **alias** (`*nombre`) y las claves de fusión (`<<:`), se respetan los tipos (números, booleanos, `null`) y, si el texto tiene varios documentos separados por `---`, obtienes un arreglo con uno por documento. En **JSON → YAML** el resultado usa el estilo de bloque y no corta líneas largas, así que se puede pegar tal cual en un archivo de configuración.

Si hay un error, verás el mensaje con su **línea y columna**: una lista sin cerrar, una sangría incorrecta o una clave duplicada. Es la forma rápida de encontrar por qué `kubectl apply` o un workflow de CI rechaza un archivo.

Al cambiar de dirección, la salida pasa a ser la nueva entrada, para que puedas ir y volver. Elige sangría de 2 o 4 espacios según la convención de tu proyecto.

Ten en cuenta que los comentarios de YAML no existen en JSON y se pierden en la conversión. Todo ocurre en tu navegador.
