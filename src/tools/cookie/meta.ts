import type { ToolMeta } from '../../core/types';
import { detectCookie } from './detect';

export const meta: ToolMeta = {
  id: 'cookie',
  category: 'net',
  order: 5,
  i18n: {
    es: {
      name: 'Analizar cookies',
      description:
        'Lee cabeceras Set-Cookie y Cookie: vencimiento, Secure, HttpOnly, SameSite, prefijos __Host- y problemas de seguridad.',
      keywords: [
        'cookie',
        'set-cookie',
        'samesite',
        'httponly',
        'secure',
        'sesion',
        '__host',
        'expires',
        'max-age',
      ],
      labels: { setCookie: 'Cabecera Set-Cookie', cookie: 'Cabecera Cookie' },
    },
    en: {
      name: 'Cookie analyzer',
      description:
        'Read Set-Cookie and Cookie headers: expiry, Secure, HttpOnly, SameSite, __Host- prefixes and security problems.',
      keywords: [
        'cookie',
        'set-cookie',
        'samesite',
        'httponly',
        'secure',
        'session',
        '__host',
        'expires',
        'max-age',
      ],
      labels: { setCookie: 'Set-Cookie header', cookie: 'Cookie header' },
    },
    pt: {
      name: 'Analisar cookies',
      description:
        'Lê cabeçalhos Set-Cookie e Cookie: validade, Secure, HttpOnly, SameSite, prefixos __Host- e problemas de segurança.',
      keywords: [
        'cookie',
        'set-cookie',
        'samesite',
        'httponly',
        'secure',
        'sessao',
        '__host',
        'expires',
        'max-age',
      ],
      labels: { setCookie: 'Cabeçalho Set-Cookie', cookie: 'Cabeçalho Cookie' },
    },
  },
  detect: (input) => {
    const kind = detectCookie(input);
    return kind ? { label: kind, confidence: 0.85 } : null;
  },
};
