import { tokenizeJson, type TokenType } from './highlight';

const CLASS: Record<TokenType, string | undefined> = {
  key: 'tk-k',
  string: 'tk-s',
  number: 'tk-n',
  bool: 'tk-b',
  plain: undefined,
};

export interface Segment {
  text: string;
  /** Resalta con <mark>; 1 usa el tono alternativo para separar coincidencias pegadas. */
  mark?: 0 | 1;
}

interface Props {
  text: string;
  /** En lugar de `text`: tramos con resaltado opcional. */
  segments?: Segment[];
  /** Ajusta líneas largas en vez de desplazar en horizontal. */
  wrap?: boolean;
  highlight?: 'json';
  label: string;
  style?: string;
  testId?: string;
}

export default function CodeOutput({
  text,
  segments,
  wrap,
  highlight,
  label,
  style,
  testId,
}: Props) {
  return (
    <pre
      class={wrap ? 'out wrapy' : 'out'}
      style={style}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-testid={testId}
    >
      {segments
        ? segments.map((sg, i) =>
            sg.mark === undefined ? (
              sg.text
            ) : (
              <mark key={i} class={sg.mark ? 'alt' : undefined}>
                {sg.text}
              </mark>
            ),
          )
        : highlight === 'json'
          ? tokenizeJson(text).map((tk, i) =>
              tk.type === 'plain' ? (
                tk.text
              ) : (
                <span key={i} class={CLASS[tk.type]}>
                  {tk.text}
                </span>
              ),
            )
          : text}
    </pre>
  );
}
