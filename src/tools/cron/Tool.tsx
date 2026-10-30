import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { localZone } from '../../core/now';
import { relativeTime } from '../../core/relative';
import { t, type Locale } from '../../i18n';
import KeyValue from '../../ui/KeyValue';
import List from '../../ui/List';
import Pane from '../../ui/Pane';
import { useDebounced } from '../../ui/useDebounced';
import { describeSchedule, fieldSummary } from './describe';
import { CRON_FIELDS, CronError, describeCron, nextRuns, parseCron } from './logic';

const PRESETS = [
  ['*/5 * * * *', 'every5'],
  ['0 9 * * 1-5', 'weekdays9'],
  ['30 2 * * 0', 'sunday230'],
  ['0 0 1 * *', 'monthFirst'],
  ['0 */6 * * *', 'every6h'],
] as const;

const RUNS = 8;

function errorMessage(e: CronError, locale: Locale): string {
  const params = { ...e.params };
  if (typeof params['field'] === 'string') {
    params['field'] = t(
      locale,
      `cron.field.${params['field'] as (typeof CRON_FIELDS)[number]}`,
    ).toLocaleLowerCase(locale);
  }
  return t(locale, `cron.err.${e.code}`, params);
}

export default function CronTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? '0 9 * * 1-5');
  const expr = useDebounced(input);

  const result = useMemo(() => {
    try {
      const schedule = parseCron(expr);
      const now = new Date();
      return { schedule, now, runs: nextRuns(schedule, now, RUNS) };
    } catch (e) {
      if (!(e instanceof CronError)) throw e;
      return { error: errorMessage(e, locale) };
    }
  }, [expr, locale]);

  return (
    <>
      <Pane title={t(locale, 'cron.expression')}>
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="font-size:18px;padding:10px 12px"
          aria-label={t(locale, 'cron.expression')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      <div class="strip" role="group" aria-label={t(locale, 'cron.presets')}>
        {[...PRESETS, ['@weekly', null] as const].map(([e, key]) => (
          <button key={e} class="chip" type="button" onClick={() => setInput(e)}>
            {key ? t(locale, `cron.preset.${key}`) : e} <code class="note">{e}</code>
          </button>
        ))}
      </div>
      {'error' in result ? (
        <p class="card err" role="alert">
          {result.error}
        </p>
      ) : (
        <>
          <p
            class="card"
            data-testid="cron-desc"
            style="margin:0;font:600 20px/1.35 var(--f-display);letter-spacing:-.01em"
          >
            {describeSchedule(describeCron(result.schedule), locale)}
          </p>
          <div class="split">
            <Pane title={t(locale, 'cron.fields')}>
              <KeyValue
                locale={locale}
                rows={CRON_FIELDS.map((f, i) => {
                  const raw = result.schedule.raw[i]!;
                  return {
                    key: t(locale, `cron.field.${f}`),
                    value: (
                      <>
                        {raw}{' '}
                        <span class="note" style="font-family:var(--f-body)">
                          {fieldSummary(f, raw, result.schedule[f], locale)}
                        </span>
                      </>
                    ),
                  };
                })}
              />
            </Pane>
            <Pane title={t(locale, 'cron.next', { zone: localZone().replace(/_/g, ' ') })}>
              {result.runs.length ? (
                <List
                  locale={locale}
                  label={t(locale, 'cron.next', { zone: localZone() })}
                  rows={result.runs.map((d) => ({
                    text: d.toLocaleString(locale, {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    note: relativeTime(d, result.now, locale),
                  }))}
                />
              ) : (
                <p class="err" role="alert">
                  {t(locale, 'cron.never')}
                </p>
              )}
            </Pane>
          </div>
        </>
      )}
    </>
  );
}
