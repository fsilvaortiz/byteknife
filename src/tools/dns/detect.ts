// Detección para el home y la búsqueda. Va aparte de logic.ts para que el registro, que
// carga todas las páginas, no arrastre la lógica completa de la herramienta.

export type DnsKind = 'spf' | 'dmarc' | 'dkim' | 'zone';

const RECORD = /\s(?:IN\s+)?(?:A|AAAA|CNAME|MX|NS|TXT|SOA|SRV|CAA|PTR)\s+\S/;

export function detectDns(input: string): DnsKind | null {
  const s = input.trim().replace(/^"|"$/g, '');
  if (/^v=spf1(\s|$)/i.test(s)) return 'spf';
  if (/^v=DMARC1\s*;/i.test(s)) return 'dmarc';
  if (/^v=DKIM1\s*;/i.test(s) || /^k=(rsa|ed25519)\s*;.*\bp=/i.test(s)) return 'dkim';
  const lines = s.split('\n').filter((l) => l.trim() && !/^\s*;/.test(l));
  if (
    lines.length &&
    lines.filter((l) => RECORD.test(` ${l}`)).length >= Math.ceil(lines.length / 2)
  )
    return 'zone';
  return null;
}
