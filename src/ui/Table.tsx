import type { ComponentChildren } from 'preact';

export interface TableRow {
  /** Fondo y prefijo + / − (estilos de .diff). */
  tone?: 'add' | 'del' | 'eq';
  /** Columnas de número de línea a la izquierda. */
  numbers?: (number | string | null)[];
  cells: ComponentChildren[];
}

interface Props {
  label: string;
  header?: ComponentChildren[];
  rows: TableRow[];
  style?: string;
}

/** Tabla monoespaciada con el estilo de diff; la usan Regex (grupos) y Diff. */
export default function Table({ label, header, rows, style }: Props) {
  return (
    <div class="diff" style={style} role="region" aria-label={label} tabIndex={0}>
      <table>
        {header && (
          <thead>
            <tr>
              {header.map((h, i) => (
                <th key={i} class={i === 0 ? 'ln' : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} class={r.tone}>
              {r.numbers?.map((n, j) => (
                <td key={`n${j}`} class="ln">
                  {n ?? ''}
                </td>
              ))}
              {r.cells.map((c, j) => (
                <td key={j} class={r.tone ? 't' : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
