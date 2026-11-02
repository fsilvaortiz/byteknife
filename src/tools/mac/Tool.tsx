import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import Pill from '../../ui/Pill';
import { useDebounced } from '../../ui/useDebounced';
import {
  eui64,
  formats,
  info,
  linkLocal,
  MacError,
  parseMac,
  parseOui,
  vendor,
  type OuiTable,
} from './logic';

const SAMPLE = '3C:22:FB:7A:91:0E';

export default function MacTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [table, setTable] = useState<OuiTable | null>(null);
  const src = useDebounced(input, 100);

  // La base OUI (~500 KB) se carga solo aquí y queda en la caché del service worker.
  useEffect(() => {
    let live = true;
    import('virtual:oui').then((m) => live && setTable(parseOui(m.default)));
    return () => {
      live = false;
    };
  }, []);

  const bytes = useMemo(() => {
    try {
      return parseMac(src);
    } catch (e) {
      if (!(e instanceof MacError)) throw e;
      return null;
    }
  }, [src]);

  const rows: KVRow[] = [];
  if (bytes) {
    const f = formats(bytes);
    const flags = info(bytes);
    const v = table ? vendor(bytes, table) : null;
    rows.push({
      key: t(locale, 'mac.vendor'),
      value: table
        ? (v ?? t(locale, flags.local ? 'mac.vendorLocal' : 'mac.vendorUnknown'))
        : t(locale, 'mac.loading'),
      ...(v && { copy: v }),
    });
    rows.push({ key: t(locale, 'mac.colon'), value: f.colon, copy: f.colon });
    rows.push({ key: t(locale, 'mac.hyphen'), value: f.hyphen, copy: f.hyphen });
    rows.push({ key: 'Cisco', value: f.cisco, copy: f.cisco });
    rows.push({ key: t(locale, 'mac.bare'), value: f.bare, copy: f.bare });
    rows.push({ key: 'EUI-64', value: eui64(bytes), copy: eui64(bytes) });
    rows.push({ key: t(locale, 'mac.linkLocal'), value: linkLocal(bytes), copy: linkLocal(bytes) });
  }
  const flags = bytes && info(bytes);

  return (
    <>
      <div class="bar">
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:200px"
          placeholder="3C:22:FB:7A:91:0E, 3c22.fb7a.910e"
          aria-label={t(locale, 'mac.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        {!bytes && src.trim() && <Pill tone="bad">{t(locale, 'mac.invalid')}</Pill>}
        {flags && (
          <>
            <Pill tone="neu">{t(locale, flags.multicast ? 'mac.multicast' : 'mac.unicast')}</Pill>
            <Pill tone={flags.local ? 'warn' : 'neu'}>
              {t(locale, flags.local ? 'mac.local' : 'mac.universal')}
            </Pill>
            {flags.broadcast && <Pill tone="neu">{t(locale, 'mac.broadcast')}</Pill>}
          </>
        )}
      </div>
      {bytes && <KeyValue locale={locale} rows={rows} />}
      {flags?.local && <p class="note">{t(locale, 'mac.localNote')}</p>}
    </>
  );
}
