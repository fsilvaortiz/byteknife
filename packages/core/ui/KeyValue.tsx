import { Fragment, type ComponentChildren } from 'preact';
import type { Locale } from '../i18n';
import CopyButton from './CopyButton';

export interface KVRow {
  key: ComponentChildren;
  value: ComponentChildren;
  /** Texto a copiar; si falta, la fila no tiene botón. */
  copy?: string;
  /** Etiqueta del botón de copiar, si no es la estándar. */
  copyLabel?: string;
  mono?: boolean;
}

export default function KeyValue({ locale, rows }: { locale: Locale; rows: KVRow[] }) {
  return (
    <div class="kv">
      {rows.map((r, i) => (
        <Fragment key={i}>
          <div class={r.mono ? 'k mono' : 'k'}>{r.key}</div>
          <div class="v">{r.value}</div>
          <div class="c">
            {r.copy != null && <CopyButton locale={locale} text={r.copy} label={r.copyLabel} />}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
