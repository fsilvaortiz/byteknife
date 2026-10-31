import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { takePendingInput } from '../core/store';
import { t, type Locale } from '../i18n';

export interface ToolProps {
  locale: Locale;
  /** Lo que el usuario pegó en el home o la búsqueda; null = abrir con el ejemplo. */
  initialInput: string | null;
}

// Sin eager: cada página descarga solo el chunk de su herramienta.
const loaders = import.meta.glob<{ default: ComponentType<ToolProps> }>('../tools/*/Tool.tsx');

const loaderFor = (id: string) => loaders[`../tools/${id}/Tool.tsx`];

export default function ToolHost({ locale, id }: { locale: Locale; id: string }) {
  const [state, setState] = useState<{ Tool: ComponentType<ToolProps>; input: string | null }>();
  const [failed, setFailed] = useState(false);
  const load = loaderFor(id);

  useEffect(() => {
    if (!load) return;
    const input = takePendingInput(id);
    load().then(
      (m) => setState({ Tool: m.default, input }),
      () => setFailed(true),
    );
  }, [id, load]);

  // Con la herramienta montada, su contenedor deja de reservar altura (tool-heights.css).
  useEffect(() => {
    if (state || failed)
      document.querySelector(`.tool[data-tool-id="${id}"]`)?.setAttribute('data-ready', '');
  }, [id, state, failed]);

  if (!load) return <p class="lede">{t(locale, 'tool.comingSoon')}</p>;
  if (failed) return <p class="err">{t(locale, 'tool.loadFailed')}</p>;
  if (!state) return null;
  const { Tool, input } = state;
  return <Tool locale={locale} initialInput={input} />;
}
