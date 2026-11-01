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
import {
  ALGORITHMS,
  exportKeyPair,
  generateKeyPair,
  type Algorithm,
  type KeyPairOutput,
} from './logic';

type Format = 'ssh' | 'pem' | 'jwk';

const pick = (out: KeyPairOutput, side: 'public' | 'private', fmt: Format) =>
  out[`${side}${fmt === 'ssh' ? 'Ssh' : fmt === 'pem' ? 'Pem' : 'Jwk'}`];

// El primer resultado es asíncrono: ToolHost reserva la altura hasta useReady.
export const waitsForResult = true;

export default function KeyPairTool({ locale, onReady }: ToolProps) {
  const [alg, setAlg] = useState<Algorithm>('ed25519');
  const [comment, setComment] = useState('');
  const [fmt, setFmt] = useState<Format>('ssh');
  const [pair, setPair] = useState<CryptoKeyPair | null>(null);
  const [out, setOut] = useState<KeyPairOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const label = useDebounced(comment);

  const generate = () => {
    setBusy(true);
    setFailed(false);
    generateKeyPair(alg).then(
      (p) => {
        setPair(p);
        setBusy(false);
      },
      () => {
        setFailed(true);
        setBusy(false);
      },
    );
  };
  useEffect(generate, [alg]);

  useEffect(() => {
    if (!pair) return;
    let live = true;
    exportKeyPair(alg, pair, label).then((o) => live && setOut(o));
    return () => {
      live = false;
    };
  }, [pair, label]);

  const show = (side: 'public' | 'private') => (out ? pick(out, side, fmt) : '');

  const formats: [Format, string][] = [
    ['ssh', 'OpenSSH'],
    ['pem', t(locale, 'kp.pem')],
    ['jwk', 'JWK'],
  ];

  useReady(out !== null || failed, onReady);

  return (
    <>
      <div class="bar">
        <label class="fld">
          {t(locale, 'kp.algorithm')}
          <select value={alg} onChange={(e) => setAlg(e.currentTarget.value as Algorithm)}>
            {ALGORITHMS.map((a) => (
              <option key={a} value={a}>
                {t(locale, `kp.alg.${a}`)}
              </option>
            ))}
          </select>
        </label>
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:160px"
          placeholder={t(locale, 'kp.commentPlaceholder')}
          aria-label={t(locale, 'kp.comment')}
          value={comment}
          onInput={(e) => setComment(e.currentTarget.value)}
        />
        <button class="btn primary" type="button" onClick={generate} disabled={busy}>
          {t(locale, 'kp.regenerate')}
        </button>
      </div>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.format')}
          value={fmt}
          onChange={setFmt}
          options={formats}
        />
        {busy && <Pill tone="neu">{t(locale, 'kp.working')}</Pill>}
        {!busy && out && <Pill tone="ok">{out.fingerprint}</Pill>}
      </div>
      {failed && (
        <p class="err" role="alert">
          {t(locale, 'kp.unsupported')}
        </p>
      )}
      {/* Los paneles existen desde el inicio, vacíos, para que nada salte al generar. */}
      <div class="split">
        <Pane
          title={t(locale, 'kp.public')}
          actions={<CopyButton locale={locale} text={show('public')} />}
        >
          <CodeOutput
            text={show('public')}
            wrap
            style="min-height:220px"
            label={t(locale, 'kp.public')}
          />
        </Pane>
        <Pane
          title={t(locale, 'kp.private')}
          actions={<CopyButton locale={locale} text={show('private')} />}
        >
          <CodeOutput
            text={show('private')}
            wrap
            style="min-height:220px"
            label={t(locale, 'kp.private')}
          />
        </Pane>
      </div>
      <p class="note">{t(locale, fmt === 'ssh' ? 'kp.noteSsh' : 'kp.notePkcs')}</p>
    </>
  );
}
