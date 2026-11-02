import { describe, expect, it } from 'vitest';
import {
  addressType,
  binary,
  CidrError,
  expandIPv6,
  formatCidr,
  formatCount,
  formatIPv4,
  formatIPv6,
  isIpOrCidr,
  mappedPeer,
  maskToPrefix,
  networkInfo,
  parseInput,
  parseIPv4,
  parseIPv6,
  rangeToCidrs,
  reverseDns,
  subnetCount,
  subnets,
  type Network,
} from './logic';

const cidr = (s: string) => {
  const p = parseInput(s);
  if (p.kind !== 'cidr') throw new Error('se esperaba CIDR');
  return p as Network;
};
const v4 = (s: string) => parseIPv4(s)!;
const v6 = (s: string) => parseIPv6(s)!;
const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof CidrError) return e.code;
    throw e;
  }
  return null;
};

describe('parseIPv4', () => {
  it('lee direcciones válidas', () => {
    expect(v4('192.168.1.10')).toBe(0xc0a8010an);
    expect(v4('0.0.0.0')).toBe(0n);
    expect(v4('255.255.255.255')).toBe(0xffffffffn);
  });

  it.each(['256.1.1.1', '1.2.3', '01.2.3.4', '1.2.3.4.5', 'a.b.c.d', ''])('rechaza %s', (s) => {
    expect(parseIPv4(s)).toBeNull();
  });
});

describe('parseIPv6', () => {
  it.each([
    ['::', 0n],
    ['::1', 1n],
    ['2001:db8::', 0x20010db8n << 96n],
    ['2001:DB8:0:0:0:0:0:1', (0x20010db8n << 96n) | 1n],
    ['fe80::1:2', (0xfe80n << 112n) | 0x10002n],
    ['::ffff:192.0.2.1', 0xffffc0000201n],
    ['64:ff9b::192.0.2.33', (0x64ff9bn << 96n) | 0xc0000221n],
    ['1:2:3:4:5:6:7::', 0x00010002000300040005000600070000n],
  ])('%s', (s, n) => {
    expect(parseIPv6(s)).toBe(n);
  });

  it.each([
    '1::2::3',
    '1:2:3:4:5:6:7:8:9',
    '1:2:3',
    '12345::',
    'g::1',
    ':1:2:3:4:5:6:7',
    '1:2:3:4:5:6:7:8::',
  ])('rechaza %s', (s) => {
    expect(parseIPv6(s)).toBeNull();
  });
});

describe('formato', () => {
  it('IPv6 canónica (RFC 5952)', () => {
    expect(formatIPv6(v6('2001:0db8:0000:0000:0000:0000:0000:0001'))).toBe('2001:db8::1');
    expect(formatIPv6(0n)).toBe('::');
    expect(formatIPv6(1n)).toBe('::1');
    // Racha más larga; con empate, la primera. Un solo grupo en cero no se abrevia.
    expect(formatIPv6(v6('2001:0:0:1:0:0:0:1'))).toBe('2001:0:0:1::1');
    expect(formatIPv6(v6('2001:db8:0:1:1:1:1:1'))).toBe('2001:db8:0:1:1:1:1:1');
    expect(formatIPv6(v6('1:0:0:2:0:0:3:4'))).toBe('1::2:0:0:3:4');
    expect(formatIPv6(v6('1:2:3:4:5:6:7:8'))).toBe('1:2:3:4:5:6:7:8');
  });

  it('IPv6 expandida, binario y DNS inverso', () => {
    expect(expandIPv6(v6('2001:db8::1'))).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    expect(binary(v4('192.168.1.10'), 4)).toBe('11000000.10101000.00000001.00001010');
    expect(binary(1n, 6)).toMatch(/^(0{16}:){7}0{15}1$/);
    expect(reverseDns(v4('192.0.2.5'), 4)).toBe('5.2.0.192.in-addr.arpa');
    expect(reverseDns(v6('2001:db8::1'), 6)).toBe(
      '1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa',
    );
  });

  it('IPv4 mapeada en IPv6 en ambos sentidos', () => {
    expect(mappedPeer(v4('192.0.2.1'), 4)).toBe('::ffff:192.0.2.1');
    expect(mappedPeer(v6('::ffff:c000:201'), 6)).toBe('192.0.2.1');
    expect(mappedPeer(v6('2001:db8::1'), 6)).toBeNull();
  });

  it('cantidades con separador y potencias de 2', () => {
    expect(formatCount(16777214n, '.')).toBe('16.777.214');
    expect(formatCount(254n, ',')).toBe('254');
    expect(formatCount(1n << 96n, '.')).toBe('2^96');
  });
});

