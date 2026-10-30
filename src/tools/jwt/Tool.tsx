import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { relativeTime } from '../../core/relative';
import { t } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import KeyValue from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import { useDebounced } from '../../ui/useDebounced';
import {
  dateClaims,
  decodeJwt,
  JwtError,
  jwtStatus,
  verifyHmac,
  type DecodedJwt,
  type Verification,
} from './logic';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOGYzYTIxIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImVtYWlsIjoiYWRhQGVqZW1wbG8uZGV2Iiwicm9sZXMiOlsiYWRtaW4iLCJkZXYiXSwiaWF0IjoxNzkyNTQwODAwLCJleHAiOjE4MzAyOTc2MDB9.80xahJwPRarA9O2w9o-NaTMcwxhsChNjaL6o7UjBXII';
const DEMO_SECRET = 'byteknife-demo-secret';

const pretty = (o: object) => JSON.stringify(o, null, 2);

export default function JwtTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  // El secreto demo solo acompaña al token de ejemplo.
  const [secret, setSecret] = useState(initialInput ? '' : DEMO_SECRET);
  const token = useDebounced(input);
  const key = useDebounced(secret, 200);

  const decoded = useMemo((): { jwt: DecodedJwt } | { error: JwtError['code'] } => {
    try {
      return { jwt: decodeJwt(token) };
    } catch (e) {
      if (!(e instanceof JwtError)) throw e;
      return { error: e.code };
    }
  }, [token]);
  const jwt = 'jwt' in decoded ? decoded.jwt : null;

  const [verification, setVerification] = useState<Verification | null>(null);
  useEffect(() => {
    setVerification(null);
    if (!jwt) return;
    let live = true;
    verifyHmac(jwt, key).then(
      (v) => live && setVerification(v),
      () => live && setVerification({ result: 'invalid' }),
    );
    return () => {
      live = false;
    };
  }, [jwt, key]);

  const now = new Date();
  const status = jwt && jwtStatus(jwt.payload, now);
  const claims = jwt ? dateClaims(jwt.payload) : [];

  return (
    <>
      <Pane
        title={t(locale, 'jwt.token')}
        actions={
          jwt && status ? (
            <span>
              <Pill tone="neu">{String(jwt.header['alg'] ?? t(locale, 'jwt.noAlg'))}</Pill>{' '}
              {status.expired === true && <Pill tone="bad">{t(locale, 'jwt.expired')}</Pill>}
              {status.expired === false && <Pill tone="ok">{t(locale, 'jwt.active')}</Pill>}
              {status.notYetValid && <Pill tone="warn">{t(locale, 'jwt.notYet')}</Pill>}
            </span>
          ) : (
            'error' in decoded && (
              <Pill tone="bad">
                {t(locale, 'jwt.unreadable', { reason: t(locale, `jwt.err.${decoded.error}`) })}
              </Pill>
            )
          )
        }
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:96px;word-break:break-all"
          aria-label={t(locale, 'jwt.token')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </Pane>
      <div class="split">
        {(['header', 'payload'] as const).map((part) => {
          const text = jwt ? pretty(jwt[part]) : '';
          return (
            <Pane
              key={part}
              title={t(locale, `jwt.${part}`)}
              actions={<CopyButton locale={locale} text={text} />}
            >
              <CodeOutput
                text={text}
                highlight="json"
                style="min-height:0"
                label={t(locale, `jwt.${part}`)}
              />
            </Pane>
          );
        })}
      </div>
      <div class="split">
        <Pane title={t(locale, 'jwt.dates')}>
          {claims.length ? (
            <KeyValue
              locale={locale}
              rows={claims.map(({ claim, date }) => ({
                key: t(locale, `jwt.claim.${claim}`),
                value: (
                  <>
                    {date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                    <br />
                    <span class="note">{relativeTime(date, now, locale)}</span>
                  </>
                ),
                copy: date.toISOString(),
                copyLabel: t(locale, 'jwt.iso'),
              }))}
            />
          ) : (
            jwt && <p class="note">{t(locale, 'jwt.noDates')}</p>
          )}
        </Pane>
        <Pane
          title={t(locale, 'jwt.verify')}
          actions={
            verification &&
            verification.result !== 'noSecret' &&
            (verification.result === 'unsupported' ? (
              <Pill tone="neu">{t(locale, 'jwt.sig.unsupported', { alg: verification.alg })}</Pill>
            ) : (
              <Pill tone={verification.result === 'valid' ? 'ok' : 'bad'}>
                {t(locale, `jwt.sig.${verification.result}`)}
              </Pill>
            ))
          }
        >
          <div>
            <input
              type="text"
              class="code"
              style="width:100%"
              spellcheck={false}
              autocomplete="off"
              placeholder={t(locale, 'jwt.secret')}
              aria-label={t(locale, 'jwt.secret')}
              value={secret}
              onInput={(e) => setSecret(e.currentTarget.value)}
            />
            <p class="note">
              {!initialInput && (
                <>
                  {t(locale, 'jwt.demoSecret')} <code>{DEMO_SECRET}</code>.{' '}
                </>
              )}
              {t(locale, 'jwt.secretLocal')}
            </p>
          </div>
        </Pane>
      </div>
    </>
  );
}
