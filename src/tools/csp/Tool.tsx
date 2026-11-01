import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type MessageKey } from '../../i18n';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill, { type Tone } from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { analyze, DIRECTIVES, parsePolicy, serialize, type Level } from './logic';

const SAMPLE = `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.ejemplo.dev; frame-ancestors 'none'`;

const TONE: Record<Level, Tone> = { ok: 'ok', warn: 'warn', bad: 'bad', info: 'neu' };
const MARK: Record<Level, string> = { ok: '✓', warn: '!', bad: '✗', info: 'i' };

export default function CspTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input, 150);
  const policy = useMemo(() => parsePolicy(src), [src]);
  const findings = useMemo(() => analyze(policy), [policy]);
  const bad = findings.filter((f) => f.level === 'bad').length;
  const warn = findings.filter((f) => f.level === 'warn').length;

  return (
    <>
      <Pane
        title={t(locale, 'csp.input')}
        actions={
          policy.directives.length > 0 && (
            <span>
              <Pill tone={bad ? 'bad' : warn ? 'warn' : 'ok'}>
                {t(locale, 'csp.summary', { bad, warn })}
              </Pill>{' '}
              <CopyButton
                locale={locale}
                text={serialize(policy)}
                label={t(locale, 'csp.copyClean')}
              />
            </span>
          )
        }
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:120px"
          aria-label={t(locale, 'csp.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      {findings.length > 0 && (
        <Pane title={t(locale, 'hdr.audit')}>
          <Table
            label={t(locale, 'hdr.audit')}
            rows={findings.map((f) => ({
              cells: [
                <Pill key="l" tone={TONE[f.level]}>
                  {MARK[f.level]}
                </Pill>,
                t(locale, `csp.f.${f.key}` as MessageKey, f.params),
              ],
            }))}
          />
        </Pane>
      )}
      {policy.directives.length > 0 && (
        <Table
          label={t(locale, 'csp.directives')}
          header={[t(locale, 'csp.directive'), t(locale, 'csp.sources'), t(locale, 'http.meaning')]}
          rows={policy.directives.map((d) => ({
            cells: [d.name, d.sources.join(' ') || '—', DIRECTIVES[d.name]?.[locale] ?? ''],
          }))}
        />
      )}
    </>
  );
}
