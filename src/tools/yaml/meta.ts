import type { ToolMeta } from '../../core/types';
import { looksLikeYaml } from './detect';

export const meta: ToolMeta = {
  id: 'yaml',
  category: 'data',
  order: 3,
  i18n: {
    es: {
      name: 'YAML ⇄ JSON',
      description:
        'Convierte YAML a JSON y JSON a YAML, con anclas, varios documentos y errores con línea y columna.',
      keywords: ['yaml', 'yml', 'json', 'convertir', 'kubernetes', 'docker', 'compose', 'config'],
      labels: { yaml: 'YAML' },
    },
    en: {
      name: 'YAML ⇄ JSON',
      description:
        'Convert YAML to JSON and JSON to YAML, with anchors, multiple documents and errors with line and column.',
      keywords: ['yaml', 'yml', 'json', 'convert', 'kubernetes', 'docker', 'compose', 'config'],
      labels: { yaml: 'YAML' },
    },
    pt: {
      name: 'YAML ⇄ JSON',
      description:
        'Converte YAML em JSON e JSON em YAML, com âncoras, vários documentos e erros com linha e coluna.',
      keywords: ['yaml', 'yml', 'json', 'converter', 'kubernetes', 'docker', 'compose', 'config'],
      labels: { yaml: 'YAML' },
    },
  },
  detect: (input) => (looksLikeYaml(input) ? { label: 'yaml', confidence: 0.5 } : null),
};
