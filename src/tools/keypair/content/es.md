---
title: 'Generar par de claves SSH, Ed25519, ECDSA y RSA'
description: 'Genera claves pública y privada Ed25519, ECDSA o RSA en tu navegador y cópialas en formato OpenSSH, PEM (PKCS#8) o JWK, con su huella SHA256.'
examples:
  - title: 'Clave SSH Ed25519 con comentario'
    input: |
      Algoritmo Ed25519 · Comentario ada@laptop · Formato OpenSSH
    output: |
      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINdamAGCsQq31Uv+08lkBzoO4XLz2qYjJa8CGmj3B1Ea ada@laptop
      (ejemplo: cada par generado es distinto)
  - title: 'Clave pública ECDSA P-256 en PEM'
    input: |
      Algoritmo ECDSA P-256 · Formato PEM
    output: |
      -----BEGIN PUBLIC KEY-----
      MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE…
      -----END PUBLIC KEY-----
faq:
  - q: '¿La clave privada se envía a algún servidor?'
    a: 'No. El par se genera con Web Crypto (crypto.subtle.generateKey) dentro de esta pestaña y no se transmite ni se guarda. Al recargar la página desaparece.'
  - q: '¿Qué algoritmo conviene usar?'
    a: 'Ed25519 para SSH y firmas nuevas: es rápido, seguro y sus claves son cortas. ECDSA P-256 si necesitas compatibilidad con JWT ES256 o hardware que no soporta Ed25519, y RSA 3072 o 4096 para sistemas antiguos.'
  - q: '¿Sirve la clave privada OpenSSH con ssh y ssh-keygen?'
    a: 'Sí. Se genera en el formato openssh-key-v1 sin frase de paso, el mismo de ssh-keygen -N "". Guárdala con permisos 600 y, si quieres protegerla, agrega una frase con ssh-keygen -p -f archivo.'
  - q: '¿Para qué sirve la huella SHA256?'
    a: 'Identifica la clave pública sin mostrarla completa. Es la misma que muestran ssh-keygen -l y GitHub en la lista de claves SSH, así que puedes comprobar que subiste la correcta.'
---

Esta herramienta genera un **par de claves** asimétricas, pública y privada, sin instalar nada y sin que la privada salga de tu equipo. Usa Web Crypto, la API criptográfica del navegador, con un generador aleatorio seguro del sistema operativo.

Elige el **algoritmo**: Ed25519, ECDSA con las curvas P-256 o P-384, o RSA de 2048, 3072 o 4096 bits. Luego cambia el **formato** de salida. **OpenSSH** entrega la línea `ssh-ed25519 AAAA…` lista para `authorized_keys` o para pegar en GitHub, y la clave privada en el formato que leen `ssh` y `ssh-keygen`. **PEM** usa PKCS#8 para la privada y SPKI para la pública, lo que esperan OpenSSL, Node.js, Java o las librerías de JWT. **JWK** entrega el JSON de RFC 7517, útil para un endpoint JWKS o para importar la clave con Web Crypto.

El **comentario** opcional se agrega al final de las claves OpenSSH para reconocerlas después, por ejemplo `tu@equipo`. La **huella** SHA256 coincide con la de `ssh-keygen -l`.

Casos de uso típicos: crear una clave de despliegue para un repositorio, una clave SSH para un servidor nuevo, o un par ES256 o EdDSA para firmar tokens en desarrollo. Para producción, guarda la privada en un gestor de secretos y nunca la subas al repositorio.
