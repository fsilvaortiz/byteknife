---
title: 'Explicar expressões cron e próximas execuções'
description: 'Traduz uma expressão cron de 5 campos para linguagem natural, aponta erros campo a campo e calcula as próximas execuções no seu fuso horário.'
examples:
  - title: 'Um job em dias úteis'
    input: |
      0 9 * * 1-5
    output: |
      Às 09:00, de segunda-feira a sexta-feira.
      Próximas: seg 2 nov 09:00 · ter 3 nov 09:00 · qua 4 nov 09:00
  - title: 'Uma expressão que nunca é executada'
    input: |
      0 0 31 2 *
    output: |
      Às 00:00, no dia 31 do mês, em fevereiro.
      Esta expressão nunca é executada (p. ex., 31 de fevereiro).
faq:
  - q: 'Qual formato de cron é aceito?'
    a: 'O padrão de 5 campos: minuto, hora, dia do mês, mês e dia da semana, como no crontab, no CronJob do Kubernetes ou no GitHub Actions. Aceita *, listas (1,15), intervalos (1-5), passos (*/10) e nomes como MON ou JAN.'
  - q: 'E se eu indicar dia do mês e dia da semana ao mesmo tempo?'
    a: 'Como no cron clássico, a tarefa roda quando qualquer um dos dois bate. 0 0 1 * 1 roda no dia 1 de cada mês e também toda segunda-feira. A descrição deixa isso explícito.'
  - q: 'Em qual fuso horário as próximas execuções são calculadas?'
    a: 'No fuso horário do seu navegador, mostrado no título da lista. Lembre que muitos servidores e serviços como o GitHub Actions executam cron em UTC.'
---

Uma expressão cron define quando uma tarefa agendada é executada com cinco campos: **minuto, hora, dia do mês, mês e dia da semana**. Ela é compacta, mas fácil de ler errado: `0 9 * * 1-5` e `9 0 * * 1-5` se parecem muito e rodam em horários bem diferentes. Esta ferramenta traduz a expressão para uma frase clara enquanto você digita, para você confirmar que ela faz o que espera antes de ir para produção.

Abaixo da explicação aparece o detalhe de cada campo e as **próximas execuções** calculadas no seu fuso horário, que é a melhor prova de que a expressão está certa. Se a expressão nunca puder ser cumprida, como 31 de fevereiro, a ferramenta avisa em vez de deixar você esperando um job que não chega.

Se algo estiver errado, o erro diz qual campo falha e por quê: um valor fora do intervalo, um passo inválido ou um intervalo invertido. São aceitos curingas, listas, intervalos, passos e os nomes em inglês de meses e dias (`JAN`, `MON`), além de `7` como domingo.

Os atalhos de exemplo cobrem os casos mais comuns, como a cada 5 minutos, dias úteis ou o primeiro dia do mês. Tudo é calculado no seu navegador. Se você colar uma expressão cron na página inicial do ByteKnife, ela é reconhecida e aberta aqui.
