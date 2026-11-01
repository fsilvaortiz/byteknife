import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { takePendingInput } from '../core/store';
import { t, type Locale } from '../i18n';

export interface ToolProps {
  locale: Locale;
  /** Lo que el usuario pegó en el home o la búsqueda; null = abrir con el ejemplo. */
  initialInput: string | null;
  /**
   * Las herramientas que exportan `waitsForResult = true` lo llaman cuando muestran su
   * primer resultado (que llega con una librería cargada aparte o con Web Crypto).
   */
  onReady?: () => void;
}

interface ToolModule {
  default: ComponentType<ToolProps>;
  /** El primer resultado es asíncrono: la altura se reserva hasta que llame a onReady. */
  waitsForResult?: boolean;
}

/** Si una herramienta no llama a onReady, la reserva se libera igual tras este tiempo. */
const READY_TIMEOUT = 4000;

// Sin eager: cada página descarga solo el chunk de su herramienta.
const loaders = import.meta.glob<ToolModule>('../tools/*/Tool.tsx');

const loaderFor = (id: string) => loaders[`../tools/${id}/Tool.tsx`];

export default function ToolHost({ locale, id }: { locale: Locale; id: string }) {
  const [state, setState] = useState<{
    Tool: ComponentType<ToolProps>;
    input: string | null;
    waits: boolean;
  }>();
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState(false);
  const load = loaderFor(id);

  useEffect(() => {
    if (!load) return;
    const input = takePendingInput(id);
    load().then(
      (m) => setState({ Tool: m.default, input, waits: m.waitsForResult === true }),
      () => setFailed(true),
    );
  }, [id, load]);

  // Con la herramienta montada (y su primer resultado, si lo espera), su contenedor deja de
  // reservar altura (tool-heights.css).
  useEffect(() => {
    if (state?.waits && !result && !failed) {
      const timer = setTimeout(() => setResult(true), READY_TIMEOUT);
      return () => clearTimeout(timer);
    }
    if (state || failed)
      document.querySelector(`.tool[data-tool-id="${id}"]`)?.setAttribute('data-ready', '');
    return undefined;
  }, [id, state, failed, result]);

  const onReady = () => setResult(true);

  if (!load) return <p class="lede">{t(locale, 'tool.comingSoon')}</p>;
  if (failed) return <p class="err">{t(locale, 'tool.loadFailed')}</p>;
  if (!state) return null;
  const { Tool, input } = state;
  return <Tool locale={locale} initialInput={input} onReady={onReady} />;
}
