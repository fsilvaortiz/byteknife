import type { ToolMeta } from '../../core/types';
import { isJwt } from './logic';

export const meta: ToolMeta = {
  id: 'jwt',
  category: 'encoding',
  order: 3,
  i18n: {
    es: {
      name: 'Decodificador JWT',
      description: 'Lee header y payload, interpreta exp/iat/nbf y verifica firmas HS256/384/512.',
      keywords: [
        'jwt',
        'token',
        'jws',
        'bearer',
        'decode',
        'decodificar',
        'verificar',
        'firma',
        'hmac',
        'claims',
      ],
      labels: { jwt: 'JWT' },
    },
    en: {
      name: 'JWT decoder',
      description:
        'Read the header and payload, interpret exp/iat/nbf and verify HS256/384/512 signatures.',
      keywords: [
        'jwt',
        'token',
        'jws',
        'bearer',
        'decode',
        'verify',
        'signature',
        'hmac',
        'claims',
      ],
      labels: { jwt: 'JWT' },
    },
    pt: {
      name: 'Decodificador JWT',
      description:
        'Lê header e payload, interpreta exp/iat/nbf e verifica assinaturas HS256/384/512.',
      keywords: [
        'jwt',
        'token',
        'jws',
        'bearer',
        'decode',
        'decodificar',
        'verificar',
        'assinatura',
        'hmac',
        'claims',
      ],
      labels: { jwt: 'JWT' },
    },
  },
  detect: (input) => (isJwt(input) ? { label: 'jwt', confidence: 0.95 } : null),
};
