import { useEffect, useRef, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import { fmtBytes, utf8Bytes } from '../../ui/format';
import KeyValue from '../../ui/KeyValue';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { ALGORITHMS, formatDigest, hashAll, type DigestFormat, type Digests } from './logic';

const SAMPLE = 'The quick brown fox jumps over the lazy dog';

type WorkerReply = { ok: true; digests: Digests } | { ok: false };

export default function HashTool({ locale, initialInput }: ToolProps) {
  const [text, setText] = useState(initialInput ?? SAMPLE);
  const [fmt, setFmt] = useState<DigestFormat>('hex');
  const [upper, setUpper] = useState(false);
  const [digests, setDigests] = useState<Digests | null>(null);
  const [source, setSource] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const worker = useRef<Worker | null>(null);
  const src = useDebounced(text, 150);

  useEffect(() => () => worker.current?.terminate(), []);

  // Texto: en el hilo principal, es pequeño.
  useEffect(() => {
    if (file) return;
    const bytes = utf8Bytes(src);
    let live = true;
    hashAll(bytes).then((d) => {
      if (!live) return;
      setDigests(d);
      setSource(t(locale, 'hash.textSize', { size: fmtBytes(bytes.length) }));
    });
    return () => {
      live = false;
    };
  }, [src, file, locale]);

  // Archivo: en un Web Worker para no congelar la pestaña. Nunca sale del navegador.
  const onFile = async (e: Event) => {
    const f = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!f) return;
    setBusy(true);
    setFailed(false);
    const label = `${f.name} · ${fmtBytes(f.size)}`;
    setFile(label);
    setText('');
    try {
      const buffer = await f.arrayBuffer();
      worker.current ??= new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      worker.current.onmessage = (m: MessageEvent<WorkerReply>) => {
        setBusy(false);
        if (m.data.ok) {
          setDigests(m.data.digests);
          setSource(label);
        } else setFailed(true);
      };
      worker.current.postMessage(buffer, [buffer]);
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  const edit = (value: string) => {
    setFile(null);
    setFailed(false);
    setText(value);
  };

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'hash.format')}
          value={fmt}
          onChange={setFmt}
          options={[
            ['hex', t(locale, 'hash.hex')],
            ['b64', t(locale, 'hash.b64')],
          ]}
        />
        <label class="chk">
          <input
            type="checkbox"
            checked={upper}
            onChange={(e) => setUpper(e.currentTarget.checked)}
          />
          {t(locale, 'common.uppercase')}
        </label>
        <label class="btn sm" style="display:inline-flex;align-items:center">
          {t(locale, 'common.chooseFile')}
          <input type="file" class="visually-hidden" onChange={onFile} />
        </label>
        <span class="stat" data-testid="hash-source">
          {busy ? t(locale, 'hash.working') : source}
        </span>
        {failed && <Pill tone="bad">{t(locale, 'hash.failed')}</Pill>}
      </div>
      <textarea
        class="code"
        spellcheck={false}
        style="min-height:120px"
        aria-label={t(locale, 'hash.input')}
        placeholder={file ? t(locale, 'hash.backToText') : undefined}
        value={text}
        onInput={(e) => edit(e.currentTarget.value)}
      />
      {digests && (
        <KeyValue
          locale={locale}
          rows={ALGORITHMS.map((alg) => {
            const value = formatDigest(digests[alg], fmt, upper);
            return { key: alg, value, copy: value };
          })}
        />
      )}
    </>
  );
}
