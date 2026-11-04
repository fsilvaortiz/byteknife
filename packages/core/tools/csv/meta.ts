import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'csv',
  category: 'data',
  order: 2,
  i18n: {
    es: {
      name: 'JSON ⇄ CSV',
      description: 'Convierte arreglos de objetos a CSV y de vuelta, con delimitador configurable.',
      keywords: ['csv', 'json', 'convert', 'convertir', 'excel', 'tabla', 'delimitador'],
    },
    en: {
      name: 'JSON ⇄ CSV',
      description: 'Convert arrays of objects to CSV and back, with a configurable delimiter.',
      keywords: ['csv', 'json', 'convert', 'excel', 'table', 'spreadsheet', 'delimiter'],
    },
    pt: {
      name: 'JSON ⇄ CSV',
      description: 'Converte arrays de objetos para CSV e de volta, com delimitador configurável.',
      keywords: ['csv', 'json', 'converter', 'excel', 'tabela', 'planilha', 'delimitador'],
    },
  },
};
