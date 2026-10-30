import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import KeyValue from '../../ui/KeyValue';
import { CASES, convertCase } from './logic';

const SAMPLE = 'Fecha de última sincronización HTTPResponse';

export default function CaseTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [strip, setStrip] = useState(true);
  const out = useMemo(() => convertCase(input, strip), [input, strip]);

  return (
    <>
      <div class="bar">
        <input
          type="text"
          spellcheck={false}
          style="flex:1;min-width:200px"
          aria-label={t(locale, 'case.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        <label class="chk">
          <input
            type="checkbox"
            checked={strip}
            onChange={(e) => setStrip(e.currentTarget.checked)}
          />
          {t(locale, 'case.stripAccents')}
        </label>
      </div>
      <KeyValue
        locale={locale}
        rows={CASES.map((id) => ({
          key: t(locale, `case.fmt.${id}`),
          value: out[id] || <span class="note">—</span>,
          copy: out[id],
        }))}
      />
    </>
  );
}
