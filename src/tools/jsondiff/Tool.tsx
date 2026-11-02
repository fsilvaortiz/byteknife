import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale } from '../../i18n';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Table, { type TableRow } from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { diffJson, parseSide, preview, summary, type ParseSide } from './logic';

const BEFORE = `{
  "id": 4821,
  "servicio": "pagos-api",
  "version": "2.14.0",
  "regiones": ["sa-east-1", "us-east-1"],
  "limites": { "rps": 1200, "burst": 300 },
  "flags": { "pix": false, "beta": true }
}`;

const AFTER = `{
  "id": 4821,
  "servicio": "pagos-api",
  "version": "2.15.0",
  "regiones": ["sa-east-1", "us-east-1", "eu-west-1"],
  "limites": { "rps": 1500, "burst": 300, "timeoutMs": 2500 },
  "flags": { "pix": true }
}`;

const TONE = { added: 'add', removed: 'del' } as const;

function SideError({ locale, side }: { locale: Locale; side: ParseSide }) {
  if (side.ok) return null;
  return (
    <p class="err" role="alert">
      {t(locale, 'json.error', { ...side.error })}
    </p>
  );
}

export default function JsonDiffTool({ locale, initialInput }: ToolProps) {
  const [left, setLeft] = useState(initialInput ?? BEFORE);
  const [right, setRight] = useState(initialInput ? '' : AFTER);
  const [ignoreOrder, setIgnoreOrder] = useState(false);
  const a = useDebounced(left, 150);
  const b = useDebounced(right, 150);

  const sides = useMemo(() => [parseSide(a), parseSide(b)] as const, [a, b]);
  const changes = useMemo(
    () =>
      sides[0].ok && sides[1].ok ? diffJson(sides[0].value, sides[1].value, { ignoreOrder }) : null,
    [sides, ignoreOrder],
  );
  const count = changes && summary(changes);

  return (
    <>
      <div class="bar">
        <label class="chk">
          <input
            type="checkbox"
            checked={ignoreOrder}
            onChange={(e) => setIgnoreOrder(e.currentTarget.checked)}
          />
          {t(locale, 'jdiff.ignoreOrder')}
        </label>
        {count && changes.length > 0 && (
          <>
            <Pill tone="ok">+{count.added}</Pill>
            <Pill tone="bad">−{count.removed}</Pill>
            <Pill tone="warn">~{count.changed}</Pill>
          </>
        )}
        {changes?.length === 0 && <Pill tone="neu">{t(locale, 'diff.none')}</Pill>}
      </div>
      <div class="split">
        <Pane title={t(locale, 'diff.original')}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'diff.original')}
            value={left}
            onInput={(e) => setLeft(e.currentTarget.value)}
          />
          <SideError locale={locale} side={sides[0]} />
        </Pane>
        <Pane title={t(locale, 'diff.modified')}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'diff.modified')}
            value={right}
            onInput={(e) => setRight(e.currentTarget.value)}
          />
          <SideError locale={locale} side={sides[1]} />
        </Pane>
      </div>
      {changes && changes.length > 0 && (
        <Table
          label={t(locale, 'diff.result')}
          header={[t(locale, 'jdiff.path'), t(locale, 'jdiff.before'), t(locale, 'jdiff.after')]}
          rows={changes.map((c): TableRow => ({
            ...(c.kind !== 'changed' && { tone: TONE[c.kind] }),
            cells: [c.path, preview(c.before), preview(c.after)],
          }))}
        />
      )}
    </>
  );
}
