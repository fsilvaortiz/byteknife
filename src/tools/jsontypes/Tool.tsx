import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { parseErrorPosition, stripBom } from '../json/logic';
import { generate, TypesError, type Lang } from './logic';

const SAMPLE = `{
  "id": 4821,
  "email": "ana@ejemplo.dev",
  "plan": "pro",
  "mrr": 49.9,
  "activo": true,
  "avatar_url": null,
  "direccion": { "ciudad": "Santiago", "pais": "CL" },
  "pedidos": [
    { "id": 1, "total": 120, "items": ["teclado", "mouse"] },
    { "id": 2, "total": 35.5, "cupon": "BIENVENIDA" }
  ]
}`;

type Output = { ok: true; code: string } | { ok: false; message: string };

export default function JsonTypesTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [lang, setLang] = useState<Lang>('ts');
  const [rootName, setRootName] = useState('Cliente');
  const src = useDebounced(input, 150);
  const name = useDebounced(rootName, 150);

  const out = useMemo((): Output => {
    const text = stripBom(src);
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch (e) {
      return { ok: false, message: t(locale, 'json.error', { ...parseErrorPosition(e, text) }) };
    }
    try {
      return { ok: true, code: generate(value, lang, name) };
    } catch (e) {
      if (!(e instanceof TypesError)) throw e;
      return { ok: false, message: t(locale, 'jtypes.empty') };
    }
  }, [src, lang, name, locale]);

  const code = out.ok ? out.code : '';

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'jtypes.lang')}
          value={lang}
          onChange={setLang}
          options={[
            ['ts', 'TypeScript'],
            ['java', 'Java'],
            ['go', 'Go'],
          ]}
        />
        <label class="fld">
          {t(locale, 'jtypes.root')}
          <input
            type="text"
            class="code"
            spellcheck={false}
            style="width:140px"
            value={rootName}
            onInput={(e) => setRootName(e.currentTarget.value)}
          />
        </label>
        {src.trim() && !out.ok && <Pill tone="bad">{out.message}</Pill>}
      </div>
      <div class="split">
        <Pane title={t(locale, 'csv.inJson')}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'csv.inJson')}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane
          title={t(locale, 'jtypes.output')}
          actions={<CopyButton locale={locale} text={code} />}
        >
          <CodeOutput text={code} label={t(locale, 'jtypes.output')} />
        </Pane>
      </div>
      <p class="note">{t(locale, `jtypes.note.${lang}`)}</p>
    </>
  );
}
