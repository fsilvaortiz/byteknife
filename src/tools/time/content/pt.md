---
title: 'Converter timestamp Unix para data e fusos horários'
description: 'Converta timestamps Unix em segundos, milissegundos, µs ou ns para ISO 8601 e para o horário de vários fusos, e datas para Unix.'
examples:
  - title: 'De Unix em segundos para data'
    input: |
      1793318400
    output: |
      Unix (s)       1793318400
      Unix (ms)      1793318400000
      ISO 8601 UTC   2026-10-30T00:00:00.000Z
      RFC 7231       Fri, 30 Oct 2026 00:00:00 GMT
      Semana ISO     2026-W44
      São Paulo      29 de out. de 2026, 21:00 (GMT-3)
      Madri          30 de out. de 2026, 01:00 (GMT+1)
  - title: 'De data ISO 8601 para Unix'
    input: |
      2026-10-29T12:00:00Z
    output: |
      Unix (s)       1793275200
      Unix (ms)      1793275200000
      RFC 7231       Thu, 29 Oct 2026 12:00:00 GMT
faq:
  - q: 'Como ele sabe se o número está em segundos ou milissegundos?'
    a: 'Pela quantidade de dígitos: até 11 é lido como segundos, até 14 como milissegundos, até 17 como microssegundos e acima disso como nanossegundos. A unidade escolhida aparece ao lado da entrada.'
  - q: 'E se a data não tiver fuso horário?'
    a: 'Uma data como 2026-10-29 12:00 sem Z nem deslocamento é lida no seu horário local, e a ferramenta avisa. Adicione Z para UTC ou um deslocamento como -03:00 para evitar ambiguidade.'
  - q: 'Os fusos horários consideram o horário de verão?'
    a: 'Sim. Os fusos são calculados com a base IANA que vem no seu navegador via Intl, então o deslocamento de cada cidade é o que vale naquela data exata.'
---

Um timestamp Unix conta o tempo decorrido desde 1º de janeiro de 1970 à meia-noite UTC. É assim que a maioria dos sistemas guarda datas, mas não dá para ler de relance. Cole um timestamp e esta ferramenta mostra a data em **ISO 8601 UTC**, no formato HTTP da RFC 7231, no seu horário local, em tempo relativo («há 3 horas»), com a semana ISO e o dia do ano.

A entrada detecta sozinha a unidade pela quantidade de dígitos: **segundos** (como em `date +%s` ou nos JWT), **milissegundos** (como `Date.now()` em JavaScript ou Java), **microssegundos** (Python, PostgreSQL) e **nanossegundos** (Go, Prometheus). Também funciona ao contrário: cole uma data ISO 8601 ou um texto como `2026-10-29 12:00` e receba o timestamp em segundos e em milissegundos. Digite `agora` ou `now` para a hora atual.

A tabela de **fusos horários** mostra o mesmo instante em cidades das Américas, da Europa e da Ásia com o deslocamento em relação ao UTC, considerando o horário de verão daquela data. É o que você precisa para ler um log de produção, combinar um deploy entre equipes ou conferir quando um token expira.

Tudo é calculado no seu navegador com `Date` e `Intl`. Se você colar um timestamp na página inicial, o ByteKnife o reconhece e abre aqui.