describe('parseInput', () => {
  it('CIDR, dirección sola y máscara', () => {
    expect(cidr('10.1.2.3/8')).toEqual({
      kind: 'cidr',
      family: 4,
      address: v4('10.1.2.3'),
      prefix: 8,
    });
    expect(cidr(' 192.168.1.1 ').prefix).toBe(32);
    expect(cidr('192.168.1.1/255.255.240.0').prefix).toBe(20);
    expect(cidr('192.168.1.1 255.255.255.0').prefix).toBe(24);
    expect(cidr('0.0.0.0/0.0.0.0').prefix).toBe(0);
    expect(cidr('2001:db8::/32')).toMatchObject({ family: 6, prefix: 32 });
    expect(cidr('::1').prefix).toBe(128);
  });

  it('rangos con guion o espacio', () => {
    expect(parseInput('10.0.0.1 - 10.0.0.9')).toEqual({
      kind: 'range',
      family: 4,
      start: v4('10.0.0.1'),
      end: v4('10.0.0.9'),
    });
    expect(parseInput('10.0.0.1–10.0.0.9').kind).toBe('range');
    expect(parseInput('2001:db8::1 2001:db8::ff').kind).toBe('range');
  });

  it.each([
    ['hola', 'invalid'],
    ['10.0.0.0/33', 'prefix'],
    ['2001:db8::/129', 'prefix'],
    ['10.0.0.0/x', 'prefix'],
    ['2001:db8::/255.0.0.0', 'prefix'],
    ['10.0.0.0/255.0.255.0', 'mask'],
    ['10.0.0.0/1/2', 'invalid'],
    ['10.0.0.1 - ::1', 'mixed'],
    ['10.0.0.9 - 10.0.0.1', 'order'],
  ])('%s → %s', (s, c) => {
    expect(code(() => parseInput(s))).toBe(c);
  });

  it('maskToPrefix rechaza máscaras con huecos', () => {
    expect(maskToPrefix(0xffffff00n, 4)).toBe(24);
    expect(code(() => maskToPrefix(0x00ffffffn, 4))).toBe('mask');
  });
});

describe('networkInfo', () => {
  it('IPv4 /24', () => {
    const n = networkInfo(cidr('192.168.1.130/24'));
    expect(formatIPv4(n.network)).toBe('192.168.1.0');
    expect(formatIPv4(n.last)).toBe('192.168.1.255');
    expect(formatIPv4(n.mask)).toBe('255.255.255.0');
    expect(formatIPv4(n.wildcard)).toBe('0.0.0.255');
    expect(formatIPv4(n.firstHost)).toBe('192.168.1.1');
    expect(formatIPv4(n.lastHost)).toBe('192.168.1.254');
    expect(n.total).toBe(256n);
    expect(n.usable).toBe(254n);
  });

  it('IPv4 /31 y /32 no reservan red ni broadcast', () => {
    expect(networkInfo(cidr('10.0.0.0/31')).usable).toBe(2n);
    const one = networkInfo(cidr('10.0.0.7/32'));
    expect(one.usable).toBe(1n);
    expect(one.firstHost).toBe(one.lastHost);
  });

  it('IPv4 /0', () => {
    expect(networkInfo(cidr('1.2.3.4/0')).total).toBe(1n << 32n);
  });

  it('IPv6 usa todas las direcciones', () => {
    const n = networkInfo(cidr('2001:db8:abcd:12::5/64'));
    expect(formatIPv6(n.network)).toBe('2001:db8:abcd:12::');
    expect(formatIPv6(n.last)).toBe('2001:db8:abcd:12:ffff:ffff:ffff:ffff');
    expect(n.usable).toBe(1n << 64n);
  });
});

