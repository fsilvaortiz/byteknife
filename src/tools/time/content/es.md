---
title: 'Convertir timestamp Unix a fecha y zonas horarias'
description: 'Convierte timestamps Unix en segundos, milisegundos, µs o ns a ISO 8601 y a la hora de varias zonas horarias, y fechas a Unix.'
examples:
  - title: 'De Unix en segundos a fecha'
    input: |
      1793318400
    output: |
      Unix (s)       1793318400
      Unix (ms)      1793318400000
      ISO 8601 UTC   2026-10-30T00:00:00.000Z
      RFC 7231       Fri, 30 Oct 2026 00:00:00 GMT
      Semana ISO     2026-W44
      Santiago       29 oct 2026, 21:00 (GMT-3)
      Madrid         30 oct 2026, 01:00 (GMT+1)
  - title: 'De fecha ISO 8601 a Unix'
    input: |
      2026-10-29T12:00:00Z
    output: |
      Unix (s)       1793275200
      Unix (ms)      1793275200000
      RFC 7231       Thu, 29 Oct 2026 12:00:00 GMT
faq:
  - q: '¿Cómo sabe si el número está en segundos o en milisegundos?'
    a: 'Por la cantidad de dígitos: hasta 11 se lee como segundos, hasta 14 como milisegundos, hasta 17 como microsegundos y más como nanosegundos. La unidad elegida se muestra junto a la entrada.'
  - q: '¿Qué pasa si la fecha no trae zona horaria?'
    a: 'Una fecha como 2026-10-29 12:00 sin Z ni desfase se interpreta en tu hora local, y la herramienta te lo avisa. Agrega Z para UTC o un desfase como -03:00 para evitar ambigüedades.'
  - q: '¿Las zonas horarias consideran el horario de verano?'
    a: 'Sí. Las zonas se calculan con la base de datos IANA que trae tu navegador vía Intl, así que el desfase de cada ciudad es el que corresponde a esa fecha exacta.'
---

Un timestamp Unix cuenta el tiempo transcurrido desde el 1 de enero de 1970 a medianoche UTC. Es la forma en que la mayoría de los sistemas guarda fechas, pero no se lee a simple vista. Pega un timestamp y esta herramienta te muestra la fecha en **ISO 8601 UTC**, en el formato HTTP de RFC 7231, en tu hora local, en tiempo relativo («hace 3 horas»), con su semana ISO y su día del año.

La entrada detecta sola la unidad según la cantidad de dígitos: **segundos** (como en `date +%s` o en los JWT), **milisegundos** (como `Date.now()` en JavaScript o Java), **microsegundos** (Python, PostgreSQL) y **nanosegundos** (Go, Prometheus). También funciona al revés: pega una fecha ISO 8601 o un texto como `2026-10-29 12:00` y obtienes el timestamp en segundos y en milisegundos. Escribe `ahora` o `now` para la hora actual.

La tabla de **zonas horarias** muestra el mismo instante en ciudades de América, Europa y Asia con su desfase respecto de UTC, considerando el horario de verano de esa fecha. Es lo que necesitas para leer un log de producción, coordinar un despliegue entre equipos o revisar cuándo expira un token.

Todo se calcula en tu navegador con `Date` e `Intl`. Si pegas un timestamp en el inicio, ByteKnife lo reconoce y lo abre aquí.
