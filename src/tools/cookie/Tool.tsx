import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { relativeTime } from '../../core/relative';
import { t, type Locale, type MessageKey } from '../../i18n';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill, { type Tone } from '../../ui/Pill';
import { useDebounced } from '../../ui/useDebounced';
import {
  audit,
  decodeValue,
  expiry,
  parseCookies,
  valueHint,
  type Level,
  type SetCookie,
} from './logic';

const SAMPLE = `Set-Cookie: __Host-session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MjEifQ.k3Y; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
Set-Cookie: tema=oscuro%20azul; Path=/; Expires=Fri, 31 Dec 2027 23:59:59 GMT
Set-Cookie: tracking=abc123; Domain=.ejemplo.dev; SameSite=None`;

const TONE: Record<Level, Tone> = { ok: 'ok', warn: 'warn', bad: 'bad', info: 'neu' };

function CookieCard({ locale, c }: { locale: Locale; c: SetCookie }) {
  const now = new Date();
  const exp = expiry(c, now);
  const decoded = decodeValue(c.value);
  const hint = valueHint(c.value);
  const flag = (on: boolean) => t(locale, on ? 'cookie.yes' : 'cookie.no');
  const rows: KVRow[] = [
    { key: t(locale, 'cookie.value'), value: c.value || '—', copy: c.value, mono: true },
  ];
  if (decoded !== c.value)
    rows.push({ key: t(locale, 'cookie.decoded'), value: decoded, copy: decoded });
  rows.push({
    key: t(locale, 'cookie.expires'),
    value:
      exp.kind === 'at'
        ? `${exp.date!.toISOString()} (${relativeTime(exp.date!, now, locale)})`
        : t(locale, `cookie.exp.${exp.kind}`),
  });
  rows.push({ key: 'Domain', value: c.domain ?? t(locale, 'cookie.hostOnly') });
  rows.push({ key: 'Path', value: c.path ?? '—' });
  rows.push({ key: 'Secure', value: flag(c.secure) });
  rows.push({ key: 'HttpOnly', value: flag(c.httpOnly) });
  rows.push({ key: 'SameSite', value: c.sameSite ?? t(locale, 'cookie.sameSiteDefault') });
  if (c.partitioned) rows.push({ key: 'Partitioned', value: flag(true) });
  if (c.priority) rows.push({ key: 'Priority', value: c.priority });
  return (
    <Pane
      title={c.name || '—'}
      actions={hint && <Pill tone="neu">{t(locale, `cookie.hint.${hint}`)}</Pill>}
    >
      <KeyValue locale={locale} rows={rows} />
      <ul class="findings">
        {audit(c).map((f) => (
          <li key={f.key}>
            <Pill tone={TONE[f.level]}>{t(locale, `cookie.f.${f.key}` as MessageKey)}</Pill>
          </li>
        ))}
      </ul>
    </Pane>
  );
}

export default function CookieTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input, 150);
  const parsed = useMemo(() => parseCookies(src), [src]);

  return (
    <>
      <Pane title={t(locale, 'cookie.input')}>
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:120px"
          aria-label={t(locale, 'cookie.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      {parsed.setCookies.map((c, i) => (
        <CookieCard key={i} locale={locale} c={c} />
      ))}
      {parsed.pairs.length > 0 && (
        <Pane title={t(locale, 'cookie.pairs', { count: parsed.pairs.length })}>
          <KeyValue
            locale={locale}
            rows={parsed.pairs.map(([k, v]) => ({ key: k || '—', value: v, copy: v, mono: true }))}
          />
        </Pane>
      )}
    </>
  );
}
