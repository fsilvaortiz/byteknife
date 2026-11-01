import type { ToolMeta } from '../../core/types';
import { looksLikeCsp } from './detect';

export const meta: ToolMeta = {
  id: 'csp',
  category: 'net',
  order: 4,
  i18n: {
    es: {
      name: 'Analizar CSP',
      description:
        'Revisa una Content-Security-Policy: unsafe-inline, unsafe-eval, comodines, object-src, base-uri y frame-ancestors.',
      keywords: [
        'csp',
        'content-security-policy',
        'seguridad',
        'xss',
        'nonce',
        'unsafe-inline',
        'headers',
        'politica',
      ],
      labels: { csp: 'Content-Security-Policy' },
    },
    en: {
      name: 'CSP analyzer',
      description:
        'Review a Content-Security-Policy: unsafe-inline, unsafe-eval, wildcards, object-src, base-uri and frame-ancestors.',
      keywords: [
        'csp',
        'content-security-policy',
        'security',
        'xss',
        'nonce',
        'unsafe-inline',
        'headers',
        'policy',
      ],
      labels: { csp: 'Content-Security-Policy' },
    },
    pt: {
      name: 'Analisar CSP',
      description:
        'Revisa uma Content-Security-Policy: unsafe-inline, unsafe-eval, curingas, object-src, base-uri e frame-ancestors.',
      keywords: [
        'csp',
        'content-security-policy',
        'seguranca',
        'xss',
        'nonce',
        'unsafe-inline',
        'headers',
        'politica',
      ],
      labels: { csp: 'Content-Security-Policy' },
    },
  },
  detect: (input) => (looksLikeCsp(input) ? { label: 'csp', confidence: 0.85 } : null),
};
