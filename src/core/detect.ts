import { tools as allTools } from './registry';
import type { ToolMeta } from './types';

export const MAX_DETECT_INPUT = 200_000;

export interface Hit {
  tool: ToolMeta;
  label: string;
  confidence: number;
}

/** Corre detect() de cada herramienta y ordena de mayor a menor confianza. */
export function detectAll(raw: string, tools: ToolMeta[] = allTools): Hit[] {
  const input = raw.trim();
  if (!input || input.length > MAX_DETECT_INPUT) return [];
  const hits: Hit[] = [];
  for (const tool of tools) {
    if (!tool.detect) continue;
    try {
      const d = tool.detect(input);
      if (d) hits.push({ tool, label: d.label, confidence: d.confidence });
    } catch {
      // Un detect() que falla no debe romper a los demás.
    }
  }
  return hits.sort((a, b) => b.confidence - a.confidence);
}
