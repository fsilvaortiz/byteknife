import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'diff',
  category: 'text',
  order: 2,
  i18n: {
    es: {
      name: 'Diff de texto',
      description: 'Compara dos versiones línea a línea con vista unificada y conteo de cambios.',
      keywords: ['diff', 'compare', 'comparar', 'texto', 'cambios', 'versiones', 'patch'],
    },
    en: {
      name: 'Text diff',
      description: 'Compare two versions line by line with a unified view and a change count.',
      keywords: ['diff', 'compare', 'text', 'changes', 'versions', 'patch'],
    },
    pt: {
      name: 'Diff de texto',
      description: 'Compara duas versões linha a linha com visão unificada e contagem de mudanças.',
      keywords: ['diff', 'compare', 'comparar', 'texto', 'mudancas', 'versoes', 'patch'],
    },
  },
};
