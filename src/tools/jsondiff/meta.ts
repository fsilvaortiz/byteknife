import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'jsondiff',
  category: 'data',
  order: 5,
  i18n: {
    es: {
      name: 'Diff de JSON',
      description:
        'Compara dos JSON por estructura: claves agregadas, quitadas y valores cambiados con su ruta, sin importar el orden de las claves.',
      keywords: ['json', 'diff', 'comparar', 'diferencias', 'estructural', 'cambios', 'api'],
    },
    en: {
      name: 'JSON diff',
      description:
        'Compare two JSON documents structurally: added and removed keys and changed values with their path, regardless of key order.',
      keywords: ['json', 'diff', 'compare', 'differences', 'structural', 'changes', 'api'],
    },
    pt: {
      name: 'Diff de JSON',
      description:
        'Compara dois JSON pela estrutura: chaves adicionadas, removidas e valores alterados com o caminho, sem importar a ordem das chaves.',
      keywords: ['json', 'diff', 'comparar', 'diferencas', 'estrutural', 'mudancas', 'api'],
    },
  },
};
