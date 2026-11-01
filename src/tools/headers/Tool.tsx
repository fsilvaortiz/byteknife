import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type MessageKey } from '../../i18n';
import Pane from '../../ui/Pane';
import Pill, { type Tone } from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { audit, headerInfo, parseMessage, statusName, type Level } from './logic';

const SAMPLE = `HTTP/2 200
date: Sat, 31 Oct 2026 12:00:00 GMT
content-type: text/html; charset=utf-8
cache-control: private, max-age=0, no-cache
server: nginx/1.24.0
x-powered-by: Express
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
set-cookie: session=8f3a21; Path=/; HttpOnly
access-control-allow-origin: *
vary: Accept-Encoding`;

const TONE: Record<Level, Tone> = { ok: 'ok', warn: 'warn', bad: 'bad', info: 'neu' };
const MARK: Record<Level, string> = { ok: '✓', warn: '!', bad: '✗', info: 'i' };

export default function HeadersTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input, 150);
  const msg = useMemo(() => parseMessage(src), [src]);
  const findings = useMemo(() => audit(msg), [msg]);
  const name = msg.status !== null ? statusName(msg.status) : null;

  return (
    <>
      <Pane
        title={t(locale, 'hdr.input')}
        actions={
          <span>
            {msg.status !== null && (
              <Pill tone={msg.status < 400 ? 'ok' : 'bad'}>
                {msg.status} {name ?? ''}
              </Pill>
            )}{' '}
            <Pill tone="neu">{t(locale, `hdr.kind.${msg.kind}`)}</Pill>
          </span>
        }
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:200px"
          aria-label={t(locale, 'hdr.input')}
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
                t(locale, `hdr.f.${f.key}` as MessageKey, f.params),
              ],
            }))}
          />
        </Pane>
      )}
      {msg.headers.length > 0 ? (
        <Table
          label={t(locale, 'hdr.table')}
          header={[t(locale, 'http.header'), t(locale, 'hdr.value'), t(locale, 'http.meaning')]}
          rows={msg.headers.map((h) => ({
            cells: [h.name, h.value, headerInfo(h.name)?.text[locale] ?? ''],
          }))}
        />
      ) : (
        src.trim() && <p class="note">{t(locale, 'hdr.none')}</p>
      )}
    </>
  );
}
