import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale, type MessageKey } from '../../i18n';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { EC_PEM } from './fixtures';
import {
  commonName,
  decodeAll,
  EXT_OIDS,
  fingerprints,
  formatName,
  validity,
  X509Error,
  type Decoded,
  type Fingerprints,
} from './logic';

type KnownExt = `x509.ext.${string}` & MessageKey;
const KNOWN_EXTS = new Set(Object.values(EXT_OIDS));

const iso = (d: Date) => d.toISOString().replace('.000Z', 'Z');

function Status({ locale, cert }: { locale: Locale; cert: Decoded }) {
  const v = validity(cert, new Date());
  return (
    <>
      <Pill tone="neu">{t(locale, cert.kind === 'csr' ? 'x509.csr' : 'x509.cert')}</Pill>{' '}
      {v?.state === 'valid' && <Pill tone="ok">{t(locale, 'x509.valid', { days: v.days })}</Pill>}
      {v?.state === 'expired' && (
        <Pill tone="bad">{t(locale, 'x509.expired', { days: v.days })}</Pill>
      )}
      {v?.state === 'notYet' && (
        <Pill tone="warn">{t(locale, 'x509.notYet', { days: v.days })}</Pill>
      )}{' '}
      {cert.selfSigned && <Pill tone="warn">{t(locale, 'x509.selfSigned')}</Pill>}
    </>
  );
}

function detailRows(locale: Locale, d: Decoded, fp: Fingerprints | null): KVRow[] {
  const row = (key: MessageKey, value: string, mono = false): KVRow => ({
    key: t(locale, key),
    value,
    copy: value,
    mono,
  });
  const key = d.publicKey;
  const rows: KVRow[] = [row('x509.subject', formatName(d.subject) || '—')];
  if (d.issuer) rows.push(row('x509.issuer', formatName(d.issuer)));
  if (d.serial) rows.push(row('x509.serial', `${d.serial.hex} (${d.serial.dec})`));
  if (d.notBefore) rows.push(row('x509.notBefore', iso(d.notBefore)));
  if (d.notAfter) rows.push(row('x509.notAfter', iso(d.notAfter)));
  rows.push(
    row(
      'x509.publicKey',
      [key.algorithm, key.detail, key.bits && t(locale, 'x509.bits', { bits: key.bits })]
        .filter(Boolean)
        .join(' · '),
    ),
  );
  rows.push(row('x509.signature', d.signatureAlgorithm));
  rows.push(row('x509.version', `v${d.version}`));
  if (fp) {
    rows.push(row('x509.sha256', fp.sha256));
    rows.push(row('x509.sha1', fp.sha1));
    rows.push(row('x509.spki', fp.spkiSha256));
  }
  return rows;
}

function extensionRows(locale: Locale, d: Decoded): KVRow[] {
  return d.extensions.map((e) => {
    const name = KNOWN_EXTS.has(e.name) ? t(locale, `x509.ext.${e.name}` as KnownExt) : e.oid;
    const value = e.values.length ? e.values.join('\n') : t(locale, 'x509.notDecoded');
    return {
      key: e.critical ? `${name} · ${t(locale, 'x509.critical')}` : name,
      value: <span class="pre">{value}</span>,
      copy: value,
    };
  });
}

export default function X509Tool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? EC_PEM);
  const [index, setIndex] = useState('0');
  const src = useDebounced(input, 150);

  const result = useMemo((): Decoded[] | X509Error => {
    try {
      return decodeAll(src);
    } catch (e) {
      if (!(e instanceof X509Error)) throw e;
      return e;
    }
  }, [src]);

  const list = result instanceof X509Error ? [] : result;
  const cert = list[Number(index)] ?? list[0] ?? null;

  const [fp, setFp] = useState<Fingerprints | null>(null);
  useEffect(() => {
    setFp(null);
    if (!cert) return;
    let live = true;
    fingerprints(cert).then((f) => live && setFp(f));
    return () => {
      live = false;
    };
  }, [cert]);

  return (
    <>
      <Pane
        title={t(locale, 'x509.input')}
        actions={
          result instanceof X509Error
            ? src.trim() && <Pill tone="bad">{t(locale, `x509.err.${result.code}`)}</Pill>
            : cert && <Status locale={locale} cert={cert} />
        }
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:180px"
          aria-label={t(locale, 'x509.input')}
          placeholder="-----BEGIN CERTIFICATE-----"
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      {list.length > 1 && (
        <div class="bar">
          <Segmented
            label={t(locale, 'x509.chain')}
            value={String(list.indexOf(cert!))}
            onChange={setIndex}
            options={list.map((c, i) => [String(i), `${i + 1}. ${commonName(c) ?? '—'}`] as const)}
          />
        </div>
      )}
      {cert && (
        <div class="split">
          <Pane title={t(locale, 'x509.details')}>
            <KeyValue locale={locale} rows={detailRows(locale, cert, fp)} />
          </Pane>
          <Pane title={t(locale, 'x509.extensions', { count: cert.extensions.length })}>
            {cert.extensions.length ? (
              <KeyValue locale={locale} rows={extensionRows(locale, cert)} />
            ) : (
              <p class="note">{t(locale, 'x509.noExtensions')}</p>
            )}
          </Pane>
        </div>
      )}
      <p class="note">{t(locale, 'x509.note')}</p>
    </>
  );
}
