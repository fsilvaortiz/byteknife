import type { ToolMeta } from '../../core/types';
import { isStatusCode } from './detect';

export const meta: ToolMeta = {
  id: 'http',
  category: 'web',
  order: 5,
  i18n: {
    es: {
      name: 'Códigos y cabeceras HTTP',
      description:
        'Referencia buscable de códigos de estado HTTP (200, 301, 404, 429, 503…) y de las cabeceras más usadas.',
      keywords: [
        'http',
        'status',
        'codigo',
        'estado',
        '404',
        '500',
        'cabeceras',
        'headers',
        'rfc',
        'cors',
      ],
      labels: { status: 'Código de estado HTTP' },
    },
    en: {
      name: 'HTTP status codes & headers',
      description:
        'Searchable reference of HTTP status codes (200, 301, 404, 429, 503…) and the most used headers.',
      keywords: ['http', 'status', 'code', '404', '500', 'headers', 'rfc', 'cors', 'reference'],
      labels: { status: 'HTTP status code' },
    },
    pt: {
      name: 'Códigos e cabeçalhos HTTP',
      description:
        'Referência pesquisável de códigos de status HTTP (200, 301, 404, 429, 503…) e dos cabeçalhos mais usados.',
      keywords: ['http', 'status', 'codigo', '404', '500', 'cabecalhos', 'headers', 'rfc', 'cors'],
      labels: { status: 'Código de status HTTP' },
    },
  },
  detect: (input) => (isStatusCode(input) ? { label: 'status', confidence: 0.6 } : null),
};
