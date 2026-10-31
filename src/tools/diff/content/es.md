---
title: 'Comparar textos online: diff línea a línea'
description: 'Compara dos versiones de un texto línea a línea con vista unificada, números de línea y conteo de cambios. Ignora espacios finales si quieres.'
examples:
  - title: 'Cambios en un archivo de configuración'
    input: |
      Original:              Modificado:
      host: localhost        host: localhost
      port: 8080             port: 9090
      debug: true            debug: false
                             log: info
    output: |2
        1 1   host: localhost
          2 + port: 9090
          3 + debug: false
          4 + log: info
        2   - port: 8080
        3   - debug: true
      +3 −2
  - title: 'Ignorar espacios al final de línea'
    input: |
      Original:  "a = 1  " / "b = 2"
      Modificado: "a = 1" / "b = 2"
    output: |
      Sin diferencias
faq:
  - q: '¿Qué algoritmo usa?'
    a: 'Calcula la subsecuencia común más larga de líneas, la misma idea detrás de diff y git diff. Las líneas iguales se mantienen y las distintas aparecen como agregadas o eliminadas.'
  - q: '¿Hay un límite de tamaño?'
    a: 'Se pueden comparar archivos de miles de líneas. Si los dos textos difieren en demasiadas líneas para calcularlo sin congelar la pestaña, la herramienta te avisa en lugar de bloquearse.'
  - q: '¿Puedo comparar archivos con finales de línea de Windows?'
    a: 'Sí. CRLF y CR se normalizan a LF antes de comparar, así que un archivo editado en Windows y otro en Linux no aparecen como completamente distintos.'
---

Cuando tienes dos versiones de un texto, por ejemplo un archivo de configuración antes y después de un cambio, dos respuestas de una API o dos versiones de una consulta SQL, encontrar las diferencias a ojo es lento y propenso a errores. Pega el **original** a la izquierda y el **modificado** a la derecha, y la herramienta muestra una **vista unificada** con las líneas agregadas en verde, las eliminadas en rojo y los números de línea de cada lado.

En la parte superior verás el conteo de líneas agregadas y eliminadas. Con **Solo cambios** ocultas las líneas que no cambiaron para concentrarte en lo que importa, y con **Ignorar espacios al final** evitas que un editor que quita espacios sobrantes llene el resultado de falsos cambios. Los finales de línea de Windows (CRLF) se normalizan automáticamente.

El botón de intercambio invierte original y modificado, útil cuando pegaste los textos al revés. La comparación usa el algoritmo de la subsecuencia común más larga, la misma base de `diff` y de `git diff`, y se actualiza mientras escribes.

Como todo corre en tu navegador, puedes comparar archivos con credenciales, logs internos o datos de clientes sin subirlos a ningún servicio.
