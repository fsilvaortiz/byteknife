import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'regex',
  category: 'text',
  order: 1,
  i18n: {
    es: {
      name: 'Regex',
      description: 'Prueba expresiones regulares de JavaScript con resaltado, grupos y reemplazo.',
      keywords: [
        'regex',
        'regexp',
        'expresion',
        'regular',
        'match',
        'test',
        'replace',
        'grupos',
        'reemplazar',
      ],
    },
    en: {
      name: 'Regex',
      description: 'Test JavaScript regular expressions with highlighting, groups and replacement.',
      keywords: ['regex', 'regexp', 'regular', 'expression', 'match', 'test', 'replace', 'groups'],
    },
    pt: {
      name: 'Regex',
      description: 'Teste expressões regulares de JavaScript com destaque, grupos e substituição.',
      keywords: [
        'regex',
        'regexp',
        'expressao',
        'regular',
        'match',
        'test',
        'replace',
        'grupos',
        'substituir',
      ],
    },
  },
  heavy: true,
};
