import { LS_MODE } from './detect';

export { detectChmod } from './detect';

export const CLASSES = ['user', 'group', 'other'] as const;
export type PermClass = (typeof CLASSES)[number];

export interface Mode {
  /** Bits especiales: 4 setuid, 2 setgid, 1 sticky. */
  special: number;
  user: number;
  group: number;
  other: number;
}

export class ChmodError extends Error {
  constructor() {
    super('invalid');
    this.name = 'ChmodError';
  }
}

const READ = 4;
const WRITE = 2;
const EXEC = 1;

function fromLs(s: string): Mode {
  const bits = s.replace(/^[-dlcbps](?=.{9})/, '').slice(0, 9);
  const triad = (t: string, specialChar: RegExp) => ({
    perm: (t[0] === 'r' ? READ : 0) | (t[1] === 'w' ? WRITE : 0) | (/[xst]/.test(t[2]!) ? EXEC : 0),
    special: specialChar.test(t[2]!),
  });
  const u = triad(bits.slice(0, 3), /[sS]/);
  const g = triad(bits.slice(3, 6), /[sS]/);
  const o = triad(bits.slice(6, 9), /[tT]/);
  return {
    special: (u.special ? 4 : 0) | (g.special ? 2 : 0) | (o.special ? 1 : 0),
    user: u.perm,
    group: g.perm,
    other: o.perm,
  };
}

function fromOctal(s: string): Mode {
  const digits = s.replace(/^0+(?=[0-7]{3,4}$)/, '').padStart(4, '0');
  const [special, user, group, other] = [...digits].map(Number) as [number, number, number, number];
  return { special, user, group, other };
}

/**
 * Lee 755, 0644, 4755, rwxr-xr-x, -rw-r--r--@ o un comando «chmod 750 archivo».
 * Los modos simbólicos relativos (u+x) se aplican sobre `base`.
 */
export function parseMode(input: string, base: Mode = fromOctal('644')): Mode {
  let s = input.trim();
  const cmd = s.match(/^chmod\s+(?:-\w+\s+)*(\S+)/);
  if (cmd) s = cmd[1]!;
  if (/^[0-7]{3,5}$/.test(s) && s.replace(/^0+/, '').length <= 4) return fromOctal(s);
  if (LS_MODE.test(s) && s.length >= 9) return fromLs(s);
  if (/^[ugoa]*[+=-][rwxXst]*(?:,[ugoa]*[+=-][rwxXst]*)*$/.test(s)) return applySymbolic(s, base);
  throw new ChmodError();
}

/** Aplica cláusulas simbólicas como u+x,g-w,o= (sin «a» ni clase equivale a «a»). */
export function applySymbolic(expr: string, base: Mode): Mode {
  const m = { ...base };
  for (const clause of expr.split(',')) {
    const [, who = '', op, perms = ''] = clause.match(/^([ugoa]*)([+=-])([rwxXst]*)$/)!;
    const targets: PermClass[] =
      !who || who.includes('a') ? [...CLASSES] : CLASSES.filter((c) => who.includes(c[0]!));
    const bits =
      (perms.includes('r') ? READ : 0) |
      (perms.includes('w') ? WRITE : 0) |
      // X: ejecución solo si ya hay algún bit x (en un archivo; en directorios siempre).
      (perms.includes('x') || (perms.includes('X') && (m.user | m.group | m.other) & EXEC)
        ? EXEC
        : 0);
    let special = 0;
    if (perms.includes('s')) {
      if (targets.includes('user')) special |= 4;
      if (targets.includes('group')) special |= 2;
    }
    if (perms.includes('t')) special |= 1;
    for (const c of targets) {
      if (op === '+') m[c] |= bits;
      else if (op === '-') m[c] &= ~bits;
      else m[c] = bits;
    }
    if (op === '+') m.special |= special;
    else if (op === '-') m.special &= ~special;
    else {
      const owned =
        (targets.includes('user') ? 4 : 0) |
        (targets.includes('group') ? 2 : 0) |
        (targets.includes('other') ? 1 : 0);
      m.special = (m.special & ~owned) | special;
    }
  }
  return m;
}

export const toOctal = (m: Mode) => `${m.special ? m.special : ''}${m.user}${m.group}${m.other}`;

export function toSymbolic(m: Mode): string {
  const triad = (p: number, special: boolean, on: string, off: string) =>
    (p & READ ? 'r' : '-') +
    (p & WRITE ? 'w' : '-') +
    (special ? (p & EXEC ? on : off) : p & EXEC ? 'x' : '-');
  return (
    triad(m.user, (m.special & 4) > 0, 's', 'S') +
    triad(m.group, (m.special & 2) > 0, 's', 'S') +
    triad(m.other, (m.special & 1) > 0, 't', 'T')
  );
}

/** Forma simbólica absoluta para chmod: u=rwx,g=rx,o=. */
export function toChmodSymbolic(m: Mode): string {
  const letters = (p: number) =>
    (p & READ ? 'r' : '') + (p & WRITE ? 'w' : '') + (p & EXEC ? 'x' : '');
  const parts = [
    `u=${letters(m.user)}${m.special & 4 ? 's' : ''}`,
    `g=${letters(m.group)}${m.special & 2 ? 's' : ''}`,
    `o=${letters(m.other)}${m.special & 1 ? 't' : ''}`,
  ];
  return parts.join(',');
}

export type Perm = 'read' | 'write' | 'exec';

export const permsOf = (p: number): Perm[] =>
  (['read', 'write', 'exec'] as const).filter((_, i) => p & (4 >> i));

/** Avisos sobre modos peligrosos: escritura para todos o setuid. */
export function warnings(m: Mode): ('worldWritable' | 'setuid' | 'setgid')[] {
  const out: ('worldWritable' | 'setuid' | 'setgid')[] = [];
  if (m.other & WRITE && !(m.special & 1)) out.push('worldWritable');
  if (m.special & 4) out.push('setuid');
  if (m.special & 2) out.push('setgid');
  return out;
}
