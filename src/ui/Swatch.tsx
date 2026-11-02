import type { ComponentChildren } from 'preact';

/** Muestra de color sobre un damero, para que se note la transparencia. */
export default function Swatch({
  color,
  children,
}: {
  color: string;
  children: ComponentChildren;
}) {
  return (
    <div class="swatch">
      <div style={{ background: color }}>{children}</div>
    </div>
  );
}
