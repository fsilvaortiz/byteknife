import { describe, expect, it } from 'vitest';
import {
  applySymbolic,
  ChmodError,
  detectChmod,
  parseMode,
  permsOf,
  toChmodSymbolic,
  toOctal,
  toSymbolic,
  warnings,
  type Mode,
} from './logic';

const mode = (special: number, user: number, group: number, other: number): Mode => ({
  special,
  user,
  group,
  other,
});

describe('parseMode', () => {
  it.each([
    ['755', mode(0, 7, 5, 5)],
    ['0644', mode(0, 6, 4, 4)],
    ['00600', mode(0, 6, 0, 0)],
    ['4755', mode(4, 7, 5, 5)],
    ['1777', mode(1, 7, 7, 7)],
    ['rwxr-xr-x', mode(0, 7, 5, 5)],
    ['-rw-r--r--', mode(0, 6, 4, 4)],
    ['-rw-r--r--@', mode(0, 6, 4, 4)],
    ['drwxrwxrwt', mode(1, 7, 7, 7)],
    ['-rwsr-xr-x.', mode(4, 7, 5, 5)],
    ['-rwSr-Sr-T', mode(7, 6, 4, 4)],
    ['chmod 750 deploy.sh', mode(0, 7, 5, 0)],
    ['chmod -R u=rwx,go= dir/', mode(0, 7, 0, 0)],
  ])('%s', (s, m) => {
    expect(parseMode(s)).toEqual(m);
  });

  it.each(['', '8', '75', '7777777', '0x755', 'rwx', 'hola', 'u+q'])('rechaza %j', (s) => {
    expect(() => parseMode(s)).toThrow(ChmodError);
  });
});

describe('applySymbolic', () => {
  const base = mode(0, 6, 4, 4);
  it.each([
    ['u+x', mode(0, 7, 4, 4)],
    ['+x', mode(0, 7, 5, 5)],
    ['a-r', mode(0, 2, 0, 0)],
    ['go-r,u+x', mode(0, 7, 0, 0)],
    ['g=rw', mode(0, 6, 6, 4)],
    ['o=', mode(0, 6, 4, 0)],
    ['u+s', mode(4, 6, 4, 4)],
    ['g+s', mode(2, 6, 4, 4)],
    ['+t', mode(1, 6, 4, 4)],
    ['u=rwx,g=rxs', mode(2, 7, 5, 4)],
    ['a+X', mode(0, 6, 4, 4)],
  ])('%s', (expr, m) => {
    expect(applySymbolic(expr, base)).toEqual(m);
  });

  it('X agrega ejecución solo si ya había alguna', () => {
    expect(applySymbolic('a+X', mode(0, 7, 4, 4))).toEqual(mode(0, 7, 5, 5));
  });

  it('quita bits especiales', () => {
    expect(applySymbolic('u-s', mode(6, 7, 5, 5))).toEqual(mode(2, 7, 5, 5));
    expect(applySymbolic('u=rwx', mode(6, 7, 5, 5))).toEqual(mode(2, 7, 5, 5));
  });

  it('parseMode usa el modo base para los relativos', () => {
    expect(parseMode('u+x', mode(0, 6, 0, 0))).toEqual(mode(0, 7, 0, 0));
  });
});

describe('formatos', () => {
  it.each([
    [mode(0, 7, 5, 5), '755', 'rwxr-xr-x', 'u=rwx,g=rx,o=rx'],
    [mode(0, 6, 0, 0), '600', 'rw-------', 'u=rw,g=,o='],
    [mode(4, 7, 5, 5), '4755', 'rwsr-xr-x', 'u=rwxs,g=rx,o=rx'],
    [mode(2, 7, 7, 5), '2775', 'rwxrwsr-x', 'u=rwx,g=rwxs,o=rx'],
    [mode(1, 7, 7, 7), '1777', 'rwxrwxrwt', 'u=rwx,g=rwx,o=rwxt'],
    [mode(7, 6, 6, 6), '7666', 'rwSrwSrwT', 'u=rws,g=rws,o=rwt'],
  ])('%o', (m, octal, sym, cmd) => {
    expect(toOctal(m)).toBe(octal);
    expect(toSymbolic(m)).toBe(sym);
    expect(toChmodSymbolic(m)).toBe(cmd);
  });

  it('permsOf', () => {
    expect(permsOf(7)).toEqual(['read', 'write', 'exec']);
    expect(permsOf(5)).toEqual(['read', 'exec']);
    expect(permsOf(0)).toEqual([]);
  });

  it('warnings', () => {
    expect(warnings(mode(0, 7, 7, 7))).toEqual(['worldWritable']);
    expect(warnings(mode(1, 7, 7, 7))).toEqual([]);
    expect(warnings(mode(6, 7, 5, 5))).toEqual(['setuid', 'setgid']);
    expect(warnings(mode(0, 6, 4, 4))).toEqual([]);
  });
});

describe('detectChmod', () => {
  it.each([
    ['-rwxr-xr-x', 'ls'],
    ['drwxr-x---', 'ls'],
    ['rw-r--r--', 'ls'],
    ['0755', 'octal'],
    ['chmod 600 ~/.ssh/id_ed25519', 'command'],
    ['chmod -R u+x bin', 'command'],
  ])('%s → %s', (s, kind) => {
    expect(detectChmod(s)).toBe(kind);
  });

  it.each(['755', '12345', 'rwx', 'chmod', 'hola'])('%s → null', (s) => {
    expect(detectChmod(s)).toBeNull();
  });
});
