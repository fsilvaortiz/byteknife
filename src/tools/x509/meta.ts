import type { ToolMeta } from '../../core/types';
import { pemKind } from './detect';

export const meta: ToolMeta = {
  id: 'x509',
  category: 'net',
  order: 2,
  i18n: {
    es: {
      name: 'Certificados X.509',
      description:
        'Decodifica certificados y CSR en PEM: sujeto, emisor, vigencia, SAN, usos de clave, extensiones y huellas.',
      keywords: [
        'x509',
        'certificado',
        'ssl',
        'tls',
        'pem',
        'csr',
        'san',
        'openssl',
        'decodificar',
        'huella',
        'https',
      ],
      labels: { cert: 'Certificado X.509', csr: 'CSR (solicitud de certificado)' },
    },
    en: {
      name: 'X.509 certificates',
      description:
        'Decode PEM certificates and CSRs: subject, issuer, validity, SAN, key usage, extensions and fingerprints.',
      keywords: [
        'x509',
        'certificate',
        'ssl',
        'tls',
        'pem',
        'csr',
        'san',
        'openssl',
        'decode',
        'fingerprint',
        'https',
      ],
      labels: { cert: 'X.509 certificate', csr: 'CSR (certificate signing request)' },
    },
    pt: {
      name: 'Certificados X.509',
      description:
        'Decodifica certificados e CSRs em PEM: sujeito, emissor, validade, SAN, usos da chave, extensões e impressões digitais.',
      keywords: [
        'x509',
        'certificado',
        'ssl',
        'tls',
        'pem',
        'csr',
        'san',
        'openssl',
        'decodificar',
        'impressao',
        'https',
      ],
      labels: { cert: 'Certificado X.509', csr: 'CSR (solicitação de certificado)' },
    },
  },
  detect: (input) => {
    const kind = pemKind(input);
    return kind ? { label: kind, confidence: 0.95 } : null;
  },
};
