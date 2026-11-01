import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { CurlError, generate, parseCurl, type Request, type Target } from './logic';

const SAMPLE = `curl -X POST 'https://api.ejemplo.dev/v2/pedidos?notificar=true' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.demo.firma' \\
  -H 'Content-Type: application/json' \\
  -d '{"cliente": 4821, "items": [{"sku": "TEC-01", "cantidad": 2}], "regalo": false}'`;

const TARGETS: [Target, string][] = [
  ['fetch', 'JavaScript fetch'],
  ['python', 'Python requests'],
  ['java', 'Java HttpClient'],
  ['go', 'Go net/http'],
];

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export default function CurlTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [target, setTarget] = useState<Target>('fetch');
  const src = useDebounced(input, 150);

  const parsed = useMemo((): Request | CurlError => {
    try {
      return parseCurl(src);
    } catch (e) {
      if (!(e instanceof CurlError)) throw e;
      return e;
    }
  }, [src]);

  const req = parsed instanceof CurlError ? null : parsed;
  const out = req ? generate(req, target) : '';

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'curl.target')}
          value={target}
          onChange={setTarget}
          options={TARGETS}
        />
        {req && (
          <Pill tone="neu">
            {req.method} {hostOf(req.url)}
          </Pill>
        )}
        {parsed instanceof CurlError && src.trim() && (
          <Pill tone="bad">{t(locale, `curl.err.${parsed.code}`, parsed.params)}</Pill>
        )}
      </div>
      <div class="split">
        <Pane title={t(locale, 'curl.input')}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'curl.input')}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane title={t(locale, 'curl.output')} actions={<CopyButton locale={locale} text={out} />}>
          <CodeOutput text={out} label={t(locale, 'curl.output')} />
        </Pane>
      </div>
      {req?.body?.kind === 'multipart' && target === 'java' && (
        <p class="note">{t(locale, 'curl.multipartJava')}</p>
      )}
      {req?.insecure && target !== 'fetch' && <p class="note">{t(locale, 'curl.insecure')}</p>}
    </>
  );
}
