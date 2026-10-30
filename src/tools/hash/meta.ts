import type { ToolMeta } from '../../core/types';

export const meta: ToolMeta = {
  id: 'hash',
  category: 'generators',
  order: 2,
  i18n: {
    es: {
      name: 'Hash',
      description: 'MD5, SHA-1, SHA-256, SHA-384 y SHA-512 de texto o de un archivo local.',
      keywords: [
        'hash',
        'md5',
        'sha1',
        'sha256',
        'sha512',
        'checksum',
        'digest',
        'suma',
        'archivo',
        'integridad',
      ],
    },
    en: {
      name: 'Hash',
      description: 'MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or a local file.',
      keywords: [
        'hash',
        'md5',
        'sha1',
        'sha256',
        'sha512',
        'checksum',
        'digest',
        'file',
        'integrity',
      ],
    },
    pt: {
      name: 'Hash',
      description: 'MD5, SHA-1, SHA-256, SHA-384 e SHA-512 de texto ou de um arquivo local.',
      keywords: [
        'hash',
        'md5',
        'sha1',
        'sha256',
        'sha512',
        'checksum',
        'digest',
        'soma',
        'arquivo',
        'integridade',
      ],
    },
  },
  heavy: true,
};
