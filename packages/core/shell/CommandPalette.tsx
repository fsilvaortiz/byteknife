import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { detectAll } from '../core/detect';
import { openTool } from '../core/navigate';
import { searchTools } from '../core/search';
import { t, type Locale } from '../i18n';
import { closePalette, openPalette, paletteOpen } from './paletteState';

interface Item {
  id: string;
  label: string;
  /** Etiqueta de detección: el ítem abre la herramienta con lo pegado. */
  tag?: string;
  sub: string;
  input?: string;
}

/** Con una consulta larga que se detectó, solo se muestran las detecciones. */
const LONG_QUERY = 24;

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);

export default function CommandPalette({ locale }: { locale: Locale }) {
  const open = paletteOpen.value;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(() => {
    const q = query.trim();
    const hits = detectAll(q).map((h) => ({
      id: h.tool.id,
      label: t(locale, 'search.openIn', { name: h.tool.i18n[locale].name }),
      tag: h.tool.i18n[locale].labels?.[h.label] ?? h.label,
      sub: t(locale, 'search.withPasted'),
      input: q,
    }));
    if (hits.length && q.length > LONG_QUERY) return hits;
    const found = searchTools(q, locale, (tool) => t(locale, `cat.${tool.category}`)).map(
      (tool) => ({
        id: tool.id,
        label: tool.i18n[locale].name,
        sub: t(locale, `cat.${tool.category}`),
      }),
    );
    return [...hits, ...found];
  }, [query, locale]);

  const hide = closePalette;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) hide();
        else openPalette();
      } else if (e.key === '/' && !open && !isTyping(e.target)) {
        e.preventDefault();
        openPalette();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Síncrono tras montar el diálogo: así no se pierden teclas escritas justo después de Ctrl K.
  useLayoutEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [selected]);

  const go = (i: number) => {
    const item = items[i];
    if (!item) return;
    paletteOpen.value = false;
    openTool(locale, item.id, item.input);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setSelected((s) => (s + d + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(selected);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    } else if (e.key === 'Tab') {
      // El diálogo solo tiene el campo de búsqueda: el foco no debe escapar.
      e.preventDefault();
    }
  };

  if (!open) return null;

  return (
    <div
      class="pal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) hide();
      }}
    >
      <div class="pal-box" role="dialog" aria-modal="true" aria-label={t(locale, 'search.dialog')}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="pal-list"
          aria-activedescendant={items.length ? `pal-opt-${selected}` : undefined}
          aria-label={t(locale, 'search.dialog')}
          placeholder={t(locale, 'search.placeholder')}
          autocomplete="off"
          spellcheck={false}
          value={query}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            setSelected(0);
          }}
          onKeyDown={onKeyDown}
        />
        <div class="pal-list" id="pal-list" role="listbox" ref={listRef}>
          {items.length ? (
            items.map((it, i) => (
              <div
                key={`${it.tag ? 'hit' : 'tool'}-${it.id}`}
                id={`pal-opt-${i}`}
                class={i === selected ? 'pal-item on' : 'pal-item'}
                role="option"
                aria-selected={i === selected}
                onClick={() => go(i)}
                onMouseMove={() => setSelected(i)}
              >
                {it.tag && <span class="tag">{it.tag}</span>}
                <span>{it.label}</span>
                <small>{it.sub}</small>
              </div>
            ))
          ) : (
            <div class="pal-empty">{t(locale, 'search.empty', { query: query.trim() })}</div>
          )}
        </div>
      </div>
    </div>
  );
}
