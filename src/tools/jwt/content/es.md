---
title: 'Decodificar JWT y verificar la firma HS256'
description: 'Decodifica un JWT y lee su cabecera, payload y fechas exp, iat y nbf. Verifica firmas HS256, HS384 y HS512 sin que el token salga del navegador.'
examples:
  - title: 'Leer un token'
    input: |
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBZGEiLCJpYXQiOjE3OTMzMTg0MDAsImV4cCI6MTc5MzMyMjAwMH0._DX8uh7t6vcFdmwuAPKekQPEJ93tmXRQp9w8arzwRwo
    output: |
      Cabecera  {"alg": "HS256", "typ": "JWT"}
      Payload   {"sub": "42", "name": "Ada", "iat": 1793318400, "exp": 1793322000}
      Emitido (iat)  2026-10-30T00:00:00.000Z
      Expira (exp)   2026-10-30T01:00:00.000Z
  - title: 'Verificar la firma con el secreto HMAC'
    input: |
      Secreto: byteknife    →  mismo token
      Secreto: otro         →  mismo token
    output: |
      Firma válida
      Firma no coincide
faq:
  - q: '¿Es seguro pegar un JWT de producción aquí?'
    a: 'El token y el secreto se procesan solo en esta pestaña con Web Crypto y no se envían a ningún servidor. Aun así, un JWT vigente es una credencial: trátalo como una contraseña y no lo compartas.'
  - q: '¿Decodificar un JWT es lo mismo que verificarlo?'
    a: 'No. Cualquiera puede decodificar la cabecera y el payload, porque solo están en Base64URL. Verificar significa comprobar la firma con la clave, y es lo único que demuestra que el token no fue alterado.'
  - q: '¿Por qué no puedo verificar RS256 o ES256?'
    a: 'Esos algoritmos usan una clave pública (RSA o curva elíptica) en vez de un secreto compartido. Por ahora la herramienta verifica HS256, HS384 y HS512; para los demás muestra el algoritmo y decodifica el contenido.'
---

Un JSON Web Token tiene tres partes separadas por puntos: la **cabecera**, el **payload** y la **firma**, las dos primeras en JSON codificado con Base64URL. Pega un token y verás la cabecera y el payload formateados, con el algoritmo destacado, y una línea de tiempo con las fechas que suelen definir su vigencia: `iat` (emitido), `nbf` (válido desde), `exp` (expira) y `auth_time`. Cada fecha se muestra en ISO 8601 y en tiempo relativo, y un indicador te dice si el token está vigente, todavía no es válido o ya expiró.

Si el token usa HMAC (`HS256`, `HS384` o `HS512`), puedes escribir el secreto y la herramienta verifica la firma con Web Crypto mientras escribes. Es útil para depurar una integración: confirmas si el problema es el secreto, el algoritmo o un payload alterado, sin escribir código ni instalar nada.

La herramienta acepta tokens con el prefijo `Bearer` o con espacios alrededor, tal como los copias de una cabecera `Authorization`. Si el formato no es válido, te dice qué parte falla.

Ni el token ni el secreto salen de tu navegador. Si pegas un JWT en el inicio de ByteKnife, se reconoce y se abre aquí.
