import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import { fmtBytes, utf8Bytes } from '../../ui/format';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { decodeBase64, encodeText } from './logic';

type Dir = 'enc' | 'dec';

const SAMPLE = '¡Hola, mundo! Ñandú 🚀 — const x = 42;';

interface Output {
  text: string;
  stat: string;
  invalid?: boolean;
}

function run(locale: Locale, src: string, dir: Dir, urlSafe: boolean): Output {
  if (!src) return { text: '', stat: '' };
  if (dir === 'enc') {
    const text = encodeText(src, urlSafe);
    return {
      text,
      stat: t(locale, 'b64.encStat', { in: utf8Bytes(src).length, out: text.length }),
    };
  }
  try {
    const d = decodeBase64(src);
    return d.kind === 'text'
      ? { text: d.text, stat: t(locale, 'b64.textStat', { bytes: d.bytes }) }
      : {
          text: d.hex + (d.truncated ? '\n…' : ''),
          stat: t(locale, 'b64.binStat', { size: fmtBytes(d.bytes) }),
        };
  } catch {
    return { text: '', stat: '', invalid: true };
  }
}

export default function Base64Tool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  // Lo que llega pegado desde el home casi siempre es Base64 para decodificar.
  const [dir, setDir] = useState<Dir>(initialInput ? 'dec' : 'enc');
  const [urlSafe, setUrlSafe] = useState(false);
  const [file, setFile] = useState<Output | null>(null);
  const src = useDebounced(input);

  const out = useMemo(
    () => file ?? run(locale, src, dir, urlSafe),
    [file, locale, src, dir, urlSafe],
  );

  const edit = (value: string) => {
    setFile(null);
    setInput(value);
  };
  const changeDir = (next: Dir) => {
    setFile(null);
    setDir(next);
  };
  const swap = () => {
    edit(out.text);
    setDir(dir === 'enc' ? 'dec' : 'enc');
  };
  const onFile = (e: Event) => {
    const f = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!f) return;
    // FileReader trabaja en la pestaña: el archivo no se sube a ningún lado.
    const reader = new FileReader();
    reader.onload = () =>
      setFile({ text: String(reader.result), stat: `${f.name} · ${fmtBytes(f.size)}` });
    reader.readAsDataURL(f);
  };

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.direction')}
          value={dir}
          onChange={changeDir}
          options={[
            ['enc', t(locale, 'b64.encode')],
            ['dec', t(locale, 'b64.decode')],
          ]}
        />
        <label class="chk">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.currentTarget.checked)}
          />
          {t(locale, 'b64.urlSafe')}
        </label>
        <label class="btn sm" style="display:inline-flex;align-items:center">
          {t(locale, 'b64.file')}
          <input type="file" class="visually-hidden" onChange={onFile} />
        </label>
        {out.invalid && <Pill tone="bad">{t(locale, 'b64.invalid')}</Pill>}
      </div>
      <div class="split">
        <Pane
          title={t(locale, 'common.input')}
          actions={
            <button class="ghost" type="button" onClick={swap}>
              {t(locale, 'common.swap')}
            </button>
          }
        >
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'common.input')}
            value={input}
            onInput={(e) => edit(e.currentTarget.value)}
          />
        </Pane>
        <Pane
          title={t(locale, 'common.result')}
          actions={
            <>
              <span class="stat">{out.stat}</span>
              <CopyButton locale={locale} text={out.text} />
            </>
          }
        >
          <CodeOutput text={out.text} wrap label={t(locale, 'common.result')} />
        </Pane>
      </div>
    </>
  );
}
