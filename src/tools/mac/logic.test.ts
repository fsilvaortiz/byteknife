import { describe, expect, it } from 'vitest';
import { ouiText } from '../../../integrations/oui-data.mjs';
import {
  eui64,
  formats,
  info,
  linkLocal,
  looksLikeMac,
  MacError,
  parseMac,
  parseOui,
  vendor,
} from './logic';

const MAC = parseMac('3C:22:FB:12:34:56');

describe('parseMac', () => {
  it.each([
    '3c:22:fb:12:34:56',
    '3C-22-FB-12-34-56',
    '3c22.fb12.3456',
    '3C22FB123456',
    '  3c:22:fb:12:34:56 ',
  ])('%s', (s) => {
    expect(parseMac(s)).toEqual([0x3c, 0x22, 0xfb, 0x12, 0x34, 0x56]);
  });

  it.each(['3c:22:fb:12:34', '3c:22-fb:12:34:56', 'zz:22:fb:12:34:56', '3c22fb12345', ''])(
    'rechaza %j',
    (s) => {
      expect(() => parseMac(s)).toThrow(MacError);
    },
  );
});

describe('formatos e información', () => {
  it('formatos', () => {
    expect(formats(MAC)).toEqual({
      colon: '3c:22:fb:12:34:56',
      colonUpper: '3C:22:FB:12:34:56',
      hyphen: '3C-22-FB-12-34-56',
      cisco: '3c22.fb12.3456',
      bare: '3c22fb123456',
    });
  });

  it('bits I/G y U/L, broadcast y cero', () => {
    expect(info(MAC)).toEqual({ multicast: false, local: false, broadcast: false, zero: false });
    expect(info(parseMac('01:00:5e:00:00:fb')).multicast).toBe(true);
    expect(info(parseMac('da:a1:19:00:00:01')).local).toBe(true);
    expect(info(parseMac('ff:ff:ff:ff:ff:ff'))).toMatchObject({ broadcast: true, multicast: true });
    expect(info(parseMac('00:00:00:00:00:00')).zero).toBe(true);
  });

  it('EUI-64 y link-local (RFC 4291)', () => {
    expect(eui64(MAC)).toBe('3e:22:fb:ff:fe:12:34:56');
    expect(linkLocal(MAC)).toBe('fe80::3e22:fbff:fe12:3456');
    expect(linkLocal(parseMac('00:00:00:00:00:01'))).toBe('fe80::200:ff:fe00:1');
  });
});

describe('fabricante', () => {
  const table = parseOui(
    '3C22FB\tApple, Inc.\n70B3D5\tIEEE Registration Authority\n70B3D5123\tAcme MA-S\n0050C2F\tAcme MA-M\nmal',
  );

  it('prefijo más largo primero', () => {
    expect(vendor(MAC, table)).toBe('Apple, Inc.');
    expect(vendor(parseMac('70:b3:d5:12:3f:ff'), table)).toBe('Acme MA-S');
    expect(vendor(parseMac('70:b3:d5:99:00:00'), table)).toBe('IEEE Registration Authority');
    expect(vendor(parseMac('00:50:c2:f1:00:00'), table)).toBe('Acme MA-M');
    expect(vendor(parseMac('02:00:00:00:00:00'), table)).toBeNull();
  });

  it('la base real se genera y resuelve un fabricante conocido', () => {
    const real = parseOui(ouiText());
    expect(real.size).toBeGreaterThan(40000);
    expect(vendor(parseMac('00:00:0c:00:00:00'), real)).toMatch(/Cisco/i);
  });
});

describe('looksLikeMac', () => {
  it.each(['aa:bb:cc:dd:ee:ff', 'AA-BB-CC-DD-EE-FF', 'aabb.ccdd.eeff'])('sí: %s', (s) => {
    expect(looksLikeMac(s)).toBe(true);
  });
  it.each(['aabbccddeeff', '12:30:45', 'hola'])('no: %s', (s) => {
    expect(looksLikeMac(s)).toBe(false);
  });
});
