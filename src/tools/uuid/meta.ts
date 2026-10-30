import type { ToolMeta } from '../../core/types';
import { isUuid } from './logic';

export const meta: ToolMeta = {
  id: 'uuid',
  category: 'generators',
  order: 1,
  i18n: {
    es: {
      name: 'UUID',
      description: 'Genera UUID v4 y v7 en lote e inspecciona versión, variante y fecha.',
      keywords: ['uuid', 'guid', 'v4', 'v7', 'generar', 'random', 'id', 'ulid'],
      labels: { uuid: 'UUID' },
    },
    en: {
      name: 'UUID',
      description: 'Generate UUID v4 and v7 in bulk and inspect version, variant and date.',
      keywords: ['uuid', 'guid', 'v4', 'v7', 'generate', 'random', 'id', 'ulid'],
      labels: { uuid: 'UUID' },
    },
    pt: {
      name: 'UUID',
      description: 'Gera UUID v4 e v7 em lote e inspeciona versão, variante e data.',
      keywords: ['uuid', 'guid', 'v4', 'v7', 'gerar', 'random', 'id', 'ulid'],
      labels: { uuid: 'UUID' },
    },
  },
  detect: (input) => (isUuid(input) ? { label: 'uuid', confidence: 0.95 } : null),
};