describe('addressType', () => {
  it.each([
    ['8.8.8.8', 'public'],
    ['10.20.30.40', 'private'],
    ['172.31.255.255', 'private'],
    ['172.32.0.1', 'public'],
    ['192.168.0.1', 'private'],
    ['100.64.0.1', 'cgnat'],
    ['127.0.0.1', 'loopback'],
    ['169.254.10.1', 'linkLocal'],
    ['192.0.2.1', 'documentation'],
    ['198.51.100.1', 'documentation'],
    ['203.0.113.1', 'documentation'],
    ['198.19.0.1', 'benchmark'],
    ['224.0.0.251', 'multicast'],
    ['240.0.0.1', 'reserved'],
    ['255.255.255.255', 'broadcast'],
    ['0.0.0.0', 'unspecified'],
    ['0.1.2.3', 'thisNetwork'],
  ])('IPv4 %s → %s', (s, type) => {
    expect(addressType(v4(s), 4)).toBe(type);
  });

  it.each([
    ['::', 'unspecified'],
    ['::1', 'loopback'],
    ['::ffff:10.0.0.1', 'ipv4Mapped'],
    ['64:ff9b::1', 'nat64'],
    ['2001::1', 'teredo'],
    ['2001:db8::1', 'documentation'],
    ['2002:c000:201::1', 'sixToFour'],
    ['2606:4700::1111', 'public'],
    ['fd12:3456::1', 'uniqueLocal'],
    ['fe80::1', 'linkLocal'],
    ['ff02::1', 'multicast'],
    ['4000::1', 'reserved'],
  ])('IPv6 %s → %s', (s, type) => {
    expect(addressType(v6(s), 6)).toBe(type);
  });
});

describe('subredes', () => {
  it('divide una /24 en /26', () => {
    const net = cidr('192.168.1.0/24');
    const list = subnets(net, 26);
    expect(list.map((s) => formatCidr(s.network, 26, 4))).toEqual([
      '192.168.1.0/26',
      '192.168.1.64/26',
      '192.168.1.128/26',
      '192.168.1.192/26',
    ]);
    expect(formatIPv4(list[1]!.last)).toBe('192.168.1.127');
    expect(subnetCount(net, 26)).toBe(4n);
  });

  it('respeta el límite y rechaza prefijos fuera de rango', () => {
    const net = cidr('10.0.0.0/8');
    expect(subnets(net, 24, 10)).toHaveLength(10);
    expect(subnetCount(net, 24)).toBe(65536n);
    expect(subnets(net, 7)).toEqual([]);
    expect(subnets(net, 33)).toEqual([]);
  });
});

describe('rangeToCidrs', () => {
  const show = (a: string, b: string, family: 4 | 6 = 4) => {
    const parse = family === 4 ? v4 : v6;
    return rangeToCidrs(parse(a), parse(b), family).map((n) =>
      formatCidr(n.address, n.prefix, family),
    );
  };

  it('rango alineado → un bloque', () => {
    expect(show('10.0.0.0', '10.0.0.255')).toEqual(['10.0.0.0/24']);
    expect(show('0.0.0.0', '255.255.255.255')).toEqual(['0.0.0.0/0']);
  });

  it('rango desalineado → bloques mínimos', () => {
    expect(show('10.0.0.1', '10.0.0.9')).toEqual([
      '10.0.0.1/32',
      '10.0.0.2/31',
      '10.0.0.4/30',
      '10.0.0.8/31',
    ]);
  });

  it('una sola dirección y rangos IPv6', () => {
    expect(show('10.0.0.5', '10.0.0.5')).toEqual(['10.0.0.5/32']);
    expect(show('2001:db8::', '2001:db8::ff', 6)).toEqual(['2001:db8::/120']);
  });
});

describe('isIpOrCidr', () => {
  it.each(['192.168.1.1', '10.0.0.0/8', '2001:db8::/32', '::1', 'fe80::1/64'])('%s sí', (s) => {
    expect(isIpOrCidr(s)).toBe(true);
  });

  it.each(['1.2.3', '10.0.0.0/33', '::1/129', '10.0.0.0/8/1', '/24', '12:30:45', '1.2.3.4/x'])(
    '%s no',
    (s) => {
      expect(isIpOrCidr(s)).toBe(false);
    },
  );
});
