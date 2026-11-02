import type { ToolMeta } from '../../core/types';
import { looksLikeUserAgent } from './detect';

export const meta: ToolMeta = {
  id: 'useragent',
  category: 'net',
  order: 7,
  i18n: {
    es: {
      name: 'User-Agent',
      description:
        'Identifica navegador, motor, sistema operativo, tipo de dispositivo y bots a partir de una cadena User-Agent.',
      keywords: [
        'user-agent',
        'ua',
        'navegador',
        'browser',
        'bot',
        'crawler',
        'dispositivo',
        'sistema',
        'parser',
      ],
      labels: { ua: 'Cadena User-Agent' },
    },
    en: {
      name: 'User-Agent',
      description:
        'Identify the browser, engine, operating system, device type and bots behind a User-Agent string.',
      keywords: ['user-agent', 'ua', 'browser', 'bot', 'crawler', 'device', 'os', 'parser'],
      labels: { ua: 'User-Agent string' },
    },
    pt: {
      name: 'User-Agent',
      description:
        'Identifica navegador, motor, sistema operacional, tipo de dispositivo e bots a partir de uma string User-Agent.',
      keywords: [
        'user-agent',
        'ua',
        'navegador',
        'browser',
        'bot',
        'crawler',
        'dispositivo',
        'sistema',
        'parser',
      ],
      labels: { ua: 'String User-Agent' },
    },
  },
  detect: (input) => (looksLikeUserAgent(input) ? { label: 'ua', confidence: 0.9 } : null),
};
