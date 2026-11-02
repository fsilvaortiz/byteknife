---
title: 'Decodificar certificado X.509 y CSR (PEM) en línea'
description: 'Pega un certificado o CSR en PEM y lee sujeto, emisor, vigencia, SAN, usos de clave, extensiones y huellas SHA-256, sin enviarlo a ningún servidor.'
examples:
  - title: 'Certificado de servidor ECDSA'
    input: |
      -----BEGIN CERTIFICATE-----
      MIIC/jCCAqWgAwIBAgIGChssPU5fMAoGCCqGSM49BAMCMD0xCzAJBgNVBAYTAkNM…
      -----END CERTIFICATE-----
    output: |
      Sujeto              C=CL, O=Ejemplo SpA, CN=api.ejemplo.dev
      Válido hasta        2036-10-01T00:00:00Z
      Clave pública       EC · P-256 · 256 bits
      Algoritmo de firma  ecdsa-with-SHA256
      SAN                 DNS:api.ejemplo.dev, DNS:*.ejemplo.dev, IP:203.0.113.10
      Uso extendido       serverAuth, clientAuth
  - title: 'CSR con dos nombres'
    input: |
      -----BEGIN CERTIFICATE REQUEST-----
      MIIBeTCCAQACAQAwQTELMAkGA1UEBhMCQlIxFTATBgNVBAoMDEV4ZW1wbG8gTHRk…
      -----END CERTIFICATE REQUEST-----
    output: |
      Sujeto         C=BR, O=Exemplo Ltda, CN=www.exemplo.com.br
      Clave pública  EC · P-384 · 384 bits
      SAN            DNS:www.exemplo.com.br, DNS:exemplo.com.br
faq:
  - q: '¿Es seguro pegar aquí un certificado?'
    a: 'Un certificado es público por diseño: lo envía cada servidor HTTPS. Aun así, aquí se decodifica en tu navegador y no se envía a ningún lado. Nunca pegues la clave privada: esta herramienta no la necesita.'
  - q: '¿Verifica la firma o la cadena de confianza?'
    a: 'No. Lee el contenido del certificado; para validar la cadena usa openssl verify o el navegador. Sí avisa si el certificado expiró, si aún no es válido y si es autofirmado.'
  - q: '¿Puedo pegar una cadena completa?'
    a: "Sí. Si el texto tiene varios bloques PEM, como un fullchain.pem de Let's Encrypt, verás un selector para revisar cada certificado."
  - q: '¿Para qué sirve el pin SPKI?'
    a: 'Es el SHA-256 de la clave pública en Base64. Lo usan el certificate pinning de apps móviles y opciones como pinnedpubkey de curl, y no cambia al renovar el certificado si se conserva la clave.'
---

Un certificado X.509 en PEM es un bloque Base64 ilegible a simple vista. Esta herramienta lo decodifica en el navegador y muestra lo que normalmente buscas con `openssl x509 -text`, pero ordenado y en tu idioma.

Pega un **certificado** (`-----BEGIN CERTIFICATE-----`) o una **CSR** (`-----BEGIN CERTIFICATE REQUEST-----`). Verás el sujeto, el emisor, el número de serie, las fechas de vigencia con los días que quedan, el tipo y el tamaño de la clave pública, el algoritmo de firma y las huellas SHA-256 y SHA-1.

En **Extensiones** aparecen los **nombres alternativos (SAN)**, que son los dominios e IP para los que vale el certificado; el uso de clave y el uso extendido, como `serverAuth` para HTTPS; las restricciones básicas, que dicen si es una CA; los identificadores de clave y las URLs de OCSP, CRL y del emisor. Las extensiones marcadas como **críticas** deben ser entendidas por quien valide el certificado.

Es útil para revisar por qué el navegador rechaza un certificado, confirmar que una CSR incluye todos los dominios antes de enviarla a la CA, ver cuándo vence un certificado o comparar huellas. Si pegas una cadena con varios certificados, puedes recorrerlos uno por uno.

Solo se lee el contenido: la firma y la cadena de confianza no se verifican.
