import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { CsvError, csvToJson, jsonToCsv } from './logic';

type Dir = 'j2c' | 'c2j';

const SAMPLE = `[
  {"id": 1, "nombre": "Ana Pérez", "plan": "pro", "mrr": 49.9, "activo": true},
  {"id": 2, "nombre": "Bruno, Díaz", "plan": "free", "mrr": 0, "activo": false},
  {"id": 3, "nombre": "Carla \\"CJ\\" Rojas", "plan": "team", "mrr": 199, "activo": true}
]`;

interface Output {
  text: string;
  pill: { tone: 'neu' | 'bad'; text: string } | null;
}

function convert(locale: Locale, src: string, dir: Dir, delim: string, cast: boolean): Output {
  if (!src.trim()) return { text: '', pill: null };
  if (dir === 'j2c') {
    const r = jsonToCsv(src, delim);
    return r.ok
      ? {
          text: r.csv,
          pill: { tone: 'neu', text: t(locale, 'csv.rowsCols', { rows: r.rows, cols: r.cols }) },
        }
      : { text: '', pill: { tone: 'bad', text: t(locale, 'json.error', { ...r.error }) } };
  }
  try {
    const arr = csvToJson(src, delim, cast);
    return {
      text: JSON.stringify(arr, null, 2),
      pill: { tone: 'neu', text: t(locale, 'csv.objects', { count: arr.length }) },
    };
  } catch (e) {
    if (!(e instanceof CsvError)) throw e;
    return { text: '', pill: { tone: 'bad', text: t(locale, 'csv.unclosedQuote', e.params) } };
  }
}

export default function CsvTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [dir, setDir] = useState<Dir>('j2c');
  const [delim, setDelim] = useState(',');
  const [cast, setCast] = useState(true);
  const src = useDebounced(input);

  const out = useMemo(
    () => convert(locale, src, dir, delim, cast),
    [locale, src, dir, delim, cast],
  );

  // Al cambiar de dirección, la salida actual pasa a ser la nueva entrada.
  const changeDir = (next: Dir) => {
    if (next === dir) return;
    const current = convert(locale, input, dir, delim, cast).text;
    if (current) setInput(current);
    setDir(next);
  };

  const inLabel = t(locale, dir === 'j2c' ? 'csv.inJson' : 'csv.inCsv');
  const outLabel = t(locale, dir === 'j2c' ? 'csv.outCsv' : 'csv.outJson');

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.direction')}
          value={dir}
          onChange={changeDir}
          options={[
            ['j2c', t(locale, 'csv.j2c')],
            ['c2j', t(locale, 'csv.c2j')],
          ]}
        />
        <label class="fld">
          {t(locale, 'csv.delimiter')}
          <select value={delim} onChange={(e) => setDelim(e.currentTarget.value)}>
            <option value=",">{t(locale, 'csv.comma')}</option>
            <option value=";">{t(locale, 'csv.semicolon')}</option>
            <option value={'\t'}>{t(locale, 'csv.tab')}</option>
          </select>
        </label>
        <label class="chk">
          <input
            type="checkbox"
            checked={cast}
            onChange={(e) => setCast(e.currentTarget.checked)}
          />
          {t(locale, 'csv.castTypes')}
        </label>
        {out.pill && <Pill tone={out.pill.tone}>{out.pill.text}</Pill>}
      </div>
      <div class="split">
        <Pane title={inLabel}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={inLabel}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane title={outLabel} actions={<CopyButton locale={locale} text={out.text} />}>
          <CodeOutput
            text={out.text}
            label={outLabel}
            {...(dir === 'c2j' && { highlight: 'json' as const })}
          />
        </Pane>
      </div>
    </>
  );
}
