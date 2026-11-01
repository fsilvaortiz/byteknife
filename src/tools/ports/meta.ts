import type { ToolMeta } from '../../core/types';
import { looksLikePort } from './detect';

export const meta: ToolMeta = {
  id: 'ports',
  category: 'net',
  order: 8,
  i18n: {
    es: {
      name: 'Puertos conocidos',
      description:
        'Busca qué servicio usa cada puerto TCP y UDP: 22, 443, 3306, 5432, 6379, 8080 y más, con los rangos de IANA.',
      keywords: [
        'puerto',
        'port',
        'tcp',
        'udp',
        'servicio',
        'iana',
        'firewall',
        '443',
        '22',
        '5432',
      ],
      labels: { port: 'Puerto' },
    },
    en: {
      name: 'Well-known ports',
      description:
        'Look up which service uses each TCP and UDP port: 22, 443, 3306, 5432, 6379, 8080 and more, with the IANA ranges.',
      keywords: ['port', 'tcp', 'udp', 'service', 'iana', 'firewall', '443', '22', '5432'],
      labels: { port: 'Port' },
    },
    pt: {
      name: 'Portas conhecidas',
      description:
        'Descubra qual serviço usa cada porta TCP e UDP: 22, 443, 3306, 5432, 6379, 8080 e mais, com as faixas da IANA.',
      keywords: ['porta', 'port', 'tcp', 'udp', 'servico', 'iana', 'firewall', '443', '22', '5432'],
      labels: { port: 'Porta' },
    },
  },
  detect: (input) => (looksLikePort(input) ? { label: 'port', confidence: 0.8 } : null),
};
