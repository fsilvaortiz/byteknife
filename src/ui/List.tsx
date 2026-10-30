import type { ComponentChildren } from 'preact';
import type { Locale } from '../i18n';
import CopyButton from './CopyButton';

export interface ListRow {
  text: string;
  /** Nota a la derecha (p. ej. tiempo relativo). Sin nota, la fila lleva botón de copiar. */
  note?: ComponentChildren;
}

export default function List({
  locale,
  rows,
  label,
}: {
  locale: Locale;
  rows: ListRow[];
  label: string;
}) {
  return (
    <div class="list" role="list" aria-label={label}>
      {rows.map((r, i) => (
        <div key={i} class="row" role="listitem">
          <code>{r.text}</code>
          {r.note != null ? (
            <span class="note">{r.note}</span>
          ) : (
            <CopyButton locale={locale} text={r.text} />
          )}
        </div>
      ))}
    </div>
  );
}
