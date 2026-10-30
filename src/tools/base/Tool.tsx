import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale } from '../../i18n';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import Pill from '../../ui/Pill';
import { useDebounced } from '../../ui/useDebounced';
import {
  BaseError,
  bitInfo,
  codePointInfo,
  parseInteger,
  representations,
  type InputBase,
} from './logic';

const SAMPLE = '0xCAFE_F00D';
const BASES = ['auto', '10', '16', '2', '8'] as const;

/** Separador de miles del idioma (punto en es/pt, coma en en). */
const groupSeparator = (locale: Locale) =>
  new Intl.NumberFormat(locale).formatToParts(1_000_000).find((p) => p.type === 'group')?.value ??
  ' ';

export default function BaseTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [base, setBase] = useState<(typeof BASES)[number]>('auto');
  const src = useDebounced(input, 80);

  const parsed = useMemo(() => {
    try {
      return parseInteger(src, base === 'auto' ? 'auto' : (Number(base) as InputBase));
    } catch (e) {
      if (!(e instanceof BaseError)) throw e;
      return e;
    }
  }, [src, base]);

  const ok = parsed && !(parsed instanceof BaseError) ? parsed : null;
  const rows: KVRow[] = ok
    ? representations(ok, groupSeparator(locale)).map((r) => ({
        key: t(locale, `base.rep.${r.id}`),
        value: r.shown,
        copy: r.raw,
      }))
    : [];
  const cp = ok && codePointInfo(ok);
  if (cp)
    rows.push({ key: t(locale, 'base.char'), value: `${cp.label}  ${cp.char}`, copy: cp.char });

  return (
    <>
      <div class="bar">
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:180px"
          aria-label={t(locale, 'base.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        <label class="fld">
          {t(locale, 'base.inputBase')}
          <select
            value={base}
            onChange={(e) => setBase(e.currentTarget.value as (typeof BASES)[number])}
          >
            {BASES.map((b) => (
              <option key={b} value={b}>
                {t(locale, b === 'auto' ? 'base.auto' : `base.b${b}`)}
              </option>
            ))}
          </select>
        </label>
        {parsed instanceof BaseError && <Pill tone="bad">{t(locale, 'base.invalid')}</Pill>}
        {ok && <Pill tone="neu">{t(locale, 'base.bits', bitInfo(ok.magnitude))}</Pill>}
      </div>
      {ok && <KeyValue locale={locale} rows={rows} />}
    </>
  );
}
