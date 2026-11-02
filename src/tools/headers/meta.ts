import type { ToolMeta } from '../../core/types';
import { looksLikeHeaders } from './detect';

export const meta: ToolMeta = {
  id: 'headers',
  category: 'net',
  order: 3,
  i18n: {
    es: {
      name: 'Analizar cabeceras HTTP',
      description:
        'Pega las cabeceras de una respuesta y revisa seguridad (HSTS, CSP, nosniff), caché, cookies y CORS.',
      keywords: [
        'http',
        'headers',
        'cabeceras',
        'seguridad',
        'hsts',
        'csp',
        'cors',
        'cache',
        'curl -i',
        'auditoria',
      ],
      labels: { message: 'Mensaje HTTP', headers: 'Cabeceras HTTP' },
    },
    en: {
      name: 'HTTP header analyzer',
      description:
        'Paste the headers of a response and check security (HSTS, CSP, nosniff), caching, cookies and CORS.',
      keywords: ['http', 'headers', 'security', 'hsts', 'csp', 'cors', 'cache', 'curl -i', 'audit'],
      labels: { message: 'HTTP message', headers: 'HTTP headers' },
    },
    pt: {
      name: 'Analisar cabeçalhos HTTP',
      description:
        'Cole os cabeçalhos de uma resposta e revise segurança (HSTS, CSP, nosniff), cache, cookies e CORS.',
      keywords: [
        'http',
        'headers',
        'cabecalhos',
        'seguranca',
        'hsts',
        'csp',
        'cors',
        'cache',
        'curl -i',
        'auditoria',
      ],
      labels: { message: 'Mensagem HTTP', headers: 'Cabeçalhos HTTP' },
    },
  },
  detect: (input) => {
    const kind = looksLikeHeaders(input);
    return kind ? { label: kind, confidence: kind === 'message' ? 0.9 : 0.7 } : null;
  },
};
