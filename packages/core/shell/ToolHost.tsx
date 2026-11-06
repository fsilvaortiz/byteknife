import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { toolLoader } from '../core/loaders';
import { takePendingInput } from '../core/store';
import type { ToolProps } from '../core/types';
import { t, type Locale } from '../i18n';

/** Si una herramienta no llama a onReady, la reserva se libera igual tras este tiempo. */
const READY_TIMEOUT = 4000;

export default function ToolHost({ locale, id }: { locale: Locale; id: string }) {
  const [state, setState] = useState<{
    Tool: ComponentType<ToolProps>;
    input: string | null;
    waits: boolean;
  }>();
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState(false);
  const load = toolLoader(id);

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
