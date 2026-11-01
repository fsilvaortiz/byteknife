import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import { useDebounced } from '../../ui/useDebounced';
import { parseUserAgent, type Named } from './logic';

const SAMPLE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';

const show = (n: Named | null) => (n ? [n.name, n.version].filter(Boolean).join(' ') : '—');

export default function UserAgentTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input, 100);
  const ua = useMemo(() => parseUserAgent(src), [src]);

  const rows: KVRow[] = [
    { key: t(locale, 'ua.browser'), value: show(ua.browser) },
    { key: t(locale, 'ua.engine'), value: show(ua.engine) },
    { key: t(locale, 'ua.os'), value: show(ua.os) },
    { key: t(locale, 'ua.device'), value: t(locale, `ua.dev.${ua.device}`) },
  ];
  if (ua.bot) rows.push({ key: t(locale, 'ua.bot'), value: ua.bot });

  return (
    <>
      <Pane
        title={t(locale, 'ua.input')}
        actions={
          <button class="btn sm" type="button" onClick={() => setInput(navigator.userAgent)}>
            {t(locale, 'ua.mine')}
          </button>
        }
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:90px"
          aria-label={t(locale, 'ua.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      {src.trim() && (
        <>
          <div class="bar">
            <Pill tone={ua.bot ? 'warn' : 'neu'}>{t(locale, `ua.dev.${ua.device}`)}</Pill>
            {ua.reduced && <Pill tone="neu">{t(locale, 'ua.reducedPill')}</Pill>}
          </div>
          <KeyValue locale={locale} rows={rows} />
          {ua.reduced && <p class="note">{t(locale, 'ua.reduced')}</p>}
        </>
      )}
    </>
  );
}
