import type { ToolMeta } from '../../core/types';

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
  detect: (input) =>
    /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(input) ||
    /^(rgb|hsl|oklch|lab|hwb)a?\(.+\)$/i.test(input)
      ? { label: 'color', confidence: 0.9 }
      : null,
};
