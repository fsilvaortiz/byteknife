---
title: 'Formatear SQL en línea: PostgreSQL, MySQL, T-SQL'
description: 'Formatea e indenta consultas SQL en tu navegador para PostgreSQL, MySQL, SQL Server, SQLite, BigQuery, Snowflake y otros, con palabras clave en mayúsculas.'
examples:
  - title: 'Consulta en una sola línea'
    input: |
      select id, nombre from usuarios where activo = true order by id
    output: |
      SELECT
        id,
        nombre
      FROM
        usuarios
      WHERE
        activo = TRUE
      ORDER BY
        id
  - title: 'Varias sentencias en minúsculas'
    input: |
      SELECT 1; SELECT 2;
    output: |
      select
        1;

      select
        2;
faq:
  - q: '¿Por qué importa el dialecto?'
    a: 'Cada motor tiene su propia sintaxis: comillas invertidas en MySQL, corchetes en SQL Server, operadores como :: o ->> en PostgreSQL. Elegir el dialecto correcto evita errores y respeta esas construcciones.'
  - q: '¿Cambia el resultado de la consulta?'
    a: 'No. Solo cambian los espacios, los saltos de línea y, si lo pides, las mayúsculas de las palabras clave. Los nombres de tablas, columnas y los textos entre comillas quedan intactos.'
  - q: '¿Valida que la consulta sea correcta?'
    a: 'Solo en parte: detecta errores de sintaxis como comillas o paréntesis sin cerrar, pero no comprueba que las tablas o columnas existan.'
  - q: '¿Puedo pegar consultas con datos de producción?'
    a: 'Sí. El formateo ocurre en tu navegador con la librería sql-formatter y la consulta no se envía a ningún servidor.'
---

Una consulta escrita en una sola línea, copiada de un log o generada por un ORM, es difícil de leer y de revisar en un pull request. Esta herramienta la **formatea**: pone cada cláusula (`SELECT`, `FROM`, `WHERE`, `GROUP BY`…) en su línea, indenta columnas y condiciones, y separa varias sentencias con una línea en blanco.

Elige el **dialecto** de tu base de datos: PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle PL/SQL, BigQuery, Snowflake, Redshift, Spark, Trino, DuckDB o ClickHouse. Así se reconocen su sintaxis propia, sus funciones y su forma de citar identificadores. Con **Palabras clave** decides si van en MAYÚSCULAS, minúsculas o como las escribiste; la **sangría** puede ser de 2 o 4 espacios.

Si la consulta tiene un error de sintaxis, como una comilla sin cerrar o un paréntesis de más, verás el mensaje con su línea y columna. Muchas veces el problema es el dialecto: una consulta válida en PostgreSQL puede no serlo en SQL estándar.

Es útil para revisar consultas lentas, documentar migraciones, preparar ejemplos para un README o entender lo que genera tu ORM. Todo corre en tu navegador.
