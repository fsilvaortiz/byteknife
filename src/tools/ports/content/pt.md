---
title: 'Portas TCP e UDP conhecidas: qual serviço usa cada uma'
description: 'Busque por número ou serviço para que serve cada porta: SSH 22, HTTPS 443, MySQL 3306, PostgreSQL 5432, Redis 6379 e mais, com as faixas da IANA.'
examples:
  - title: 'Buscar um número'
    input: |
      5432
    output: |
      5432  TCP  PostgreSQL  Bancos de dados  (não expor)
      Porta registrada (1024–49151)
  - title: 'Buscar por categoria'
    input: |
      e-mail
    output: |
      25   TCP  SMTP
      110  TCP  POP3
      143  TCP  IMAP
      465  TCP  SMTPS · com TLS
      587  TCP  SMTP Submission
      993  TCP  IMAPS
      995  TCP  POP3S
faq:
  - q: 'Por que algumas portas dizem «não expor»?'
    a: 'São serviços que não deveriam ficar abertos à internet: bancos de dados, Redis, Elasticsearch, RDP, SMB ou a API do Docker sem TLS. Todo ano vazam dados de instâncias expostas sem autenticação.'
  - q: 'Qual a diferença entre TCP e UDP?'
    a: 'O TCP estabelece uma conexão e garante a ordem e a entrega; HTTP, SSH e bancos de dados o usam. O UDP envia datagramas sem conexão, com menos latência; DNS, VoIP, jogos e HTTP/3 (QUIC) o usam.'
  - q: 'Posso usar qualquer porta no meu aplicativo?'
    a: 'No Unix, portas abaixo de 1024 exigem privilégios. Para serviços próprios, prefira uma porta registrada pouco usada, e não uma da faixa dinâmica (49152–65535), que o sistema atribui a conexões de saída.'
---

Quando você revisa regras de firewall, a saída do `netstat` ou do `ss`, um `docker ps` ou um scan de segurança, aparecem números de porta que nem sempre você lembra. Esta referência diz qual serviço costuma escutar em cada um.

Digite um **número** (`5432`, `:8080` ou `porta 22`) para ver o serviço associado e em qual faixa da IANA ele cai: **conhecida** (0–1023), **registrada** (1024–49151) ou **dinâmica** (49152–65535). Você também pode buscar por **nome** (`redis`, `kafka`) ou por **categoria** (`e-mail`, `vpn`, `bancos de dados`).

A lista cobre os protocolos clássicos da internet (HTTP, SSH, DNS, SMTP, IMAP, LDAP), os bancos de dados e filas mais usados (PostgreSQL, MySQL, MongoDB, Redis, Kafka, RabbitMQ), ferramentas de infraestrutura (Kubernetes, etcd, Prometheus, OpenTelemetry), VPNs (WireGuard, OpenVPN, IPsec) e as portas de desenvolvimento do Vite, Astro, Node.js ou Jupyter.

Os serviços marcados com **não expor** não deveriam ficar acessíveis pela internet sem autenticação e criptografia. Lembre que uma porta é só uma convenção: qualquer serviço pode escutar em qualquer número.
