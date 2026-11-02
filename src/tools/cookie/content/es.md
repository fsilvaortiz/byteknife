---
title: 'Analizar Set-Cookie: SameSite, Secure y HttpOnly'
description: 'Pega cabeceras Set-Cookie o Cookie y revisa vencimiento, dominio, Secure, HttpOnly, SameSite, prefijos __Host- y __Secure- y errores de configuración.'
examples:
  - title: 'Una cookie de sesión bien configurada'
    input: |
      Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
    output: |
      Vence     mañana (Max-Age 86400)
      Domain    Solo este host
      Secure    Sí
      HttpOnly  Sí
      SameSite  Lax
      ✓ Bien configurada
  - title: 'Una cookie de terceros que el navegador rechaza'
    input: |
      Set-Cookie: tracking=abc123; Domain=.ejemplo.dev; SameSite=None
    output: |
      ✗ SameSite=None sin Secure: el navegador la rechaza
      ! Sin Secure: viaja también por HTTP
      i Con Domain: también la reciben los subdominios
faq:
  - q: '¿Qué SameSite conviene usar?'
    a: 'Lax para la mayoría de las cookies de sesión: se envía al navegar hacia tu sitio, pero no en peticiones de otros sitios. Strict es aún más restrictiva. None solo si la cookie debe viajar en contextos de terceros, y siempre con Secure.'
  - q: '¿Para qué sirven los prefijos __Host- y __Secure-?'
    a: 'Son garantías que el navegador comprueba: __Secure- exige Secure; __Host- exige además Path=/ y no tener Domain, así que ningún subdominio puede sobrescribirla.'
  - q: '¿Qué pasa si hay Max-Age y Expires?'
    a: 'Manda Max-Age. Si Max-Age es 0 o negativo, o Expires está en el pasado, el navegador borra la cookie. Sin ninguno de los dos, es una cookie de sesión.'
---

Las cookies controlan sesiones, preferencias y seguimiento, y sus **atributos** deciden quién las puede leer y cuándo se envían. Un atributo que falta puede exponer una sesión a JavaScript, a HTTP sin cifrar o a peticiones de otros sitios. Este analizador lee cabeceras `Set-Cookie` y `Cookie` y te muestra cada detalle.

Pega una o varias líneas `Set-Cookie:`, como las que muestra `curl -i` o la pestaña Red del navegador. Para cada cookie verás su valor, el valor decodificado si tiene percent-encoding, cuándo vence (Max-Age tiene prioridad sobre Expires), el dominio, la ruta y los atributos **Secure**, **HttpOnly**, **SameSite**, **Partitioned** y **Priority**. Si el valor parece un JWT, se indica.

La revisión señala los errores que hacen que el navegador **rechace** la cookie, como `SameSite=None` sin `Secure` o un prefijo `__Host-` mal usado, y los riesgos: cookies de sesión sin `HttpOnly`, sin `Secure` o con `Domain`, que las comparte con todos los subdominios.

Si pegas una cabecera `Cookie:`, verás la lista de pares nombre y valor que envía el navegador. Todo se analiza en tu navegador.
