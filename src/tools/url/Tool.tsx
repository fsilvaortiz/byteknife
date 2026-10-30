import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import KeyValue from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { parseUrl, transformUrl, type UrlMode } from './logic';

const SAMPLE =
  'https://api.ejemplo.dev:8443/v2/usuarios/42?campos=nombre%2Cemail&orden=desc&q=caf%C3%A9+con+leche#perfil';

export default function UrlTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [mode, setMode] = useState<UrlMode>('dec');
  const src = useDebounced(input);

  const output = useMemo(() => {
    try {
      return { text: transformUrl(src, mode), error: false };
    } catch {
      return { text: '', error: true };
    }
  }, [src, mode]);
  const parts = useMemo(() => parseUrl(src), [src]);

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.mode')}
          value={mode}
          onChange={setMode}
          options={[
            ['dec', t(locale, 'url.decode')],
            ['enc', t(locale, 'url.encode')],
            ['encu', t(locale, 'url.encodeFull')],
          ]}
        />
      </div>
      <div class="split">
        <Pane title={t(locale, 'common.input')}>
          <textarea
            class="code"
            spellcheck={false}
            style="min-height:140px"
            aria-label={t(locale, 'common.input')}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane
          title={t(locale, 'common.result')}
          actions={<CopyButton locale={locale} text={output.text} />}
        >
          {output.error ? (
            <p class="err" role="alert">
              {t(locale, 'url.malformed')}
            </p>
          ) : (
            <CodeOutput
              text={output.text}
              wrap
              style="min-height:140px"
              label={t(locale, 'common.result')}
            />
          )}
        </Pane>
      </div>
      {parts && (
        <div class="split">
          <Pane title={t(locale, 'url.parts')}>
            <KeyValue
              locale={locale}
              rows={[
                [t(locale, 'url.protocol'), parts.protocol],
                [t(locale, 'url.host'), parts.host],
                [t(locale, 'url.port'), parts.port || t(locale, 'url.defaultPort')],
                [t(locale, 'url.path'), parts.path],
                [t(locale, 'url.hash'), parts.hash || '—'],
                [t(locale, 'url.origin'), parts.origin],
              ].map(([key, value]) => ({ key, value, copy: value! }))}
            />
          </Pane>
          <Pane title={t(locale, 'url.params', { count: parts.params.length })}>
            {parts.params.length ? (
              <KeyValue
                locale={locale}
                rows={parts.params.map(([key, value]) => ({ key, value, copy: value, mono: true }))}
              />
            ) : (
              <p class="note">{t(locale, 'url.noParams')}</p>
            )}
          </Pane>
        </div>
      )}
    </>
  );
}
