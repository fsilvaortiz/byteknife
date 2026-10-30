import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'json',
  category: 'data',
  order: 1,
  i18n: {
    es: {
      name: 'JSON',
      description: 'Formatea, minifica, ordena claves y valida con línea y columna del error.',
      keywords: ['json', 'format', 'pretty', 'beautify', 'minify', 'validar', 'lint', 'formatear'],
      labels: { valid: 'JSON válido', invalid: 'JSON con errores' },
    },
    en: {
      name: 'JSON',
      description: "Format, minify, sort keys and validate with the error's line and column.",
      keywords: ['json', 'format', 'pretty', 'beautify', 'minify', 'validate', 'lint'],
      labels: { valid: 'Valid JSON', invalid: 'JSON with errors' },
    },
    pt: {
      name: 'JSON',
      description: 'Formata, minifica, ordena chaves e valida com linha e coluna do erro.',
      keywords: ['json', 'format', 'pretty', 'beautify', 'minify', 'validar', 'lint', 'formatar'],
      labels: { valid: 'JSON válido', invalid: 'JSON com erros' },
    },
  },
  detect(input) {
    if (!/^[[{]/.test(input)) return null;
    try {
      JSON.parse(input);
      return { label: 'valid', confidence: 0.9 };
    } catch {
      return { label: 'invalid', confidence: 0.4 };
    }
  },
};
