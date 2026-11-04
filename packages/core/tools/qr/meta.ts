import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'qr',
  category: 'generators',
  order: 5,
  i18n: {
    es: {
      name: 'Generador de QR',
      description:
        'Crea códigos QR de texto, URL o Wi-Fi con el nivel de corrección y los colores que elijas, y descárgalos en SVG o PNG.',
      keywords: ['qr', 'codigo qr', 'generar', 'wifi', 'url', 'svg', 'png', 'barcode'],
    },
    en: {
      name: 'QR code generator',
      description:
        'Create QR codes for text, URLs or Wi-Fi with the error correction and colors you choose, and download them as SVG or PNG.',
      keywords: ['qr', 'qr code', 'generate', 'wifi', 'url', 'svg', 'png', 'barcode'],
    },
    pt: {
      name: 'Gerador de QR',
      description:
        'Crie QR codes de texto, URL ou Wi-Fi com a correção de erros e as cores que escolher, e baixe em SVG ou PNG.',
      keywords: ['qr', 'qr code', 'gerar', 'wifi', 'url', 'svg', 'png', 'barcode'],
    },
  },
};
