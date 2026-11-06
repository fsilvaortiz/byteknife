import { useEffect, useRef, useState } from 'preact/hooks';
import { detectAll, type Hit } from '../core/detect';
import { openTool } from '../core/navigate';
import { toolById } from '../core/registry';
import { t, type Locale } from '../i18n';

const FALLBACK_TOOLS = ['json', 'base64', 'hash', 'case'];

export default function PasteBox({ locale }: { locale: Locale }) {
  const [value, setValue] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHits(detectAll(value)), 100);
    return () => clearTimeout(timer.current);
  }, [value]);

  const open = (id: string) => openTool(locale, id, value.trim());

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const [first] = detectAll(value);
    if (first) {
      e.preventDefault();
      open(first.tool.id);
    }
  };

  const name = (id: string) => toolById.get(id)?.i18n[locale].name ?? id;

  return (
    <div class="paste">
      <label for="pasteIn">{t(locale, 'paste.label')}</label>
      <textarea
        id="pasteIn"
        class="code"
        spellcheck={false}
        placeholder={t(locale, 'paste.placeholder')}
        value={value}
        onInput={(e) => setValue(e.currentTarget.value)}
        onKeyDown={onKeyDown}
      />
      <div class="detect" data-testid="detect">
        {!value.trim() ? (
          <span class="hint">{t(locale, 'detect.idle')}</span>
        ) : !hits.length ? (
          <>
            <span class="hint">{t(locale, 'detect.unknown')}</span>
            {FALLBACK_TOOLS.map((id) => (
              <button key={id} class="chip" type="button" onClick={() => open(id)}>
                {name(id)}
              </button>
            ))}
          </>
        ) : (
          <>
            {hits.map((h, i) => (
              <button
                key={h.tool.id}
                class={i === 0 ? 'chip go' : 'chip'}
                type="button"
                onClick={() => open(h.tool.id)}
              >
                {h.tool.i18n[locale].labels?.[h.label] ?? h.label} → {h.tool.i18n[locale].name}
              </button>
            ))}
            {hits.length === 1 && <span class="hint">{t(locale, 'detect.enter')}</span>}
          </>
        )}
      </div>
    </div>
  );
}
