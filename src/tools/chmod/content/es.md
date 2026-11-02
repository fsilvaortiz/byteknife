---
title: 'Calculadora chmod: permisos Unix en octal y rwx'
description: 'Convierte permisos de Linux y Unix entre octal (755, 644) y simbólico (rwxr-xr-x), marca cada permiso y genera el comando chmod con setuid y sticky.'
examples:
  - title: 'De octal a simbólico'
    input: |
      755
    output: |
      Octal              755
      Simbólico          rwxr-xr-x
      Comando            chmod 755 archivo
      Comando simbólico  chmod u=rwx,g=rx,o=rx archivo
  - title: 'Leer la salida de ls -l'
    input: |
      drwxrwsr-t
    output: |
      Octal              3775
      Simbólico          rwxrwsr-t
      Comando simbólico  chmod u=rwx,g=rwxs,o=rxt archivo
faq:
  - q: '¿Qué significan los tres dígitos?'
    a: 'Cada dígito es la suma de leer (4), escribir (2) y ejecutar (1) para el dueño, el grupo y los demás, en ese orden. 7 = 4+2+1 es todo; 5 = 4+1 es leer y ejecutar; 6 = 4+2 es leer y escribir.'
  - q: '¿Qué permisos uso para una clave SSH, un script o un directorio web?'
    a: 'Una clave privada SSH: 600. Un script ejecutable: 755, o 750 si solo tu grupo debe usarlo. Archivos web: 644. Directorios: 755. Evita 777: cualquiera puede modificar el contenido.'
  - q: '¿Qué son setuid, setgid y sticky?'
    a: 'setuid (4) hace que un ejecutable corra con los permisos de su dueño, como passwd. setgid (2) lo hace con los del grupo, y en un directorio hace que los archivos nuevos hereden el grupo. sticky (1) en un directorio como /tmp impide que alguien borre archivos de otros.'
  - q: '¿Acepta modos relativos como u+x?'
    a: 'Sí. Puedes escribir u+x, go-w o a=r: se aplican sobre los permisos actuales, como haría chmod.'
---

Los permisos de archivos en Linux, macOS y otros Unix se escriben de dos formas: en **octal**, como `755`, y en **simbólico**, como `rwxr-xr-x`, que es lo que muestra `ls -l`. Esta calculadora traduce entre ambas y te deja marcar cada permiso con casillas.

Escribe un modo en octal (`644`, `0600`, `4755`), una cadena de `ls -l` (`-rw-r--r--`, `drwxr-xr-x`), un cambio relativo (`u+x`, `go-w`) o un comando completo (`chmod 750 deploy.sh`). Verás la tabla de **lectura, escritura y ejecución** para el usuario dueño, el grupo y los demás. Si marcas o desmarcas una casilla, el modo se actualiza al instante.

Los bits especiales también están: **setuid**, **setgid** y **sticky**, que en `ls -l` aparecen como `s`, `S`, `t` o `T`. La herramienta te avisa si un modo deja escribir a cualquiera o activa setuid, dos causas frecuentes de problemas de seguridad.

Al final tienes el comando listo para copiar en sus dos formas: `chmod 755 archivo` y `chmod u=rwx,g=rx,o=rx archivo`. La segunda es más legible en scripts y en Dockerfiles.

Todo se calcula en tu navegador.
