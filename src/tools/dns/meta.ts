import type { ToolMeta } from '../../core/types';
import { detectDns } from './detect';

export const meta: ToolMeta = {
  id: 'dns',
  category: 'net',
  order: 6,
  i18n: {
    es: {
      name: 'Registros DNS: SPF, DMARC, DKIM',
      description:
        'Analiza registros SPF, DMARC y DKIM, archivos de zona y salida de dig: errores, límite de 10 consultas y políticas débiles.',
      keywords: [
        'dns',
        'spf',
        'dmarc',
        'dkim',
        'txt',
        'zona',
        'dig',
        'correo',
        'email',
        'mx',
        'registro',
      ],
      labels: {
        spf: 'Registro SPF',
        dmarc: 'Registro DMARC',
        dkim: 'Registro DKIM',
        zone: 'Registros DNS',
      },
    },
    en: {
      name: 'DNS records: SPF, DMARC, DKIM',
      description:
        'Analyze SPF, DMARC and DKIM records, zone files and dig output: errors, the 10-lookup limit and weak policies.',
      keywords: ['dns', 'spf', 'dmarc', 'dkim', 'txt', 'zone', 'dig', 'email', 'mx', 'record'],
      labels: {
        spf: 'SPF record',
        dmarc: 'DMARC record',
        dkim: 'DKIM record',
        zone: 'DNS records',
      },
    },
    pt: {
      name: 'Registros DNS: SPF, DMARC, DKIM',
      description:
        'Analisa registros SPF, DMARC e DKIM, arquivos de zona e saída do dig: erros, o limite de 10 consultas e políticas fracas.',
      keywords: ['dns', 'spf', 'dmarc', 'dkim', 'txt', 'zona', 'dig', 'email', 'mx', 'registro'],
      labels: {
        spf: 'Registro SPF',
        dmarc: 'Registro DMARC',
        dkim: 'Registro DKIM',
        zone: 'Registros DNS',
      },
    },
  },
  detect: (input) => {
    const kind = detectDns(input);
    return kind ? { label: kind, confidence: kind === 'zone' ? 0.7 : 0.95 } : null;
  },
};
