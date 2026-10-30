import { tokenizeJson, type TokenType } from './highlight';

const CLASS: Record<TokenType, string | undefined> = {
  key: 'tk-k',
  string: 'tk-s',
  number: 'tk-n',
  bool: 'tk-b',
  plain: undefined,
};

interface Props {
  text: string;
  /** Ajusta líneas largas en vez de desplazar en horizontal. */
  wrap?: boolean;
  highlight?: 'json';
  label: string;
  style?: string;
  testId?: string;
}

export default function CodeOutput({ text, wrap, highlight, label, style, testId }: Props) {
  return (
    <pre
      class={wrap ? 'out wrapy' : 'out'}
      style={style}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-testid={testId}
    >
      {highlight === 'json'
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
