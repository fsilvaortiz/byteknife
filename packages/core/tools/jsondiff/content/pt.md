---
title: 'Comparar JSON: diff estrutural online'
description: 'Compare dois JSON pela estrutura e veja as chaves adicionadas, removidas ou alteradas, com o caminho. Ignora a ordem das chaves e, se quiser, a dos arrays.'
examples:
  - title: 'Duas versões de uma configuração'
    input: |
      {"versao": "2.14.0", "limites": {"rps": 1200}, "flags": {"beta": true}}
      {"versao": "2.15.0", "limites": {"rps": 1500, "timeoutMs": 2500}, "flags": {}}
    output: |
      $.versao             "2.14.0"  →  "2.15.0"
      $.limites.rps        1200      →  1500
      + $.limites.timeoutMs          2500
      − $.flags.beta       true
  - title: 'Arrays sem importar a ordem'
    input: |
      ["admin", "dev", "ops"]
      ["ops", "admin", "qa"]
    output: |
      − $[1]  "dev"
      + $[2]  "qa"
faq:
  - q: 'Qual a diferença para um diff de texto?'
    a: 'Um diff de texto compara linhas, então tudo muda se o JSON foi formatado de outro jeito ou as chaves vêm em outra ordem. Este diff compara valores: dois JSON equivalentes não mostram diferenças mesmo parecendo diferentes.'
  - q: 'Como ler os caminhos?'
    a: 'Eles usam a notação JSONPath: $ é a raiz, .chave entra num objeto e [0] num array. Chaves com espaços ou símbolos ficam entre colchetes, como $["chave estranha"].'
  - q: 'O que faz «Ignorar a ordem nos arrays»?'
    a: 'Compara cada array como um conjunto: se os mesmos elementos aparecem em outra ordem, não há mudanças. Só os elementos que faltam ou sobram são informados. Útil para listas de permissões, tags ou IDs.'
  - q: 'Posso comparar respostas de uma API com dados reais?'
    a: 'Sim. A comparação acontece no navegador e nenhum dos dois JSON é enviado para um servidor.'
---

Quando uma API responde diferente entre duas versões, ou um arquivo de configuração mudou entre ambientes, comparar o JSON no olho é lento e sujeito a erro. Esta ferramenta faz um **diff estrutural**: interpreta os dois JSON e compara os valores, não as linhas.

O resultado é uma tabela com o **caminho** de cada diferença e os valores **antes** e **depois**. Chaves novas aparecem como adicionadas, as que sumiram como removidas e os valores diferentes como alterados, mesmo quando o tipo mudou, por exemplo de número para texto. A ordem das chaves de um objeto nunca conta, nem os espaços ou a indentação.

Os arrays são comparados **por posição**: se você insere um elemento no início, todos os seguintes contam como alterados. Quando a ordem não importa, como numa lista de papéis ou de tags, ative **Ignorar a ordem nos arrays** e você verá só os elementos que faltam ou sobram.

É útil para revisar contratos de API, comparar fixtures de testes, auditar mudanças em configurações ou feature flags e entender o que mudou num payload de webhook. Se algum dos dois JSON tiver erro, você vê a linha e a coluna.
