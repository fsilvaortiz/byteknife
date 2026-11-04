---
title: 'Well-known TCP and UDP ports: which service uses each'
description: 'Look up by number or service what each port is for: SSH 22, HTTPS 443, MySQL 3306, PostgreSQL 5432, Redis 6379 and more, with the IANA ranges.'
examples:
  - title: 'Look up a number'
    input: |
      5432
    output: |
      5432  TCP  PostgreSQL  Databases  (do not expose)
      Registered port (1024–49151)
  - title: 'Look up a category'
    input: |
      mail
    output: |
      25   TCP  SMTP
      110  TCP  POP3
      143  TCP  IMAP
      465  TCP  SMTPS · over TLS
      587  TCP  SMTP Submission
      993  TCP  IMAPS
      995  TCP  POP3S
faq:
  - q: 'Why do some ports say «do not expose»?'
    a: 'They are services that should not be open to the internet: databases, Redis, Elasticsearch, RDP, SMB or the Docker API without TLS. Every year data leaks from instances exposed without authentication.'
  - q: 'What is the difference between TCP and UDP?'
    a: 'TCP sets up a connection and guarantees order and delivery; HTTP, SSH and databases use it. UDP sends connectionless datagrams with lower latency; DNS, VoIP, games and HTTP/3 (QUIC) use it.'
  - q: 'Can I use any port for my app?'
    a: 'On Unix, ports below 1024 require privileges. For your own services pick a seldom-used registered port, not one from the dynamic range (49152–65535), which the OS assigns to outgoing connections.'
---

When you review firewall rules, the output of `netstat` or `ss`, a `docker ps` or a security scan, port numbers show up that you do not always remember. This reference tells you which service usually listens on each one.

Type a **number** (`5432`, `:8080` or `port 22`) to see the associated service and which IANA range it falls in: **well-known** (0–1023), **registered** (1024–49151) or **dynamic** (49152–65535). You can also search by **name** (`redis`, `kafka`) or **category** (`mail`, `vpn`, `databases`).

The list covers classic internet protocols (HTTP, SSH, DNS, SMTP, IMAP, LDAP), popular databases and queues (PostgreSQL, MySQL, MongoDB, Redis, Kafka, RabbitMQ), infrastructure tools (Kubernetes, etcd, Prometheus, OpenTelemetry), VPNs (WireGuard, OpenVPN, IPsec) and the development ports of Vite, Astro, Node.js or Jupyter.

Services marked **do not expose** should never be reachable from the internet without authentication and encryption. Keep in mind that a port is only a convention: any service can listen on any number.
