---
title: 'Calculadora IP y CIDR: subredes IPv4 e IPv6'
description: 'Calcula red, máscara, broadcast, wildcard y hosts de un bloque IPv4 o IPv6, divide en subredes, convierte rangos a CIDR e identifica el tipo de IP.'
examples:
  - title: 'Bloque IPv4 /22'
    input: |
      192.168.10.37/22
    output: |
      Red               192.168.8.0/22
      Rango             192.168.8.0 – 192.168.11.255
      Máscara           255.255.252.0 (/22)
      Wildcard          0.0.3.255
      Broadcast         192.168.11.255
      Hosts asignables  192.168.8.1 – 192.168.11.254
      Hosts             1.022
      Tipo              Privada (RFC 1918)
  - title: 'Rango a bloques CIDR'
    input: |
      10.0.0.1 - 10.0.0.9
    output: |
      10.0.0.1/32
      10.0.0.2/31
      10.0.0.4/30
      10.0.0.8/31
faq:
  - q: '¿Por qué una /24 tiene 254 hosts y no 256?'
    a: 'En IPv4 la primera dirección identifica la red y la última es el broadcast, así que no se asignan a equipos. Las excepciones son /31, usada en enlaces punto a punto (RFC 3021), y /32, que es una sola dirección.'
  - q: '¿Qué es la wildcard?'
    a: 'Es la máscara invertida: unos donde la máscara tiene ceros. La usan las ACL de Cisco y algunas reglas de firewall para indicar qué bits pueden variar.'
  - q: '¿Puedo escribir la máscara en lugar del prefijo?'
    a: 'Sí. Acepta 192.168.1.10/24, 192.168.1.10/255.255.255.0 y 192.168.1.10 255.255.255.0. Si la máscara tiene huecos, como 255.0.255.0, avisa que no es válida.'
  - q: '¿Funciona con IPv6?'
    a: 'Sí: muestra la red, el rango, la forma expandida y la abreviada según RFC 5952, el DNS inverso en ip6.arpa y el tipo de dirección (global, ULA, link-local, documentación, etc.).'
---

Esta calculadora resuelve las preguntas de red de todos los días sin abrir una hoja de cálculo: qué red contiene una IP, cuántos hosts caben en un bloque, cuál es el broadcast o cómo partir una red en subredes.

Escribe una dirección con su **prefijo** (`10.20.30.40/16`), con su **máscara** (`10.20.30.40 255.255.0.0`) o sola. Verás la red en notación CIDR, el rango completo, la máscara, la wildcard, el broadcast, el primer y último host asignable y la cantidad de direcciones. También verás la dirección como entero, en hexadecimal y en binario, su nombre de **DNS inverso** y su forma mapeada en IPv6.

La etiqueta de **tipo** indica si la IP es pública, privada (RFC 1918), CGNAT, loopback, link-local, multicast o de documentación. Te ayuda a entender por qué una dirección no es accesible desde internet.

En **Subredes** eliges un prefijo más largo y obtienes la lista de bloques resultantes, útil para planificar VPC, VLAN o reglas de firewall. Si escribes un **rango** como `10.0.0.1 - 10.0.0.9`, la herramienta devuelve la lista mínima de bloques CIDR que lo cubre exactamente.

Todo funciona igual con **IPv6**. El cálculo usa enteros de 128 bits en tu navegador y no consulta ningún servidor.
