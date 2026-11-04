import type { ToolMeta } from '../../core/types';
import { declaredVersion } from './detect';

export const meta: ToolMeta = {
  id: 'openapi',
  category: 'data',
  order: 8,
  i18n: {
    es: {
      name: 'Validar OpenAPI',
      description:
        'Valida una especificación OpenAPI 3.0, 3.1, 3.2 o Swagger 2.0 en YAML o JSON: estructura, $ref rotos, parámetros de ruta y operationId repetidos.',
      keywords: ['openapi', 'swagger', 'validar', 'validator', 'api', 'spec', 'yaml', 'rest'],
      labels: { openapi: 'OpenAPI' },
    },
    en: {
      name: 'OpenAPI validator',
      description:
        'Validate an OpenAPI 3.0, 3.1, 3.2 or Swagger 2.0 spec in YAML or JSON: structure, broken $refs, path parameters and duplicate operationIds.',
      keywords: ['openapi', 'swagger', 'validate', 'validator', 'api', 'spec', 'yaml', 'rest'],
      labels: { openapi: 'OpenAPI' },
    },
    pt: {
      name: 'Validar OpenAPI',
      description:
        'Valida uma especificação OpenAPI 3.0, 3.1, 3.2 ou Swagger 2.0 em YAML ou JSON: estrutura, $ref quebrados, parâmetros de rota e operationId repetidos.',
      keywords: ['openapi', 'swagger', 'validar', 'validator', 'api', 'spec', 'yaml', 'rest'],
      labels: { openapi: 'OpenAPI' },
    },
  },
  // Por encima de JSON (0,9) y YAML (0,5): una spec es las dos cosas.
  detect: (input) => (declaredVersion(input) ? { label: 'openapi', confidence: 0.95 } : null),
};
