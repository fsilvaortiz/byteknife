import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'keypair',
  category: 'generators',
  order: 4,
  i18n: {
    es: {
      name: 'Par de claves',
      description:
        'Genera claves pública y privada Ed25519, ECDSA o RSA en PEM, JWK y OpenSSH, sin que salgan del navegador.',
      keywords: [
        'clave',
        'privada',
        'publica',
        'keypair',
        'ssh',
        'ssh-keygen',
        'ed25519',
        'rsa',
        'ecdsa',
        'pem',
        'jwk',
        'generar',
      ],
    },
    en: {
      name: 'Key pair',
      description:
        'Generate Ed25519, ECDSA or RSA public and private keys as PEM, JWK and OpenSSH, without leaving the browser.',
      keywords: [
        'key',
        'private',
        'public',
        'keypair',
        'ssh',
        'ssh-keygen',
        'ed25519',
        'rsa',
        'ecdsa',
        'pem',
        'jwk',
        'generate',
      ],
    },
    pt: {
      name: 'Par de chaves',
      description:
        'Gere chaves pública e privada Ed25519, ECDSA ou RSA em PEM, JWK e OpenSSH, sem sair do navegador.',
      keywords: [
        'chave',
        'privada',
        'publica',
        'keypair',
        'ssh',
        'ssh-keygen',
        'ed25519',
        'rsa',
        'ecdsa',
        'pem',
        'jwk',
        'gerar',
      ],
    },
  },
};
