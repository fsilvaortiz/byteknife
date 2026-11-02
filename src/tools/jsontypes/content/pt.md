---
title: 'JSON para TypeScript, Java e Go: gerar tipos'
description: 'Cole um JSON de exemplo e receba interfaces TypeScript, records Java ou structs Go com tipos aninhados, campos opcionais e nulos.'
examples:
  - title: 'Objeto aninhado para TypeScript'
    input: |
      {"id": 7, "email": "ana@ejemplo.dev", "tags": ["admin"], "direccion": {"ciudad": "Santiago"}}
    output: |
      export interface Usuario {
        id: number;
        email: string;
        tags: string[];
        direccion: Direccion;
      }

      export interface Direccion {
        ciudad: string;
      }
  - title: 'Array com um campo opcional para Go'
    input: |
      [{"id": 1, "total": 120}, {"id": 2, "total": 35.5, "cupon": "BIENVENIDA"}]
    output: |
      type Pedido []PedidoItem

      type PedidoItem struct {
      	ID    int64   `json:"id"`
      	Total float64 `json:"total"`
      	Cupon *string `json:"cupon,omitempty"`
      }
faq:
  - q: 'Como ele decide que um campo é opcional?'
    a: 'Quando o JSON tem um array de objetos, todos os elementos são combinados: um campo que falta em algum deles fica opcional (? no TypeScript, ponteiro com omitempty no Go, tipo wrapper no Java). Quanto mais variado o exemplo, melhores os tipos.'
  - q: 'E se um campo tiver valores de tipos diferentes?'
    a: 'É gerada uma união, por exemplo number | string no TypeScript. Um inteiro e um decimal no mesmo campo viram number, float64 ou double.'
  - q: 'Qual versão do Java é usada?'
    a: 'São gerados records, disponíveis desde o Java 16. Se uma chave não for um identificador válido ou for palavra reservada, o campo é renomeado e o @JsonProperty do Jackson mantém o nome original.'
  - q: 'Meu JSON sai do navegador?'
    a: 'Não. A inferência e a geração do código acontecem na sua aba; nada é enviado para um servidor.'
---

Escrever à mão os tipos de uma resposta de API é tedioso e fácil de errar. Esta ferramenta os **infere** de um JSON de exemplo e gera o código pronto para colar no seu projeto.

Escolha a **linguagem**: interfaces **TypeScript**, records **Java** ou structs **Go**. Cada objeto aninhado vira um tipo próprio, com nome derivado da chave: `endereco` gera `Endereco`, e os elementos de `pedidos` geram `Pedido`. Em **Nome raiz** você escolhe o nome do tipo principal.

Os tipos são deduzidos dos valores: textos, números inteiros ou decimais, booleanos, arrays e `null`. Se o JSON trouxer um **array de objetos**, todos os elementos são combinados, então os campos que faltam em algum ficam **opcionais** e os que às vezes são `null` ficam **anuláveis**. No Go isso vira ponteiros com `omitempty`; no Java, tipos wrapper como `Long` ou `Boolean`.

Chaves com hífens ou espaços ficam entre aspas no TypeScript, são mapeadas com a tag `json:"…"` no Go e com `@JsonProperty` no Java.

Um único exemplo não mostra todos os casos: revise os tipos gerados antes de usá-los em produção, principalmente os campos que são `null` no seu exemplo.
