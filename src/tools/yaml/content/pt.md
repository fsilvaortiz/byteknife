---
title: 'Converter YAML para JSON e JSON para YAML'
description: 'Converta YAML em JSON e vice-versa no navegador: âncoras e aliases, vários documentos, indentação à escolha e erros com linha e coluna.'
examples:
  - title: 'Configuração YAML para JSON'
    input: |
      servico: pagamentos-api
      replicas: 3
      portas:
        - 8080
        - 9090
    output: |
      {
        "servico": "pagamentos-api",
        "replicas": 3,
        "portas": [
          8080,
          9090
        ]
      }
  - title: 'JSON para YAML'
    input: |
      {"env": {"LOG_LEVEL": "info", "FEATURE_PIX": true}}
    output: |
      env:
        LOG_LEVEL: info
        FEATURE_PIX: true
faq:
  - q: 'O que acontece com âncoras e aliases?'
    a: 'Eles são resolvidos: um alias *img copia o valor da âncora &img, e as chaves de mesclagem <<: *base incorporam o mapa referenciado. O JSON resultante não tem referências.'
  - q: 'E se o YAML tiver vários documentos?'
    a: 'Se o texto tiver vários documentos separados por ---, como um manifesto do Kubernetes com vários recursos, o resultado é um array JSON com um elemento por documento.'
  - q: 'Os comentários se perdem?'
    a: 'Sim. JSON não tem comentários, então eles são descartados ao passar de YAML para JSON e não voltam ao converter de novo para YAML.'
  - q: 'Minha configuração é enviada para algum servidor?'
    a: 'Não. A conversão usa a biblioteca yaml dentro do navegador; nem o YAML nem o JSON saem da aba.'
---

YAML é o formato do Kubernetes, Docker Compose, GitHub Actions, OpenAPI e de muitas configurações; JSON é o que APIs, `jq` e a maioria das linguagens esperam. Esta ferramenta converte entre os dois enquanto você digita.

Em **YAML → JSON**, as **âncoras** (`&nome`), os **aliases** (`*nome`) e as chaves de mesclagem (`<<:`) são resolvidos, os tipos são mantidos (números, booleanos, `null`) e, se o texto tiver vários documentos separados por `---`, você recebe um array com um item por documento. Em **JSON → YAML**, a saída usa o estilo de bloco e não quebra linhas longas, então pode ser colada direto num arquivo de configuração.

Se houver um erro, você vê a mensagem com a **linha e a coluna**: uma lista sem fechar, uma indentação errada ou uma chave duplicada. É a forma rápida de descobrir por que o `kubectl apply` ou um workflow de CI rejeita um arquivo.

Ao trocar de direção, a saída vira a nova entrada, para você ir e voltar. Escolha indentação de 2 ou 4 espaços conforme a convenção do projeto.

Lembre que os comentários do YAML não existem em JSON e se perdem na conversão. Tudo acontece no seu navegador.
