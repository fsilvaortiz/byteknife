---
title: 'Formatar SQL online: PostgreSQL, MySQL, T-SQL'
description: 'Formate e indente consultas SQL no navegador para PostgreSQL, MySQL, SQL Server, SQLite, BigQuery, Snowflake e outros, com palavras-chave em maiúsculas.'
examples:
  - title: 'Consulta numa linha só'
    input: |
      select id, nome from usuarios where ativo = true order by id
    output: |
      SELECT
        id,
        nome
      FROM
        usuarios
      WHERE
        ativo = TRUE
      ORDER BY
        id
  - title: 'Várias instruções em minúsculas'
    input: |
      SELECT 1; SELECT 2;
    output: |
      select
        1;

      select
        2;
faq:
  - q: 'Por que o dialeto importa?'
    a: 'Cada banco tem sua própria sintaxe: crases no MySQL, colchetes no SQL Server, operadores como :: ou ->> no PostgreSQL. Escolher o dialeto certo evita erros e preserva essas construções.'
  - q: 'O resultado da consulta muda?'
    a: 'Não. Só mudam os espaços, as quebras de linha e, se você pedir, a caixa das palavras-chave. Nomes de tabelas e colunas e textos entre aspas ficam intactos.'
  - q: 'A ferramenta valida a consulta?'
    a: 'Em parte: ela detecta erros de sintaxe como aspas ou parênteses sem fechar, mas não verifica se as tabelas ou colunas existem.'
  - q: 'Posso colar consultas com dados de produção?'
    a: 'Sim. A formatação acontece no navegador com a biblioteca sql-formatter e a consulta não é enviada para nenhum servidor.'
---

Uma consulta escrita numa linha só, copiada de um log ou gerada por um ORM, é difícil de ler e de revisar num pull request. Esta ferramenta a **formata**: cada cláusula (`SELECT`, `FROM`, `WHERE`, `GROUP BY`…) ganha sua linha, colunas e condições são indentadas e várias instruções ficam separadas por uma linha em branco.

Escolha o **dialeto** do seu banco: PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle PL/SQL, BigQuery, Snowflake, Redshift, Spark, Trino, DuckDB ou ClickHouse. Assim a sintaxe própria, as funções e a forma de citar identificadores são reconhecidas. Em **Palavras-chave** você define MAIÚSCULAS, minúsculas ou como estão; a **indentação** pode ser de 2 ou 4 espaços.

Se a consulta tiver um erro de sintaxe, como aspas sem fechar ou um parêntese a mais, você vê a mensagem com linha e coluna. Muitas vezes o problema é o dialeto: uma consulta válida no PostgreSQL pode não ser válida no SQL padrão.

É útil para revisar consultas lentas, documentar migrações, preparar exemplos para um README ou entender o que o ORM gera. Tudo roda no seu navegador.
