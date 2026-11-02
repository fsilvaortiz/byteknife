---
title: 'Validar OpenAPI e Swagger online'
description: 'Valide uma especificação OpenAPI 3.0, 3.1, 3.2 ou Swagger 2.0 no navegador: esquema oficial, $ref quebrados, parâmetros de rota e operationId repetidos.'
examples:
  - title: 'Parâmetro não declarado e um erro de digitação'
    input: |
      openapi: 3.1.0
      info: { title: Pedidos API, version: 2.14.0 }
      paths:
        /pedidos/{pedidoId}:
          get:
            responses:
              '200':
                descripton: O pedido
    output: |
      5  Erro  A rota usa {pedidoId}, mas nenhum parâmetro in: path o declara
               paths › /pedidos/{pedidoId} › get
      7  Erro  Falta a propriedade obrigatória «description»
               paths › /pedidos/{pedidoId} › get › responses › 200
      7  Erro  Propriedade não permitida aqui: «descripton»
               paths › /pedidos/{pedidoId} › get › responses › 200
  - title: 'Referência quebrada'
    input: |
      openapi: 3.0.3
      info: { title: Pagamentos, version: '1' }
      paths:
        /pagamentos:
          post:
            requestBody:
              $ref: '#/components/requestBodies/Pagamento'
            responses:
              '201': { description: Criado }
    output: |
      6  Erro  A referência #/components/requestBodies/Pagamento não existe no documento
               paths › /pagamentos › post › requestBody
faq:
  - q: 'Quais versões do OpenAPI são suportadas?'
    a: 'OpenAPI 3.0, 3.1 e 3.2, além do Swagger 2.0. A versão vem do campo openapi ou swagger do documento, e a estrutura é validada com o JSON Schema oficial da OpenAPI Initiative para essa versão.'
  - q: 'O que verifica além do esquema oficial?'
    a: 'O que o esquema não consegue expressar: $ref locais que não existem, parâmetros de rota como {id} faltando ou sobrando, parâmetros repetidos, operationId duplicados, rotas equivalentes como /users/{id} e /users/{name}, esquemas de segurança não definidos e esquemas sem uso.'
  - q: 'Segue $ref para outros arquivos ou URLs?'
    a: 'Não. Referências externas aparecem como aviso e nunca são baixadas: a ferramenta não faz nenhuma requisição de rede com a sua especificação.'
  - q: 'Minha especificação é enviada a algum servidor?'
    a: 'Não. A leitura do YAML ou JSON e a validação acontecem no seu navegador, então você pode colar especificações internas sem publicá-las.'
---

**OpenAPI** (antes Swagger) descreve uma API HTTP: rotas, operações, parâmetros, corpos, respostas e segurança. A partir desse arquivo se geram documentação, clientes, servidores e testes de contrato, então um erro na especificação vira código quebrado ou documentação que mente. Este validador diz se a sua especificação é válida e, se não for, onde e por quê.

Cole a especificação em **YAML ou JSON**. A versão é detectada sozinha: OpenAPI 3.0, 3.1, 3.2 ou Swagger 2.0. A validação acontece enquanto você digita, e cada problema aparece com a **linha**, o **local** no documento (por exemplo, `paths › /pedidos › post › responses › 201`) e um detalhe no seu idioma.

Há dois tipos de verificação. A **estrutural** usa o JSON Schema oficial da OpenAPI Initiative e encontra propriedades obrigatórias ausentes, nomes digitados errado e valores não permitidos; das alternativas do esquema mostra só a que se aplica, não uma lista de erros repetidos. As **verificações extras** cobrem o que o esquema não vê: `$ref` quebrados, parâmetros de rota não declarados, `operationId` repetidos, rotas equivalentes e esquemas de segurança não definidos. Esquemas sem uso aparecem como aviso.

Abaixo aparece um resumo com o título e a versão da API e a lista de operações, útil para revisar de relance o que a API expõe.

Nada sai do seu navegador.
