import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { DiffError, diffLines } from './logic';

const SAMPLE_A =
  'server:\n  port: 8080\n  timeout: 30s\ndatabase:\n  host: db.interno\n  pool: 10\nlogging:\n  level: info';
const SAMPLE_B =
  'server:\n  port: 8443\n  timeout: 30s\n  tls: true\ndatabase:\n  host: db.interno\n  pool: 25\nlogging:\n  level: info';

export default function DiffTool({ locale }: ToolProps) {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);
  const [ignoreTrailingWs, setIgnoreTrailingWs] = useState(true);
  const [onlyChanges, setOnlyChanges] = useState(false);
  const texts = useDebounced(
    useMemo(() => [a, b] as const, [a, b]),
    200,
  );

  const result = useMemo(() => {
    try {
      return diffLines(texts[0], texts[1], { ignoreTrailingWs });
    } catch (e) {
      if (!(e instanceof DiffError)) throw e;
      return e;
    }
  }, [texts, ignoreTrailingWs]);

  return (
    <>
      <div class="split">
        {(
          [
            ['diff.original', a, setA],
            ['diff.modified', b, setB],
          ] as const
        ).map(([key, value, set]) => (
          <Pane key={key} title={t(locale, key)}>
            <textarea
              class="code"
              spellcheck={false}
              style="min-height:200px"
              aria-label={t(locale, key)}
              value={value}
              onInput={(e) => set(e.currentTarget.value)}
            />
          </Pane>
        ))}
      </div>
      <div class="bar">
        <label class="chk">
          <input
            type="checkbox"
            checked={ignoreTrailingWs}
            onChange={(e) => setIgnoreTrailingWs(e.currentTarget.checked)}
          />
          {t(locale, 'diff.ignoreWs')}
        </label>
        <label class="chk">
          <input
            type="checkbox"
            checked={onlyChanges}
            onChange={(e) => setOnlyChanges(e.currentTarget.checked)}
          />
          {t(locale, 'diff.onlyChanges')}
        </label>
        {!(result instanceof DiffError) &&
          (result.added + result.removed ? (
            <span>
              <Pill tone="ok">+{result.added}</Pill> <Pill tone="bad">−{result.removed}</Pill>
            </span>
          ) : (
            <Pill tone="neu">{t(locale, 'diff.none')}</Pill>
          ))}
      </div>
      {result instanceof DiffError ? (
        <p class="err" role="alert">
          {t(locale, 'diff.tooLarge', result.params)}
        </p>
      ) : (
        <Table
          label={t(locale, 'diff.result')}
          rows={result.rows
            .filter((r) => !onlyChanges || r.type !== 'eq')
            .map((r) => ({
              tone: r.type,
              numbers: [r.aLine, r.bLine],
              cells: [r.text || ' '],
            }))}
        />
      )}
    </>
  );
}
