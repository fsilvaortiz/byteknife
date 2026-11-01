import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'jsonschema',
  category: 'data',
  order: 7,
  i18n: {
    es: {
      name: 'Validar JSON Schema',
      description:
        'Valida un JSON contra un JSON Schema (drafts 4, 7, 2019-09 y 2020-12) y muestra cada error con su ruta y su regla.',
      keywords: [
        'json schema',
        'validar',
        'validator',
        'esquema',
        'openapi',
        'contrato',
        'draft',
        'json',
      ],
    },
    en: {
      name: 'JSON Schema validator',
      description:
        'Validate JSON against a JSON Schema (drafts 4, 7, 2019-09 and 2020-12) and see each error with its path and rule.',
      keywords: [
        'json schema',
        'validate',
        'validator',
        'schema',
        'openapi',
        'contract',
        'draft',
        'json',
      ],
    },
    pt: {
      name: 'Validar JSON Schema',
      description:
        'Valida um JSON contra um JSON Schema (drafts 4, 7, 2019-09 e 2020-12) e mostra cada erro com o caminho e a regra.',
      keywords: [
        'json schema',
        'validar',
        'validator',
        'esquema',
        'openapi',
        'contrato',
        'draft',
        'json',
      ],
    },
  },
};
