---
title: 'Comparar textos online: diff linha a linha'
description: 'Compare duas versões de um texto linha a linha com visão unificada, números de linha e contagem de mudanças. Ignore espaços finais se quiser.'
examples:
  - title: 'Mudanças em um arquivo de configuração'
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
  - title: 'Ignorar espaços no final da linha'
    input: |
      Original:   "a = 1  " / "b = 2"
      Modificado: "a = 1" / "b = 2"
    output: |
      Sem diferenças
faq:
  - q: 'Qual algoritmo é usado?'
    a: 'Ele calcula a maior subsequência comum de linhas, a mesma ideia por trás do diff e do git diff. Linhas iguais são mantidas e as diferentes aparecem como adicionadas ou removidas.'
  - q: 'Existe limite de tamanho?'
    a: 'Dá para comparar arquivos com milhares de linhas. Se os dois textos diferirem em linhas demais para calcular sem travar a aba, a ferramenta avisa em vez de travar.'
  - q: 'Posso comparar arquivos com finais de linha do Windows?'
    a: 'Sim. CRLF e CR são normalizados para LF antes da comparação, então um arquivo editado no Windows e outro no Linux não aparecem como totalmente diferentes.'
---

Quando você tem duas versões de um texto, como um arquivo de configuração antes e depois de uma mudança, duas respostas de uma API ou duas versões de uma consulta SQL, achar as diferenças no olho é lento e sujeito a erros. Cole o **original** à esquerda e o **modificado** à direita, e a ferramenta mostra uma **visão unificada** com as linhas adicionadas em verde, as removidas em vermelho e os números de linha de cada lado.

No topo aparece a contagem de linhas adicionadas e removidas. Com **Só mudanças** você esconde as linhas que não mudaram para focar no que importa, e com **Ignorar espaços no final** evita que um editor que remove espaços sobrando encha o resultado de falsas mudanças. Os finais de linha do Windows (CRLF) são normalizados automaticamente.

O botão de troca inverte original e modificado, útil quando você colou os textos ao contrário. A comparação usa o algoritmo da maior subsequência comum, a mesma base do `diff` e do `git diff`, e é atualizada enquanto você digita.

Como tudo roda no seu navegador, você pode comparar arquivos com credenciais, logs internos ou dados de clientes sem enviá-los a nenhum serviço.
