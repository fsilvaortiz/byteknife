---
title: 'Puertos TCP y UDP conocidos: qué servicio usa cada uno'
description: 'Busca por número o por servicio qué usa cada puerto: SSH 22, HTTPS 443, MySQL 3306, PostgreSQL 5432, Redis 6379 y más, con los rangos de IANA.'
examples:
  - title: 'Buscar un número'
    input: |
      5432
    output: |
      5432  TCP  PostgreSQL  Bases de datos  (no exponer)
      Puerto registrado (1024–49151)
  - title: 'Buscar por categoría'
    input: |
      correo
    output: |
      25   TCP  SMTP
      110  TCP  POP3
      143  TCP  IMAP
      465  TCP  SMTPS · con TLS
      587  TCP  SMTP Submission
      993  TCP  IMAPS
      995  TCP  POP3S
faq:
  - q: '¿Por qué algunos puertos dicen «no exponer»?'
    a: 'Son servicios que no deberían quedar abiertos a internet: bases de datos, Redis, Elasticsearch, RDP, SMB o la API de Docker sin TLS. Cada año se filtran datos por instancias expuestas sin autenticación.'
  - q: '¿Qué diferencia hay entre TCP y UDP?'
    a: 'TCP establece una conexión y garantiza el orden y la entrega; lo usan HTTP, SSH o las bases de datos. UDP envía datagramas sin conexión, con menos latencia; lo usan DNS, VoIP, juegos y HTTP/3 (QUIC).'
  - q: '¿Puedo usar cualquier puerto para mi aplicación?'
    a: 'En Unix, los puertos por debajo de 1024 requieren privilegios. Para servicios propios conviene un puerto registrado poco usado, y no uno del rango dinámico (49152–65535), que el sistema asigna a conexiones salientes.'
---

Cuando revisas reglas de firewall, la salida de `netstat` o `ss`, un `docker ps` o un escaneo de seguridad, aparecen números de puerto que no siempre recuerdas. Esta referencia te dice qué servicio suele escuchar en cada uno.

Escribe un **número** (`5432`, `:8080` o `puerto 22`) para ver el servicio asociado y en qué rango de IANA cae: **conocido** (0–1023), **registrado** (1024–49151) o **dinámico** (49152–65535). También puedes buscar por **nombre** (`redis`, `kafka`) o por **categoría** (`correo`, `vpn`, `bases de datos`).

La lista cubre los protocolos de internet clásicos (HTTP, SSH, DNS, SMTP, IMAP, LDAP), las bases de datos y colas más usadas (PostgreSQL, MySQL, MongoDB, Redis, Kafka, RabbitMQ), herramientas de infraestructura (Kubernetes, etcd, Prometheus, OpenTelemetry), VPN (WireGuard, OpenVPN, IPsec) y los puertos de desarrollo de Vite, Astro, Node.js o Jupyter.

Los servicios marcados con **no exponer** no deberían quedar accesibles desde internet sin autenticación y cifrado. Ten en cuenta que un puerto es solo una convención: cualquier servicio puede escuchar en cualquier número.
