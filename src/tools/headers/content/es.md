---
title: 'Analizar cabeceras HTTP: seguridad, caché y CORS'
description: 'Pega las cabeceras de una respuesta HTTP y revisa HSTS, CSP, nosniff, clickjacking, cookies, CORS y caché, con la explicación de cada cabecera.'
examples:
  - title: 'Respuesta de un servidor sin endurecer'
    input: |
      HTTP/1.1 200 OK
      Server: Apache/2.4.41 (Ubuntu)
      X-Powered-By: PHP/8.1
      Set-Cookie: PHPSESSID=1; path=/
    output: |
      ✗ Falta Strict-Transport-Security
      ✗ Falta Content-Security-Policy
      ! Falta X-Content-Type-Options: nosniff
      ! Server revela la versión: «Apache/2.4.41 (Ubuntu)»
      ! La cookie «PHPSESSID» no tiene Secure y HttpOnly a la vez.
  - title: 'Caché de una respuesta'
    input: |
      HTTP/2 200
      cache-control: public, max-age=3600
    output: |
      i Caché public: fresca durante 3600 s.
faq:
  - q: '¿Cómo obtengo las cabeceras de una URL?'
    a: 'Con curl -sI https://tu-sitio.dev o curl -si para incluir el cuerpo, o en las DevTools del navegador: pestaña Red, elige la petición y copia las cabeceras de respuesta.'
  - q: '¿Por qué esta herramienta no las descarga sola?'
    a: 'Porque ByteKnife no hace peticiones de red con tus datos: todo ocurre en tu navegador. Además, una consulta desde un servidor ajeno no vería tu red interna ni tus cookies.'
  - q: '¿Qué cabeceras de seguridad son las más importantes?'
    a: 'Strict-Transport-Security para forzar HTTPS, Content-Security-Policy contra XSS, X-Content-Type-Options: nosniff, frame-ancestors o X-Frame-Options contra clickjacking, y Referrer-Policy.'
---

Las **cabeceras HTTP** de una respuesta dicen mucho sobre cómo está configurado un sitio: si obliga a usar HTTPS, si se defiende contra XSS y clickjacking, cuánto tiempo se guarda en caché o qué orígenes pueden leerla. Este analizador las interpreta y te muestra lo importante.

Pega la salida de `curl -i`, `curl -I` o las cabeceras copiadas de las DevTools. Se reconocen la línea de estado, las líneas en blanco y el cuerpo, que se ignora. Verás el código de estado con su nombre y una tabla con cada cabecera, su valor y para qué sirve.

La **revisión** marca lo que falta o conviene cambiar: HSTS ausente o demasiado corto, una CSP que no existe o está solo en modo report-only, `nosniff`, protección contra iframes, `Referrer-Policy`, servidores que revelan su versión, cookies sin `Secure` o `HttpOnly` y combinaciones de CORS peligrosas. También resume la política de **caché**: `no-store`, revalidación o el tiempo de frescura.

Es útil para auditar un despliegue, comparar entornos o revisar la respuesta de una API antes de publicarla. Las cabeceras se analizan en tu navegador y no se envían a ningún servidor.
