import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale, type MessageKey } from '../../i18n';
import KeyValue from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill, { type Tone } from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import {
  analyzeDkim,
  analyzeDmarc,
  detectDns,
  parseSpf,
  parseTags,
  parseZone,
  zoneFindings,
  type Finding,
  type Level,
} from './logic';

const SAMPLE = 'v=spf1 ip4:203.0.113.0/24 include:_spf.google.com include:sendgrid.net mx ~all';

const TONE: Record<Level, Tone> = { ok: 'ok', warn: 'warn', bad: 'bad', info: 'neu' };
const MARK: Record<Level, string> = { ok: '✓', warn: '!', bad: '✗', info: 'i' };
const KNOWN_TAGS = {
  dmarc: new Set(['v', 'p', 'sp', 'rua', 'ruf', 'pct', 'adkim', 'aspf', 'fo', 'ri']),
  dkim: new Set(['v', 'k', 'p', 't', 'h', 's', 'n']),
};

function Findings({ locale, list }: { locale: Locale; list: Finding[] }) {
  if (!list.length) return null;
  return (
    <Pane title={t(locale, 'hdr.audit')}>
      <Table
        label={t(locale, 'hdr.audit')}
        rows={list.map((f) => ({
          cells: [
            <Pill key="l" tone={TONE[f.level]}>
              {MARK[f.level]}
            </Pill>,
            t(locale, `dns.f.${f.key}` as MessageKey, f.params),
          ],
        }))}
      />
    </Pane>
  );
}

function Tags({
  locale,
  record,
  kind,
}: {
  locale: Locale;
  record: string;
  kind: 'dmarc' | 'dkim';
}) {
  const tags = parseTags(record);
  const findings = kind === 'dmarc' ? analyzeDmarc(tags) : analyzeDkim(tags);
  return (
    <>
      <Findings locale={locale} list={findings} />
      <KeyValue
        locale={locale}
        rows={tags.map(([k, v]) => ({
          key: KNOWN_TAGS[kind].has(k)
            ? `${k} · ${t(locale, `dns.tag.${kind}.${k}` as MessageKey)}`
            : k,
          value: v.length > 80 ? `${v.slice(0, 77)}…` : v || '—',
          copy: v,
          mono: true,
        }))}
      />
    </>
  );
}

export default function DnsTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input, 150);
  const kind = useMemo(() => detectDns(src), [src]);

  let body = null;
  if (kind === 'spf') {
    const { terms, findings } = parseSpf(src);
    body = (
      <>
        <Findings locale={locale} list={findings} />
        <Table
          label={t(locale, 'dns.terms')}
          header={[
            t(locale, 'dns.result'),
            t(locale, 'dns.mechanism'),
            t(locale, 'hdr.value'),
            t(locale, 'dns.lookup'),
          ]}
          rows={terms.map((x) => ({
            cells: [
              t(
                locale,
                `dns.q.${x.qualifier === '+' ? 'pass' : x.qualifier === '-' ? 'fail' : x.qualifier === '~' ? 'softfail' : 'neutral'}`,
              ),
              x.mechanism,
              x.value || '—',
              x.lookup ? '1' : '',
            ],
          }))}
        />
      </>
    );
  } else if (kind === 'dmarc' || kind === 'dkim') {
    body = <Tags locale={locale} record={src} kind={kind} />;
  } else if (kind === 'zone') {
    const records = parseZone(src);
    body = (
      <>
        <Findings locale={locale} list={zoneFindings(records)} />
        <Table
          label={t(locale, 'dns.records')}
          header={[t(locale, 'http.name'), 'TTL', t(locale, 'dns.type'), t(locale, 'dns.data')]}
          rows={records.map((r) => ({ cells: [r.name, r.ttl, r.type, r.data] }))}
        />
      </>
    );
  }

  return (
    <>
      <Pane
        title={t(locale, 'dns.input')}
        actions={kind && <Pill tone="neu">{t(locale, `dns.kind.${kind}`)}</Pill>}
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:120px"
          aria-label={t(locale, 'dns.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      {body ?? (src.trim() && <p class="note">{t(locale, 'dns.unknown')}</p>)}
    </>
  );
}
