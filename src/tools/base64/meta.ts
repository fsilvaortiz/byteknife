import type { ToolMeta } from '../../core/types';
import { isBase64Text } from './detect';

export const meta: ToolMeta = {
  id: 'base64',
  category: 'encoding',
  order: 1,
  i18n: {
    es: {
      name: 'Base64',
      description: 'Codifica y decodifica texto UTF-8, variante URL-safe y archivos a data URI.',
      keywords: [
        'base64',
        'b64',
        'encode',
        'decode',
        'codificar',
        'decodificar',
        'atob',
        'btoa',
        'data',
        'uri',
        'archivo',
      ],
      labels: { base64: 'Base64' },
    },
    en: {
      name: 'Base64',
      description: 'Encode and decode UTF-8 text, the URL-safe variant and files to data URIs.',
      keywords: ['base64', 'b64', 'encode', 'decode', 'atob', 'btoa', 'data', 'uri', 'file'],
      labels: { base64: 'Base64' },
    },
    pt: {
      name: 'Base64',
      description: 'Codifica e decodifica texto UTF-8, variante URL-safe e arquivos para data URI.',
      keywords: [
        'base64',
        'b64',
        'encode',
        'decode',
        'codificar',
        'decodificar',
        'atob',
        'btoa',
        'data',
        'uri',
        'arquivo',
      ],
      labels: { base64: 'Base64' },
    },
  },
  detect: (input) => (isBase64Text(input) ? { label: 'base64', confidence: 0.6 } : null),
};
