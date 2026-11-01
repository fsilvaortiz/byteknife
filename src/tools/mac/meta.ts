import type { ToolMeta } from '../../core/types';
import { looksLikeMac } from './detect';

export const meta: ToolMeta = {
  id: 'mac',
  category: 'net',
  order: 9,
  i18n: {
    es: {
      name: 'Dirección MAC',
      description:
        'Convierte una MAC entre formatos, identifica el fabricante (OUI), si es unicast o multicast, local o universal, y su EUI-64.',
      keywords: [
        'mac',
        'oui',
        'fabricante',
        'vendor',
        'ethernet',
        'eui-64',
        'ipv6',
        'direccion',
        'red',
      ],
      labels: { mac: 'Dirección MAC' },
    },
    en: {
      name: 'MAC address',
      description:
        'Convert a MAC between formats and find its vendor (OUI), whether it is unicast or multicast, local or universal, and its EUI-64.',
      keywords: [
        'mac',
        'oui',
        'vendor',
        'manufacturer',
        'ethernet',
        'eui-64',
        'ipv6',
        'address',
        'network',
      ],
      labels: { mac: 'MAC address' },
    },
    pt: {
      name: 'Endereço MAC',
      description:
        'Converte um MAC entre formatos e identifica o fabricante (OUI), se é unicast ou multicast, local ou universal, e seu EUI-64.',
      keywords: [
        'mac',
        'oui',
        'fabricante',
        'vendor',
        'ethernet',
        'eui-64',
        'ipv6',
        'endereco',
        'rede',
      ],
      labels: { mac: 'Endereço MAC' },
    },
  },
  detect: (input) => (looksLikeMac(input) ? { label: 'mac', confidence: 0.9 } : null),
};
