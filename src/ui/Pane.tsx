import type { ComponentChildren } from 'preact';

interface Props {
  title: ComponentChildren;
  /** Botones o estado a la derecha del título. */
  actions?: ComponentChildren;
  children: ComponentChildren;
}

export default function Pane({ title, actions, children }: Props) {
  return (
    <div class="pane">
      <div class="pane-h">
        <span>{title}</span>
        {actions}
      </div>
      {children}
    </div>
  );
}
