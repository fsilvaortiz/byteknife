import type { ComponentChildren } from 'preact';

export type Tone = 'ok' | 'bad' | 'warn' | 'neu';

export default function Pill({ tone, children }: { tone: Tone; children: ComponentChildren }) {
  return <span class={`pill ${tone}`}>{children}</span>;
}
