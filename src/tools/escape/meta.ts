import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'escape',
  category: 'encoding',
  order: 4,
  i18n: {
    es: {
      name: 'Escapar cadenas',
      description: 'Entidades HTML, literales de cadena JSON y secuencias \\u de Unicode.',
      keywords: [
        'escape',
        'unescape',
        'escapar',
        'html',
        'entities',
        'entidades',
        'json',
        'string',
        'unicode',
        '\\u',
        'comillas',
      ],
    },
    en: {
      name: 'Escape strings',
      description: 'HTML entities, JSON string literals and Unicode \\u sequences.',
      keywords: [
        'escape',
        'unescape',
        'html',
        'entities',
        'json',
        'string',
        'unicode',
        '\\u',
        'quotes',
      ],
    },
    pt: {
      name: 'Escapar strings',
      description: 'Entidades HTML, literais de string JSON e sequências \\u de Unicode.',
      keywords: [
        'escape',
        'unescape',
        'escapar',
        'html',
        'entities',
        'entidades',
        'json',
        'string',
        'unicode',
        '\\u',
        'aspas',
      ],
    },
  },
};
