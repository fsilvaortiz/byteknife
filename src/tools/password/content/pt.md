---
title: 'Gerador de senhas seguras'
description: 'Gere senhas aleatórias com crypto.getRandomValues, escolha tamanho e tipos de caracteres, evite os ambíguos e veja a entropia em bits.'
examples:
  - title: '16 caracteres com maiúsculas, minúsculas, dígitos e símbolos'
    input: |
      Comprimento 16 · A–Z · a–z · 0–9 · Símbolos
    output: |
      N]sFEgPHc%v9EGFE        (exemplo: cada clique gera outras)
      Forte · 103 bits de entropia
  - title: '24 caracteres sem símbolos nem caracteres ambíguos'
    input: |
      Comprimento 24 · A–Z · a–z · 0–9 · Evitar ambíguos (Il1O0)
    output: |
      RfRFGAG6aE7zcv7YqqLDbpGF   (exemplo)
      Excelente · 140 bits de entropia
faq:
  - q: 'As senhas são geradas em um servidor?'
    a: 'Não. Elas são geradas no seu navegador com crypto.getRandomValues, o gerador criptográfico do sistema, e nunca são transmitidas nem armazenadas.'
  - q: 'O que significa a entropia em bits?'
    a: 'Ela mede quantas tentativas, em média, um atacante que conhece o método mas não a senha precisaria: cada bit dobra o esforço. O cálculo é comprimento × log2 do total de caracteres possíveis.'
  - q: 'Quantos bits eu preciso?'
    a: 'Como referência, 80 bits já resistem a ataques de força bruta online, e 100 ou mais é uma boa meta para senhas mestras, contas de serviço ou segredos de API.'
  - q: 'Por que evitar caracteres ambíguos?'
    a: 'I, l, 1, O e 0 se confundem ao ler ou ditar uma senha. Removê-los reduz um pouco a entropia por caractere, o que você compensa com uma senha mais longa.'
---

Uma senha segura é, antes de tudo, longa e realmente aleatória. Esta ferramenta gera várias de uma vez usando `crypto.getRandomValues`, o gerador criptográfico do navegador, e escolhe cada caractere de forma uniforme, sem o viés do clássico `Math.random() % n`.

Você pode ajustar o **comprimento** e os conjuntos de caracteres: maiúsculas, minúsculas, dígitos e símbolos. Cada senha inclui pelo menos um caractere de cada conjunto ativado, para atender políticas que exigem, por exemplo, um número e um símbolo. A opção **Evitar ambíguos** remove `I`, `l`, `1`, `O` e `0`, útil quando a senha vai ser lida em voz alta ou digitada à mão.

Ao lado do resultado aparece a **entropia** estimada em bits e um rótulo de força. A entropia depende do comprimento e do alfabeto, não de a senha «parecer» difícil: acrescentar quatro caracteres costuma ajudar mais do que adicionar símbolos.

Use essas senhas em contas novas, segredos de API, credenciais de banco de dados ou variáveis de ambiente, e guarde-as em um gerenciador de senhas. Nada do que é gerado sai do seu navegador nem fica salvo nele.
