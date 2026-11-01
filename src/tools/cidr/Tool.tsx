import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale, type MessageKey } from '../../i18n';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import List from '../../ui/List';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import {
  addressType,
  BITS,
  binary,
  CidrError,
  expandIPv6,
  formatCidr,
  formatCount,
  formatIp,
  mappedPeer,
  networkInfo,
  parseInput,
  rangeToCidrs,
  reverseDns,
  subnetCount,
  subnets,
  type Network,
  type Parsed,
} from './logic';

const SAMPLE = '192.168.10.37/22';
const MAX_SUBNETS = 256;

const groupSeparator = (locale: Locale) =>
  new Intl.NumberFormat(locale).formatToParts(1_000_000).find((p) => p.type === 'group')?.value ??
  ' ';

function infoRows(locale: Locale, net: Network): KVRow[] {
  const { family, prefix } = net;
  const info = networkInfo(net);
  const ip = (v: bigint) => formatIp(v, family);
  const count = (n: bigint) => formatCount(n, groupSeparator(locale));
  const row = (key: MessageKey, value: string): KVRow => ({
    key: t(locale, key),
    value,
    copy: value,
  });
  const rows: KVRow[] = [
    row('cidr.network', formatCidr(info.network, prefix, family)),
    row('cidr.range', `${ip(info.network)} – ${ip(info.last)}`),
  ];
  if (family === 4) {
    rows.push(row('cidr.mask', `${ip(info.mask)} (/${prefix})`));
    rows.push(row('cidr.wildcard', ip(info.wildcard)));
    rows.push(row('cidr.broadcast', prefix < 31 ? ip(info.last) : '—'));
  }
  rows.push(row('cidr.hosts', `${ip(info.firstHost)} – ${ip(info.lastHost)}`));
  rows.push(row('cidr.total', count(info.total)));
  rows.push(row('cidr.usable', count(info.usable)));
  rows.push(row('cidr.integer', net.address.toString()));
  rows.push(row('cidr.hex', `0x${net.address.toString(16).padStart(BITS[family] / 4, '0')}`));
  if (family === 4) rows.push(row('cidr.binary', binary(net.address, 4)));
  else rows.push(row('cidr.expanded', expandIPv6(net.address)));
  rows.push(row('cidr.reverse', reverseDns(net.address, family)));
  const peer = mappedPeer(net.address, family);
  if (peer) rows.push(row(family === 4 ? 'cidr.mapped' : 'cidr.embedded', peer));
  return rows;
}

function Subnets({ locale, net }: { locale: Locale; net: Network }) {
  const bits = BITS[net.family];
  const options = Array.from(
    { length: Math.min(16, bits - net.prefix) },
    (_, i) => net.prefix + i + 1,
  );
  const [chosen, setChosen] = useState<number | null>(null);
  const size =
    chosen !== null && options.includes(chosen) ? chosen : options[Math.min(1, options.length - 1)];
  if (size === undefined) return null;
  const list = subnets(net, size, MAX_SUBNETS);
  const total = subnetCount(net, size);
  const sep = groupSeparator(locale);
  return (
    <Pane
      title={t(locale, 'cidr.subnets')}
      actions={
        <label class="fld">
          {t(locale, 'cidr.splitInto')}
          <select value={size} onChange={(e) => setChosen(Number(e.currentTarget.value))}>
            {options.map((p) => (
              <option key={p} value={p}>
                /{p} · {formatCount(subnetCount(net, p), sep)}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <Table
        label={t(locale, 'cidr.subnets')}
        header={['#', t(locale, 'cidr.network'), t(locale, 'cidr.range')]}
        rows={list.map((s, i) => ({
          numbers: [i + 1],
          cells: [
            formatCidr(s.network, size, net.family),
            `${formatIp(s.network, net.family)} – ${formatIp(s.last, net.family)}`,
          ],
        }))}
      />
      {total > BigInt(list.length) && (
        <p class="note">
          {t(locale, 'cidr.showing', { shown: list.length, total: formatCount(total, sep) })}
        </p>
      )}
    </Pane>
  );
}

export default function CidrTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input);

  const parsed = useMemo((): Parsed | CidrError => {
    try {
      return parseInput(src);
    } catch (e) {
      if (!(e instanceof CidrError)) throw e;
      return e;
    }
  }, [src]);

  const ok = parsed instanceof CidrError ? null : parsed;
  const typeOf = (v: bigint, family: 4 | 6) => t(locale, `cidr.type.${addressType(v, family)}`);

  return (
    <>
      <div class="bar">
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:220px"
          placeholder={t(locale, 'cidr.placeholder')}
          aria-label={t(locale, 'cidr.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        {parsed instanceof CidrError && src.trim() && (
          <Pill tone="bad">{t(locale, `cidr.err.${parsed.code}`)}</Pill>
        )}
        {ok && <Pill tone="neu">IPv{ok.family}</Pill>}
        {ok?.kind === 'cidr' && <Pill tone="ok">{typeOf(ok.address, ok.family)}</Pill>}
      </div>
      {ok?.kind === 'cidr' && (
        <>
          <KeyValue locale={locale} rows={infoRows(locale, ok)} />
          <Subnets key={`${ok.family}/${ok.prefix}`} locale={locale} net={ok} />
        </>
      )}
      {ok?.kind === 'range' && (
        <Pane title={t(locale, 'cidr.rangeBlocks')}>
          <List
            locale={locale}
            label={t(locale, 'cidr.rangeBlocks')}
            rows={rangeToCidrs(ok.start, ok.end, ok.family).map((n) => ({
              text: formatCidr(n.address, n.prefix, n.family),
            }))}
          />
        </Pane>
      )}
    </>
  );
}
