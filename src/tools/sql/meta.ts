import type { ToolMeta } from '../../core/types';
import { looksLikeSql } from './detect';

export const meta: ToolMeta = {
  id: 'sql',
  category: 'data',
  order: 4,
  i18n: {
    es: {
      name: 'Formatear SQL',
      description:
        'Formatea consultas SQL para PostgreSQL, MySQL, SQL Server, SQLite, BigQuery y más, con palabras clave en mayúsculas.',
      keywords: [
        'sql',
        'formatear',
        'beautify',
        'query',
        'consulta',
        'postgres',
        'mysql',
        'tsql',
        'indentar',
      ],
      labels: { sql: 'Consulta SQL' },
    },
    en: {
      name: 'SQL formatter',
      description:
        'Format SQL queries for PostgreSQL, MySQL, SQL Server, SQLite, BigQuery and more, with uppercase keywords.',
      keywords: [
        'sql',
        'format',
        'formatter',
        'beautify',
        'query',
        'postgres',
        'mysql',
        'tsql',
        'pretty',
      ],
      labels: { sql: 'SQL query' },
    },
    pt: {
      name: 'Formatar SQL',
      description:
        'Formata consultas SQL para PostgreSQL, MySQL, SQL Server, SQLite, BigQuery e mais, com palavras-chave em maiúsculas.',
      keywords: [
        'sql',
        'formatar',
        'beautify',
        'query',
        'consulta',
        'postgres',
        'mysql',
        'tsql',
        'indentar',
      ],
      labels: { sql: 'Consulta SQL' },
    },
  },
  detect: (input) => (looksLikeSql(input) ? { label: 'sql', confidence: 0.7 } : null),
};
