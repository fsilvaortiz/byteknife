---
title: 'Analizar SPF, DMARC y DKIM y archivos de zona DNS'
description: 'Revisa registros SPF, DMARC y DKIM: límite de 10 consultas, +all, p=none, claves cortas. También lee archivos de zona y la salida de dig.'
examples:
  - title: 'Registro SPF'
    input: |
      v=spf1 ip4:203.0.113.0/24 include:_spf.google.com mx ~all
    output: |
      i 2 de 10 consultas DNS permitidas
      i ~all (softfail): los no autorizados se marcan, pero suelen entregarse.
  - title: 'Registro DMARC'
    input: |
      v=DMARC1; p=none
    output: |
      ! p=none solo monitorea: no protege contra suplantación.
      i Sin rua: no recibirás reportes agregados.
faq:
  - q: '¿Por qué importa el límite de 10 consultas de SPF?'
    a: 'La RFC 7208 limita a 10 los mecanismos que requieren consultas DNS (include, a, mx, ptr, exists y redirect). Si se supera, el SPF devuelve permerror y los correos legítimos pueden fallar. Cada include puede sumar más consultas dentro.'
  - q: '¿Qué política DMARC conviene?'
    a: 'Empieza con p=none y un rua para recibir reportes, corrige los remitentes legítimos que fallan y luego sube a quarantine y finalmente a reject, que es la única que bloquea la suplantación.'
  - q: '¿Consulta mi dominio en DNS?'
    a: 'No. La herramienta solo analiza el texto que pegas; no hace consultas de red. Obtén los registros con dig TXT tudominio.com o dig TXT _dmarc.tudominio.com.'
---

El correo de tu dominio depende de tres registros TXT: **SPF** dice qué servidores pueden enviar en tu nombre, **DKIM** publica la clave con la que se firman los mensajes y **DMARC** indica qué hacer cuando fallan. Un error en cualquiera puede mandar tus correos a spam o dejar tu dominio abierto a la suplantación. Este analizador los revisa.

Pega un registro y se detecta su tipo. En **SPF** verás cada término con su resultado (pass, fail, softfail o neutral), el valor y si cuenta para el límite de **10 consultas DNS**. La revisión avisa de `+all`, `?all`, mecanismos después de `all`, IPs mal escritas, `ptr` y registros sin `all`.

En **DMARC** se explican las etiquetas (`p`, `sp`, `rua`, `pct`, `adkim`…) y se marcan `p=none` y `pct` menor que 100. En **DKIM** se identifica el tipo de clave y su tamaño aproximado, y se avisa si está revocada o en modo de prueba.

También puedes pegar un **archivo de zona** o la salida de `dig`: verás cada registro en una tabla, y se revisan los SPF y DMARC que contenga, además de errores como un CNAME junto a otros registros. Nada se consulta en la red.
