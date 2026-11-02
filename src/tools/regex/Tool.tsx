import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { compile, toggleFlag, type RegexQuery, type RegexResult } from './logic';

const SAMPLE_PATTERN = '(?<usuario>[\\w.+-]+)@(?<dominio>[\\w-]+(?:\\.[\\w-]+)+)';
const SAMPLE_TEXT =
  'Equipo de plataforma:\n- ana.perez@acme.dev (líder)\n- bruno+alertas@ops.acme.dev\n- carla@EJEMPLO.cl\nSin correo: dario, eva@\nSoporte: soporte@acme.dev';
const SAMPLE_REPLACEMENT = '$<usuario> en $<dominio>';
const FLAGS = ['g', 'i', 'm', 's', 'u'] as const;
const TIMEOUT_MS = 1000;
const MAX_ROWS = 200;

type Ok = Extract<RegexResult, { ok: true }>;
type State = { kind: 'idle' | 'working' | 'timeout' } | { kind: 'done'; result: Ok };

function countLabel(locale: Locale, r: Ok): string {
  if (r.truncated) return t(locale, 'regex.countMore', { count: r.matches.length });
  if (r.matches.length === 1) return t(locale, 'regex.countOne');
  return t(locale, 'regex.count', { count: r.matches.length });
}

export default function RegexTool({ locale, initialInput }: ToolProps) {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState(initialInput ?? SAMPLE_TEXT);
  const [replacement, setReplacement] = useState(SAMPLE_REPLACEMENT);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const worker = useRef<Worker | null>(null);
  const seq = useRef(0);

  const query = useDebounced<RegexQuery>(
    useMemo(() => ({ pattern, flags, text, replacement }), [pattern, flags, text, replacement]),
    80,
  );
  // La sintaxis se valida aquí: es instantáneo y el error aparece sin esperar al worker.
  const compiled = useMemo(() => compile(query.pattern, query.flags), [query]);

  useEffect(() => () => worker.current?.terminate(), []);

  useEffect(() => {
    if (!compiled.ok) return;
    const id = ++seq.current;
    worker.current ??= new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const w = worker.current;
    const timer = setTimeout(() => {
      // Backtracking catastrófico: se descarta el worker y se crea otro en la próxima consulta.
      w.terminate();
      if (worker.current === w) worker.current = null;
      setState({ kind: 'timeout' });
    }, TIMEOUT_MS);
    w.onmessage = (e: MessageEvent<{ id: number; result: RegexResult }>) => {
      if (e.data.id !== seq.current || !e.data.result.ok) return;
      clearTimeout(timer);
      setState({ kind: 'done', result: e.data.result });
    };
    setState((s) => (s.kind === 'done' ? s : { kind: 'working' }));
    w.postMessage({ id, query });
    return () => clearTimeout(timer);
  }, [query, compiled]);

  const result = compiled.ok && state.kind === 'done' ? state.result : null;
  const groupCount = result?.matches[0]?.groups.length ?? 0;

  return (
    <>
      <div class="bar" style="flex-wrap:nowrap">
        <span class="mono note" style="font-size:18px" aria-hidden="true">
          /
        </span>
        <input
          type="text"
          class="code"
          style="flex:1;min-width:0"
          spellcheck={false}
          aria-label={t(locale, 'regex.pattern')}
          value={pattern}
          onInput={(e) => setPattern(e.currentTarget.value)}
        />
        <span class="mono note" style="font-size:18px" aria-hidden="true">
          /
        </span>
        <input
          type="text"
          class="code"
          style="width:76px"
          spellcheck={false}
          aria-label={t(locale, 'regex.flags')}
          value={flags}
          onInput={(e) => setFlags(e.currentTarget.value)}
        />
      </div>
      <div class="bar">
        {FLAGS.map((f) => (
          <label key={f} class="chk">
            <input
              type="checkbox"
              checked={flags.includes(f)}
              onChange={(e) => setFlags(toggleFlag(flags, f, e.currentTarget.checked))}
            />
            <code>{f}</code> {t(locale, `regex.flag.${f}`)}
          </label>
        ))}
        {!compiled.ok ? (
          <Pill tone="bad">{compiled.error}</Pill>
        ) : state.kind === 'timeout' ? (
          <Pill tone="warn">{t(locale, 'regex.timeout')}</Pill>
        ) : result ? (
          <Pill tone={result.matches.length ? 'ok' : 'neu'}>{countLabel(locale, result)}</Pill>
        ) : (
          <span class="stat">{t(locale, 'regex.working')}</span>
        )}
      </div>
      <div class="split">
        <Pane title={t(locale, 'regex.text')}>
          <textarea
            class="code"
            spellcheck={false}
            style="min-height:220px"
            aria-label={t(locale, 'regex.text')}
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
          />
        </Pane>
        <Pane title={t(locale, 'regex.matches')}>
          <CodeOutput
            text={query.text}
            segments={result?.segments ?? [{ text: query.text }]}
            wrap
            style="min-height:220px"
            label={t(locale, 'regex.matches')}
          />
        </Pane>
      </div>
      <div class="split">
        <Pane title={t(locale, 'regex.groups')}>
          {result?.matches.length ? (
            <Table
              label={t(locale, 'regex.groups')}
              style="max-height:300px"
              header={[
                '#',
                t(locale, 'regex.match'),
                ...Array.from(
                  { length: groupCount },
                  (_, i) => result.groupNames[i] ?? `$${i + 1}`,
                ),
              ]}
              rows={result.matches.slice(0, MAX_ROWS).map((m, i) => ({
                numbers: [i + 1],
                cells: [m.text, ...m.groups.map((g) => g ?? <span class="note">—</span>)],
              }))}
            />
          ) : (
            <p class="note">{t(locale, 'regex.noMatches')}</p>
          )}
        </Pane>
        <Pane
          title={t(locale, 'regex.replace')}
          actions={
            <CopyButton
              locale={locale}
              text={result?.replaced ?? ''}
              label={t(locale, 'regex.copyResult')}
            />
          }
        >
          <div>
            <input
              type="text"
              class="code"
              style="width:100%"
              spellcheck={false}
              placeholder={SAMPLE_REPLACEMENT}
              aria-label={t(locale, 'regex.replace')}
              value={replacement}
              onInput={(e) => setReplacement(e.currentTarget.value)}
            />
            <CodeOutput
              text={result?.replaced ?? ''}
              wrap
              style="min-height:120px;margin-top:6px"
              label={t(locale, 'regex.replaced')}
            />
          </div>
        </Pane>
      </div>
    </>
  );
}
