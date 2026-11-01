import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { useReady } from '../../ui/useReady';
import { renderMarkdown, stats } from './logic';

const SAMPLE = `# Notas de la versión 2.15

La API de **pagos** ahora acepta Pix y responde más rápido.

## Cambios

- [x] Nuevo endpoint \`POST /v2/pix\`
- [x] Límite de 1500 rps (antes 1200)
- [ ] Reportes por correo

| Región    | Latencia p95 |
|-----------|-------------:|
| sa-east-1 |        84 ms |
| us-east-1 |       112 ms |

> Migra antes del **30 de noviembre**: la v1 deja de responder.

\`\`\`bash
curl -X POST https://api.ejemplo.dev/v2/pix -d '{"monto": 1500}'
\`\`\`

Más detalles en [la documentación](https://docs.ejemplo.dev/pix).
`;

type View = 'preview' | 'html';

// El primer resultado es asíncrono: ToolHost reserva la altura hasta useReady.
export const waitsForResult = true;

export default function MarkdownTool({ locale, initialInput, onReady }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [view, setView] = useState<View>('preview');
  const [html, setHtml] = useState('');
  const src = useDebounced(input, 150);

  useEffect(() => {
    let live = true;
    renderMarkdown(src, { blockedImage: (alt) => t(locale, 'md.blocked', { alt }) }).then(
      (out) => live && setHtml(out),
    );
    return () => {
      live = false;
    };
  }, [src, locale]);

  const s = stats(src);

  useReady(html !== '' || !src.trim(), onReady);

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.mode')}
          value={view}
          onChange={setView}
          options={[
            ['preview', t(locale, 'md.preview')],
            ['html', 'HTML'],
          ]}
        />
        <Pill tone="neu">{t(locale, 'md.stats', { words: s.words, minutes: s.minutes })}</Pill>
      </div>
      <div class="split">
        <Pane title="Markdown">
          <textarea
            class="code"
            spellcheck={false}
            style="min-height:360px"
            aria-label={t(locale, 'md.input')}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane
          title={t(locale, view === 'preview' ? 'md.preview' : 'md.html')}
          actions={<CopyButton locale={locale} text={html} label={t(locale, 'md.copyHtml')} />}
        >
          {view === 'preview' ? (
            <div
              class="md-preview"
              role="region"
              aria-label={t(locale, 'md.preview')}
              tabIndex={0}
              // El HTML viene de renderMarkdown: sin HTML crudo, sin javascript: y sin imágenes externas.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <CodeOutput text={html} label={t(locale, 'md.html')} style="min-height:360px" />
          )}
        </Pane>
      </div>
    </>
  );
}
