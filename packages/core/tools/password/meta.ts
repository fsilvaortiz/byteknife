import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'password',
  category: 'generators',
  order: 3,
  i18n: {
    es: {
      name: 'Contraseñas',
      description: 'Contraseñas aleatorias con crypto.getRandomValues y estimación de entropía.',
      keywords: ['password', 'contraseña', 'clave', 'generar', 'random', 'secreto', 'token'],
    },
    en: {
      name: 'Passwords',
      description: 'Random passwords with crypto.getRandomValues and an entropy estimate.',
      keywords: ['password', 'passphrase', 'generate', 'random', 'secret', 'token'],
    },
    pt: {
      name: 'Senhas',
      description: 'Senhas aleatórias com crypto.getRandomValues e estimativa de entropia.',
      keywords: ['password', 'senha', 'gerar', 'random', 'segredo', 'token'],
    },
  },
};
