---
title: 'Buscar fabricante de una MAC y convertir formatos'
description: 'Identifica el fabricante de una dirección MAC por su OUI, conviértela entre formatos (dos puntos, guiones, Cisco) y calcula su EUI-64 e IPv6 link-local.'
examples:
  - title: 'MAC de un equipo Apple'
    input: |
      3C:22:FB:7A:91:0E
    output: |
      Fabricante (OUI)         Apple, Inc.
      Con guiones (Windows)    3C-22-FB-7A-91-0E
      Cisco                    3c22.fb7a.910e
      EUI-64                   3e:22:fb:ff:fe:7a:91:0e
      IPv6 link-local (SLAAC)  fe80::3e22:fbff:fe7a:910e
  - title: 'MAC aleatoria de un móvil'
    input: |
      da:a1:19:5c:00:07
    output: |
      Unicast · Administrada localmente
      Fabricante (OUI)  Ninguno: es una dirección administrada localmente
faq:
  - q: '¿De dónde sale el fabricante?'
    a: 'De los primeros 24, 28 o 36 bits de la MAC, el OUI, que la IEEE asigna a cada fabricante. La herramienta incluye la base pública de la IEEE y la busca en tu navegador, sin consultar ningún servicio.'
  - q: '¿Por qué mi MAC no tiene fabricante?'
    a: 'Si el segundo bit del primer byte está encendido, la dirección es administrada localmente: la generó el sistema, no el fabricante. Los móviles usan MAC aleatorias por red Wi-Fi, y las máquinas virtuales y los contenedores también las generan.'
  - q: '¿Qué es el EUI-64?'
    a: 'Es la forma de 64 bits que usa IPv6 para crear la parte de host de una dirección con SLAAC: se inserta FFFE en el medio de la MAC y se invierte el bit universal/local.'
---

Una **dirección MAC** identifica la interfaz de red de un equipo y aparece en tablas ARP, logs de DHCP, consolas de switches y paneles de Wi-Fi, cada uno en un formato distinto. Esta herramienta la normaliza y te dice qué hay detrás.

Escribe la MAC con dos puntos, con guiones, en el formato de Cisco (`3c22.fb7a.910e`) o sin separadores. Verás el **fabricante** según el OUI de la IEEE y todos los formatos listos para copiar, para que puedas buscarla en cualquier sistema.

Los indicadores muestran si es **unicast** o **multicast** (el bit I/G) y si es **universal**, asignada por el fabricante, o **administrada localmente** (el bit U/L), como las MAC aleatorias de los móviles o las de las máquinas virtuales. También se reconoce la dirección de **broadcast**.

Además calcula el **EUI-64** y la dirección **IPv6 link-local** que SLAAC genera a partir de la MAC, útiles para relacionar una IPv6 `fe80::` con el equipo que la usa.

La base de fabricantes se descarga junto con la página la primera vez que abres esta herramienta y luego queda guardada para usarla sin conexión.
