import { useEffect } from 'preact/hooks';

/** Avisa a ToolHost (una sola vez) cuando la herramienta ya muestra su primer resultado. */
export function useReady(done: boolean, onReady: (() => void) | undefined) {
  useEffect(() => {
    if (done) onReady?.();
  }, [done, onReady]);
}
