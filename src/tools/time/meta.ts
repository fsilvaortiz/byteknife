import type { ToolMeta } from '../../core/types';
import { isTimestamp } from './logic';

export const meta: ToolMeta = {
  id: 'time',
  category: 'time',
  order: 1,
  i18n: {
    es: {
      name: 'Timestamps',
      description: 'Convierte Unix (s, ms, µs, ns) e ISO 8601 entre zonas horarias.',
      keywords: [
        'timestamp',
        'unix',
        'epoch',
        'fecha',
        'date',
        'iso',
        '8601',
        'zona',
        'horaria',
        'utc',
        'convertir',
      ],
      labels: { timestamp: 'Fecha / timestamp' },
    },
    en: {
      name: 'Timestamps',
      description: 'Convert Unix (s, ms, µs, ns) and ISO 8601 across time zones.',
      keywords: [
        'timestamp',
        'unix',
        'epoch',
        'date',
        'iso',
        '8601',
        'time',
        'zone',
        'utc',
        'convert',
      ],
      labels: { timestamp: 'Date / timestamp' },
    },
    pt: {
      name: 'Timestamps',
      description: 'Converte Unix (s, ms, µs, ns) e ISO 8601 entre fusos horários.',
      keywords: [
        'timestamp',
        'unix',
        'epoch',
        'data',
        'date',
        'iso',
        '8601',
        'fuso',
        'horario',
        'utc',
        'converter',
      ],
      labels: { timestamp: 'Data / timestamp' },
    },
  },
  detect: (input) => (isTimestamp(input) ? { label: 'timestamp', confidence: 0.8 } : null),
};
