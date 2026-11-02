import type { ToolMeta } from '../../core/types';
import { isColor } from './detect';

export const meta: ToolMeta = {
  id: 'color',
  category: 'web',
  order: 1,
  i18n: {
    es: {
      name: 'Colores',
      description: 'HEX, RGB, HSL y OKLCH, contraste WCAG y una escala de 10 tonos.',
      keywords: [
        'color',
        'hex',
        'rgb',
        'hsl',
        'oklch',
        'contraste',
        'wcag',
        'paleta',
        'escala',
        'css',
      ],
      labels: { color: 'Color' },
    },
    en: {
      name: 'Colors',
      description: 'HEX, RGB, HSL and OKLCH, WCAG contrast and a 10-step scale.',
      keywords: [
        'color',
        'colour',
        'hex',
        'rgb',
        'hsl',
        'oklch',
        'contrast',
        'wcag',
        'palette',
        'scale',
        'css',
      ],
      labels: { color: 'Color' },
    },
    pt: {
      name: 'Cores',
      description: 'HEX, RGB, HSL e OKLCH, contraste WCAG e uma escala de 10 tons.',
      keywords: [
        'cor',
        'color',
        'hex',
        'rgb',
        'hsl',
        'oklch',
        'contraste',
        'wcag',
        'paleta',
        'escala',
        'css',
      ],
      labels: { color: 'Cor' },
    },
  },
  detect: (input) => (isColor(input) ? { label: 'color', confidence: 0.9 } : null),
};
