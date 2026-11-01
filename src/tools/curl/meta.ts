import type { ToolMeta } from '../../core/types';
import { isCurlCommand } from './detect';

export const meta: ToolMeta = {
  id: 'curl',
  category: 'web',
  order: 3,
  i18n: {
    es: {
      name: 'curl → código',
      description:
        'Convierte un comando curl en código con fetch de JavaScript, requests de Python, HttpClient de Java o net/http de Go.',
      keywords: [
        'curl',
        'convertir',
        'fetch',
        'python',
        'requests',
        'java',
        'httpclient',
        'go',
        'http',
        'api',
      ],
      labels: { curl: 'Comando curl' },
    },
    en: {
      name: 'curl → code',
      description:
        'Turn a curl command into JavaScript fetch, Python requests, Java HttpClient or Go net/http code.',
      keywords: [
        'curl',
        'convert',
        'fetch',
        'python',
        'requests',
        'java',
        'httpclient',
        'go',
        'http',
        'api',
      ],
      labels: { curl: 'curl command' },
    },
    pt: {
      name: 'curl → código',
      description:
        'Converte um comando curl em código com fetch do JavaScript, requests do Python, HttpClient do Java ou net/http do Go.',
      keywords: [
        'curl',
        'converter',
        'fetch',
        'python',
        'requests',
        'java',
        'httpclient',
        'go',
        'http',
        'api',
      ],
      labels: { curl: 'Comando curl' },
    },
  },
  detect: (input) => (isCurlCommand(input) ? { label: 'curl', confidence: 0.95 } : null),
};
