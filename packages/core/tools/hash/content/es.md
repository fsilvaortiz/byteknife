---
title: 'Calcular hash MD5, SHA-1, SHA-256 y SHA-512'
description: 'Calcula MD5, SHA-1, SHA-256, SHA-384 y SHA-512 de un texto o de un archivo local, en hexadecimal o Base64. El archivo nunca se sube.'
examples:
  - title: 'Los cinco hashes de un texto'
    input: |
      hello
    output: |
      MD5      5d41402abc4b2a76b9719d911017c592
      SHA-1    aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
      SHA-256  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
      SHA-384  59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f
      SHA-512  9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043
  - title: 'SHA-256 en Base64, como en Subresource Integrity'
    input: |
      hello
    output: |
      LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=
faq:
  - q: '¿Mi archivo se sube a algún servidor?'
    a: 'No. El archivo se lee con la File API y se procesa en un Web Worker dentro de tu navegador. Puedes calcular el hash de un instalador o de un respaldo sin que salga de tu equipo.'
  - q: '¿Puedo usar MD5 o SHA-1 para contraseñas o firmas?'
    a: 'No. Ambos tienen colisiones conocidas y sirven solo para comprobar integridad frente a errores, no frente a un atacante. Para contraseñas usa un algoritmo lento como Argon2, scrypt o bcrypt.'
  - q: '¿Por qué mi hash no coincide con el de otra herramienta?'
    a: 'Casi siempre por un salto de línea al final o por la codificación. Aquí el texto se hashea como UTF-8 exactamente como lo escribiste; echo sin -n agrega un salto de línea que cambia el resultado.'
---

Una función hash convierte cualquier entrada en una huella de tamaño fijo: el mismo contenido produce siempre el mismo resultado, y un cambio mínimo produce uno completamente distinto. Esta herramienta calcula a la vez **MD5, SHA-1, SHA-256, SHA-384 y SHA-512**, para que compares con el valor publicado sin tener que elegir antes el algoritmo.

Escribe o pega un texto y los hashes se actualizan mientras escribes. El texto se codifica como UTF-8, igual que en la mayoría de los lenguajes y en `sha256sum`. También puedes elegir un **archivo local**: se lee en un Web Worker para que la página no se congele, incluso con archivos grandes, y es la forma de verificar que una descarga o un respaldo no se corrompió.

El resultado puede verse en **hexadecimal**, en mayúsculas o minúsculas, o en **Base64**, que es el formato que usan los atributos `integrity` de Subresource Integrity y algunas APIs de almacenamiento.

Los algoritmos SHA usan Web Crypto, la implementación nativa del navegador; MD5, que Web Crypto no incluye, usa una implementación propia probada con los vectores de RFC 1321. Ni el texto ni los archivos salen de tu navegador.
