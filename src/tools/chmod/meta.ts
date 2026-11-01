import type { ToolMeta } from '../../core/types';
import { detectChmod } from './detect';

export const meta: ToolMeta = {
  id: 'chmod',
  category: 'web',
  order: 4,
  i18n: {
    es: {
      name: 'chmod / permisos',
      description:
        'Calcula permisos Unix: de octal (755) a simbólico (rwxr-xr-x) y al revés, con setuid, setgid y sticky.',
      keywords: [
        'chmod',
        'permisos',
        'unix',
        'linux',
        'octal',
        'rwx',
        '755',
        '644',
        'umask',
        'archivo',
      ],
      labels: { ls: 'Permisos de ls -l', octal: 'Permisos en octal', command: 'Comando chmod' },
    },
    en: {
      name: 'chmod / permissions',
      description:
        'Work out Unix permissions: from octal (755) to symbolic (rwxr-xr-x) and back, with setuid, setgid and sticky.',
      keywords: [
        'chmod',
        'permissions',
        'unix',
        'linux',
        'octal',
        'rwx',
        '755',
        '644',
        'umask',
        'file',
      ],
      labels: { ls: 'ls -l permissions', octal: 'Octal permissions', command: 'chmod command' },
    },
    pt: {
      name: 'chmod / permissões',
      description:
        'Calcula permissões Unix: de octal (755) para simbólico (rwxr-xr-x) e vice-versa, com setuid, setgid e sticky.',
      keywords: [
        'chmod',
        'permissoes',
        'unix',
        'linux',
        'octal',
        'rwx',
        '755',
        '644',
        'umask',
        'arquivo',
      ],
      labels: { ls: 'Permissões do ls -l', octal: 'Permissões em octal', command: 'Comando chmod' },
    },
  },
  detect: (input) => {
    const kind = detectChmod(input);
    return kind ? { label: kind, confidence: kind === 'octal' ? 0.6 : 0.9 } : null;
  },
};
