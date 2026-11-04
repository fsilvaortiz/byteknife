---
title: 'Explicar expresiones cron y próximas ejecuciones'
description: 'Traduce una expresión cron de 5 campos a lenguaje natural, detecta errores campo por campo y calcula las próximas ejecuciones en tu zona horaria.'
examples:
  - title: 'Un job en días hábiles'
    input: |
      0 9 * * 1-5
    output: |
      A las 09:00, de lunes a viernes.
      Próximas: lun 2 nov 09:00 · mar 3 nov 09:00 · mié 4 nov 09:00
  - title: 'Una expresión que nunca se ejecuta'
    input: |
      0 0 31 2 *
    output: |
      A las 00:00, el día 31 del mes, en febrero.
      Esta expresión nunca se ejecuta (p. ej., 31 de febrero).
faq:
  - q: '¿Qué formato de cron acepta?'
    a: 'El estándar de 5 campos: minuto, hora, día del mes, mes y día de la semana, como en crontab, Kubernetes CronJob o GitHub Actions. Admite *, listas (1,15), rangos (1-5), pasos (*/10) y nombres como MON o JAN.'
  - q: '¿Qué pasa si indico día del mes y día de la semana a la vez?'
    a: 'Como en cron clásico, se ejecuta cuando se cumple cualquiera de los dos. 0 0 1 * 1 corre el día 1 de cada mes y también todos los lunes. La descripción lo deja explícito.'
  - q: '¿En qué zona horaria se calculan las próximas ejecuciones?'
    a: 'En la zona horaria de tu navegador, que se muestra en el título de la lista. Recuerda que muchos servidores y servicios como GitHub Actions ejecutan cron en UTC.'
---

Una expresión cron define cuándo se ejecuta una tarea programada con cinco campos: **minuto, hora, día del mes, mes y día de la semana**. Es compacta, pero fácil de leer mal: `0 9 * * 1-5` y `9 0 * * 1-5` se parecen mucho y se ejecutan a horas muy distintas. Esta herramienta traduce la expresión a una frase clara mientras escribes, para que confirmes que hace lo que esperas antes de subirla a producción.

Debajo de la explicación verás el detalle de cada campo y las **próximas ejecuciones** calculadas en tu zona horaria, que es la mejor prueba de que la expresión es correcta. Si la expresión no puede cumplirse nunca, como el 31 de febrero, te lo advierte en vez de dejarte esperar un job que no llega.

Si algo está mal, el error dice qué campo falla y por qué: un valor fuera de rango, un paso inválido o un rango invertido. Se aceptan comodines, listas, rangos, pasos y los nombres en inglés de meses y días (`JAN`, `MON`), además de `7` como domingo.

Los atajos de ejemplo cubren los casos más comunes, como cada 5 minutos, días hábiles o el primer día del mes. Todo se calcula en tu navegador. Si pegas una expresión cron en el inicio de ByteKnife, se reconoce y se abre aquí.
