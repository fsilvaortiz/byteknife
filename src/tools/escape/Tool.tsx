import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { EscapeError, escapeString, type EscapeDirection, type EscapeFormat } from './logic';

const SAMPLE = `<a href="/buscar?q=café&orden=1">Resultados "rápidos"</a>\nLínea 2 con tab\tal final`;

export default function EscapeTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [fmt, setFmt] = useState<EscapeFormat>('html');
  const [dir, setDir] = useState<EscapeDirection>('enc');
  const src = useDebounced(input);

  const out = useMemo(() => {
    try {
      return { text: escapeString(src, fmt, dir), error: null };
    } catch (e) {
      if (!(e instanceof EscapeError)) throw e;
      return { text: '', error: e.code };
    }
  }, [src, fmt, dir]);

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.format')}
          value={fmt}
          onChange={setFmt}
          options={[
            ['html', t(locale, 'esc.html')],
            ['json', t(locale, 'esc.json')],
            ['uni', t(locale, 'esc.uni')],
          ]}
        />
        <Segmented
          label={t(locale, 'common.direction')}
          value={dir}
          onChange={setDir}
          options={[
            ['enc', t(locale, 'esc.enc')],
            ['dec', t(locale, 'esc.dec')],
          ]}
        />
        {out.error && <Pill tone="bad">{t(locale, `esc.err.${out.error}`)}</Pill>}
      </div>
      <div class="split">
        <Pane title={t(locale, 'common.input')}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'common.input')}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane
          title={t(locale, 'common.result')}
          actions={<CopyButton locale={locale} text={out.text} />}
        >
          <CodeOutput text={out.text} wrap label={t(locale, 'common.result')} />
        </Pane>
      </div>
    </>
  );
}
