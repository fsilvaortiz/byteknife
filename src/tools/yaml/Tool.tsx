import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, tn, type Locale } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill, { type Tone } from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { convert, type ConvertResult, type YamlDir } from './logic';

const SAMPLE = `# Despliegue de ejemplo
servicio: pagos-api
version: 2.14.0
replicas: 3
imagen: &img registry.ejemplo.dev/pagos:2.14.0
recursos:
  cpu: 500m
  memoria: 512Mi
puertos:
  - nombre: http
    puerto: 8080
  - nombre: metricas
    puerto: 9090
env:
  LOG_LEVEL: info
  FEATURE_PIX: true
sidecar:
  imagen: *img
`;

const pill = (locale: Locale, r: ConvertResult, dir: YamlDir): { tone: Tone; text: string } =>
  r.ok
    ? {
        tone: 'neu',
        text: dir === 'y2j' ? tn(locale, 'yaml.docs', r.documents) : t(locale, 'yaml.validJson'),
      }
    : {
        tone: 'bad',
        text: t(locale, r.source === 'yaml' ? 'yaml.error' : 'json.error', { ...r.error }),
      };

export default function YamlTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [dir, setDir] = useState<YamlDir>(
    initialInput && /^\s*[[{]/.test(initialInput) ? 'j2y' : 'y2j',
  );
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const src = useDebounced(input);

  useEffect(() => {
    let live = true;
    convert(src, dir, indent).then((r) => live && setResult(r));
    return () => {
      live = false;
    };
  }, [src, dir, indent]);

  // Al cambiar de dirección, la salida actual pasa a ser la nueva entrada.
  const changeDir = (next: YamlDir) => {
    if (next === dir) return;
    if (result?.ok && input.trim()) setInput(result.output);
    setDir(next);
  };

  const output = result?.ok ? result.output : '';
  const inLabel = t(locale, dir === 'y2j' ? 'yaml.inYaml' : 'yaml.inJson');
  const outLabel = t(locale, dir === 'y2j' ? 'yaml.outJson' : 'yaml.outYaml');
  const status = result && src.trim() ? pill(locale, result, dir) : null;

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.direction')}
          value={dir}
          onChange={changeDir}
          options={[
            ['y2j', t(locale, 'yaml.y2j')],
            ['j2y', t(locale, 'yaml.j2y')],
          ]}
        />
        <label class="fld">
          {t(locale, 'json.indent')}
          <select value={indent} onChange={(e) => setIndent(Number(e.currentTarget.value))}>
            <option value={2}>{t(locale, 'json.indent2')}</option>
            <option value={4}>{t(locale, 'json.indent4')}</option>
          </select>
        </label>
        {status && <Pill tone={status.tone}>{status.text}</Pill>}
      </div>
      <div class="split">
        <Pane title={inLabel}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={inLabel}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane title={outLabel} actions={<CopyButton locale={locale} text={output} />}>
          <CodeOutput
            text={output}
            label={outLabel}
            {...(dir === 'y2j' && { highlight: 'json' as const })}
          />
        </Pane>
      </div>
    </>
  );
}
