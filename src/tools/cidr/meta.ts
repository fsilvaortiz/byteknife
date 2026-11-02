import type { ToolMeta } from '../../core/types';
import { isIpOrCidr } from './detect';

export const meta: ToolMeta = {
  id: 'cidr',
  category: 'net',
  order: 1,
  i18n: {
    es: {
      name: 'IP / CIDR',
      description:
        'Calcula red, máscara, broadcast y hosts de un bloque IPv4 o IPv6, divide en subredes y convierte rangos a CIDR.',
      keywords: [
        'ip',
        'cidr',
        'subred',
        'subnet',
        'mascara',
        'netmask',
        'ipv4',
        'ipv6',
        'broadcast',
        'calculadora',
        'rango',
        'red',
      ],
      labels: { ip: 'Dirección IP / CIDR' },
    },
    en: {
      name: 'IP / CIDR',
      description:
        'Work out network, mask, broadcast and hosts for an IPv4 or IPv6 block, split it into subnets and turn ranges into CIDR.',
      keywords: [
        'ip',
        'cidr',
        'subnet',
        'netmask',
        'mask',
        'ipv4',
        'ipv6',
        'broadcast',
        'calculator',
        'range',
        'network',
      ],
      labels: { ip: 'IP address / CIDR' },
    },
    pt: {
      name: 'IP / CIDR',
      description:
        'Calcula rede, máscara, broadcast e hosts de um bloco IPv4 ou IPv6, divide em sub-redes e converte faixas em CIDR.',
      keywords: [
        'ip',
        'cidr',
        'sub-rede',
        'subnet',
        'mascara',
        'netmask',
        'ipv4',
        'ipv6',
        'broadcast',
        'calculadora',
        'faixa',
        'rede',
      ],
      labels: { ip: 'Endereço IP / CIDR' },
    },
  },
  detect: (input) => (isIpOrCidr(input) ? { label: 'ip', confidence: 0.85 } : null),
};
