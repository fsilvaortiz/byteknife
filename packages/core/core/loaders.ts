import type { ComponentType } from 'preact';
import type { ToolProps } from './types';

export interface ToolModule {
  default: ComponentType<ToolProps>;
  /** El primer resultado es asíncrono: la altura se reserva hasta que llame a onReady. */
  waitsForResult?: boolean;
}

// Sin eager: cada página descarga solo el chunk de su herramienta. La clave del glob
// ("../tools/<id>/Tool.tsx") la busca toolChunk() en apps/web/integrations/asset-graph.mjs.
const loaders = import.meta.glob<ToolModule>('../tools/*/Tool.tsx');

/** Cargador del Tool.tsx de una herramienta, o undefined si todavía no tiene UI. */
export const toolLoader = (id: string): (() => Promise<ToolModule>) | undefined =>
  loaders[`../tools/${id}/Tool.tsx`];
