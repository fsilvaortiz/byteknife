import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import {
  contrast,
  makePng,
  makeQr,
  QrError,
  svgDataUrl,
  wifiPayload,
  type Level,
  type QrResult,
  type WifiSecurity,
} from './logic';

type Mode = 'text' | 'wifi';

export default function QrTool({ locale, initialInput }: ToolProps) {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState(initialInput ?? 'https://byteknife.dev');
  const [ssid, setSsid] = useState('Oficina-5G');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState<WifiSecurity>('WPA');
  const [hidden, setHidden] = useState(false);
  const [level, setLevel] = useState<Level>('M');
  const [dark, setDark] = useState('#0d1310');
  const [light, setLight] = useState('#ffffff');
  const [result, setResult] = useState<QrResult | QrError | null>(null);

  const payload = mode === 'text' ? text : wifiPayload(ssid, password, security, hidden);
  const data = useDebounced(payload, 150);
  const opts = { level, margin: 4, dark, light };

  useEffect(() => {
    let live = true;
    makeQr(data, opts).then(
      (r) => live && setResult(r),
      (e: unknown) => {
        if (!(e instanceof QrError)) throw e;
        if (live) setResult(e);
      },
    );
    return () => {
      live = false;
    };
  }, [data, level, dark, light]);

  const download = async (kind: 'svg' | 'png') => {
    if (!result || result instanceof QrError) return;
    const a = document.createElement('a');
    a.href = kind === 'svg' ? svgDataUrl(result.svg) : await makePng(data, opts);
    a.download = `qr.${kind}`;
    a.click();
  };

  const lowContrast = contrast(dark, light) < 4;

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'common.mode')}
          value={mode}
          onChange={setMode}
          options={[
            ['text', t(locale, 'qr.text')],
            ['wifi', 'Wi-Fi'],
          ]}
        />
        <label class="fld">
          {t(locale, 'qr.level')}
          <select value={level} onChange={(e) => setLevel(e.currentTarget.value as Level)}>
            {(['L', 'M', 'Q', 'H'] as const).map((l) => (
              <option key={l} value={l}>
                {t(locale, `qr.level.${l}`)}
              </option>
            ))}
          </select>
        </label>
        <label class="fld">
          {t(locale, 'qr.dark')}
          <input type="color" value={dark} onInput={(e) => setDark(e.currentTarget.value)} />
        </label>
        <label class="fld">
          {t(locale, 'qr.light')}
          <input type="color" value={light} onInput={(e) => setLight(e.currentTarget.value)} />
        </label>
      </div>
      <div class="split">
        <Pane title={t(locale, 'qr.content')}>
          {mode === 'text' ? (
            <textarea
              class="code"
              spellcheck={false}
              style="min-height:160px"
              aria-label={t(locale, 'qr.textLabel')}
              value={text}
              onInput={(e) => setText(e.currentTarget.value)}
            />
          ) : (
            <div class="stack">
              <label class="fld">
                {t(locale, 'qr.ssid')}
                <input
                  type="text"
                  class="code"
                  value={ssid}
                  onInput={(e) => setSsid(e.currentTarget.value)}
                />
              </label>
              <label class="fld">
                {t(locale, 'qr.security')}
                <select
                  value={security}
                  onChange={(e) => setSecurity(e.currentTarget.value as WifiSecurity)}
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">{t(locale, 'qr.open')}</option>
                </select>
              </label>
              {security !== 'nopass' && (
                <label class="fld">
                  {t(locale, 'qr.password')}
                  <input
                    type="text"
                    class="code"
                    autoComplete="off"
                    value={password}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                  />
                </label>
              )}
              <label class="chk">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(e) => setHidden(e.currentTarget.checked)}
                />
                {t(locale, 'qr.hidden')}
              </label>
              <p class="note">{t(locale, 'qr.wifiNote')}</p>
            </div>
          )}
        </Pane>
        <Pane
          title={t(locale, 'qr.code')}
          actions={
            result && !(result instanceof QrError) ? (
              <span>
                <button class="ghost" type="button" onClick={() => download('svg')}>
                  SVG
                </button>
                <button class="ghost" type="button" onClick={() => download('png')}>
                  PNG
                </button>
              </span>
            ) : null
          }
        >
          {result instanceof QrError ? (
            <p class="err" role="alert">
              {t(locale, `qr.err.${result.code}`)}
            </p>
          ) : (
            result && (
              <>
                <div
                  class="qr"
                  role="img"
                  aria-label={t(locale, 'qr.code')}
                  // SVG generado por la librería qrcode a partir del texto: solo rectángulos.
                  dangerouslySetInnerHTML={{ __html: result.svg }}
                />
                <div class="bar">
                  <Pill tone="neu">
                    {t(locale, 'qr.info', { version: result.version, size: result.size })}
                  </Pill>
                  {lowContrast && <Pill tone="warn">{t(locale, 'qr.lowContrast')}</Pill>}
                </div>
              </>
            )
          )}
        </Pane>
      </div>
    </>
  );
}
