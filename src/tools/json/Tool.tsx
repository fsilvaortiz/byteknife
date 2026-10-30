import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import { fmtBytes } from '../../ui/format';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { formatJson, type Indent, type JsonMode } from './logic';

const SAMPLE =
  '{"id":4821,"servicio":"pagos-api","version":"2.14.0","activo":true,"regiones":["sa-east-1","us-east-1"],"limites":{"rps":1200,"burst":300,"timeoutMs":2500},"dueño":null}';

const INDENTS = { '2': 2, '4': 4, t: '\t' } as const satisfies Record<string, Indent>;

export default function JsonTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [mode, setMode] = useState<JsonMode>('fmt');
  const [indent, setIndent] = useState<keyof typeof INDENTS>('2');
  const src = useDebounced(input);

  const result = useMemo(
    () => (src.trim() ? formatJson(src, mode, INDENTS[indent]) : null),
    [src, mode, indent],
  );
  const output = result?.ok ? result.output : '';

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.mode')}
          value={mode}
          onChange={setMode}
          options={[
            ['fmt', t(locale, 'json.fmt')],
            ['min', t(locale, 'json.min')],
            ['sort', t(locale, 'json.sort')],
          ]}
        />
        <label class="fld">
          {t(locale, 'json.indent')}
          <select
            value={indent}
            onChange={(e) => setIndent(e.currentTarget.value as keyof typeof INDENTS)}
          >
            <option value="2">{t(locale, 'json.indent2')}</option>
            <option value="4">{t(locale, 'json.indent4')}</option>
            <option value="t">{t(locale, 'json.indentTab')}</option>
          </select>
        </label>
        {result?.ok && <Pill tone="ok">{t(locale, 'json.valid')}</Pill>}
        {result && !result.ok && (
          <Pill tone="bad">{t(locale, 'json.error', { ...result.error })}</Pill>
        )}
      </div>
      <div class="split">
        <Pane
          title={t(locale, 'common.input')}
          actions={
            <button class="ghost" type="button" onClick={() => setInput('')}>
              {t(locale, 'common.clear')}
            </button>
          }
        >
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
          actions={
            <>
              {result?.ok && (
                <span class="stat">
                  {t(locale, 'json.stats', {
                    nodes: result.nodes,
                    depth: result.depth,
                    size: fmtBytes(result.bytes),
                  })}
                </span>
              )}
              <CopyButton locale={locale} text={output} />
            </>
          }
        >
          <CodeOutput text={output} highlight="json" label={t(locale, 'common.result')} />
        </Pane>
      </div>
    </>
  );
}
