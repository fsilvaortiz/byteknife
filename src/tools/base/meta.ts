import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'base',
  category: 'web',
  order: 2,
  i18n: {
    es: {
      name: 'Bases numéricas',
      description: 'Binario, octal, decimal y hexadecimal con enteros de tamaño arbitrario.',
      keywords: [
        'binario',
        'hex',
        'hexadecimal',
        'octal',
        'decimal',
        'base',
        'convertir',
        'bits',
        'bigint',
      ],
      labels: { number: 'Número' },
    },
    en: {
      name: 'Number bases',
      description: 'Binary, octal, decimal and hexadecimal with arbitrary-size integers.',
      keywords: [
        'binary',
        'hex',
        'hexadecimal',
        'octal',
        'decimal',
        'base',
        'convert',
        'bits',
        'bigint',
      ],
      labels: { number: 'Number' },
    },
    pt: {
      name: 'Bases numéricas',
      description: 'Binário, octal, decimal e hexadecimal com inteiros de tamanho arbitrário.',
      keywords: [
        'binario',
        'hex',
        'hexadecimal',
        'octal',
        'decimal',
        'base',
        'converter',
        'bits',
        'bigint',
      ],
      labels: { number: 'Número' },
    },
  },
  detect: (input) =>
    /^(0x[0-9a-f]+|0b[01]+|0o[0-7]+)$/i.test(input) ? { label: 'number', confidence: 0.8 } : null,
};
