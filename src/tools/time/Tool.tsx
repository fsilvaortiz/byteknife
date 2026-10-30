import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { unixSeconds } from '../../core/now';
import { t } from '../../i18n';
import CopyButton from '../../ui/CopyButton';
import KeyValue from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import { useDebounced } from '../../ui/useDebounced';
import { DEFAULT_ZONES, formats, localZone, parseTime, zoneRows } from './logic';

const SAMPLE = '1793318400';

export default function TimeTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [now, setNow] = useState(() => new Date());
  const src = useDebounced(input);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // La lectura usa la hora del momento en que cambia la entrada, no la del tic.
  const parsed = useMemo(() => {
    const at = new Date();
    return { at, value: parseTime(src, at) };
  }, [src]);
  const p = parsed.value;
  const zone = localZone();

  return (
    <>
      <div class="card" style="display:flex;flex-wrap:wrap;gap:10px 28px;align-items:center">
        <span class="eyebrow" style="margin:0">
          {t(locale, 'time.now')}
        </span>
        <span class="mono" style="font-size:20px;font-variant-numeric:tabular-nums">
          {unixSeconds(now)}
        </span>
        <span class="mono note">{now.toISOString()}</span>
        <CopyButton
          locale={locale}
          class="btn sm"
          text={() => String(unixSeconds(new Date()))}
          label={t(locale, 'time.copyNow')}
        />
        <button
          class="btn sm"
          type="button"
          onClick={() => setInput(String(unixSeconds(new Date())))}
        >
          {t(locale, 'time.useNow')}
        </button>
      </div>
      <Pane
        title={t(locale, 'time.input')}
        actions={
          p ? (
            <span>
              {p.zoneless && <Pill tone="warn">{t(locale, 'time.zoneless')}</Pill>}{' '}
              <Pill tone="neu">
                {t(locale, 'time.readAs', { unit: t(locale, `time.unit.${p.unit}`) })}
              </Pill>
            </span>
          ) : (
            <Pill tone="bad">{t(locale, 'time.invalid')}</Pill>
          )
        }
      >
        <input
          type="text"
          class="code"
          spellcheck={false}
          placeholder={t(locale, 'time.placeholder')}
          aria-label={t(locale, 'time.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      {p && (
        <div class="split">
          <Pane title={t(locale, 'time.formats')}>
            <KeyValue
              locale={locale}
              rows={formats(p.date, parsed.at, locale).map(([id, value]) => ({
                key: t(locale, `time.fmt.${id}`),
                value,
                copy: value,
              }))}
            />
          </Pane>
          <Pane title={t(locale, 'time.zones')}>
            <KeyValue
              locale={locale}
              rows={zoneRows(p.date, [zone, ...DEFAULT_ZONES], locale).map((r) => ({
                key: `${r.zone.replace(/_/g, ' ')}${r.zone === zone ? ` · ${t(locale, 'time.you')}` : ''}`,
                value: (
                  <>
                    {r.text} <span class="note">{r.offset}</span>
                  </>
                ),
                copy: r.text,
              }))}
            />
          </Pane>
        </div>
      )}
    </>
  );
}
