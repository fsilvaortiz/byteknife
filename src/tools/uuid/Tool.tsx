import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { relativeTime } from '../../core/relative';
import { t } from '../../i18n';
import CopyButton from '../../ui/CopyButton';
import KeyValue, { type KVRow } from '../../ui/KeyValue';
import List from '../../ui/List';
import Pane from '../../ui/Pane';
import Segmented from '../../ui/Segmented';
import { generateUuids, inspectUuid, MAX_BATCH, uuidV7, type GenerateOptions } from './logic';

export default function UuidTool({ locale, initialInput }: ToolProps) {
  const [version, setVersion] = useState<GenerateOptions['version']>('v4');
  const [count, setCount] = useState(8);
  const [upper, setUpper] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [probe, setProbe] = useState(() => initialInput ?? uuidV7(Date.now()).uuid);

  const generate = () => setIds(generateUuids(count, { version, upper, noHyphens }));
  // Cambiar versión u opciones regenera, como en el prototipo; la cantidad espera a «Generar».
  useEffect(generate, [version, upper, noHyphens]);

  const info = useMemo(() => (probe.trim() ? inspectUuid(probe) : undefined), [probe]);
  const rows: KVRow[] = [];
  if (info) {
    const version = info.special ? t(locale, `uuid.${info.special}`) : `v${info.version}`;
    rows.push(
      { key: t(locale, 'uuid.version'), value: version, copy: version },
      {
        key: t(locale, 'uuid.variant'),
        value: t(locale, `uuid.variant.${info.variant}`),
        copy: t(locale, `uuid.variant.${info.variant}`),
      },
      { key: t(locale, 'uuid.canonical'), value: info.canonical, copy: info.canonical },
    );
    if (info.date) {
      const iso = info.date.toISOString();
      rows.push({
        key: t(locale, 'uuid.date'),
        value: `${iso} · ${relativeTime(info.date, new Date(), locale)}`,
        copy: iso,
      });
    }
  }

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'uuid.version')}
          value={version}
          onChange={setVersion}
          options={[
            ['v4', t(locale, 'uuid.v4')],
            ['v7', t(locale, 'uuid.v7')],
          ]}
        />
        <label class="fld">
          {t(locale, 'uuid.count')}
          <input
            type="number"
            min={1}
            max={MAX_BATCH}
            style="width:76px"
            value={count}
            onInput={(e) => setCount(e.currentTarget.valueAsNumber)}
          />
        </label>
        <label class="chk">
          <input
            type="checkbox"
            checked={upper}
            onChange={(e) => setUpper(e.currentTarget.checked)}
          />
          {t(locale, 'common.uppercase')}
        </label>
        <label class="chk">
          <input
            type="checkbox"
            checked={noHyphens}
            onChange={(e) => setNoHyphens(e.currentTarget.checked)}
          />
          {t(locale, 'uuid.noHyphens')}
        </label>
        <button class="btn primary" type="button" onClick={generate}>
          {t(locale, 'common.generate')}
        </button>
        <CopyButton
          locale={locale}
          class="btn"
          text={() => ids.join('\n')}
          label={t(locale, 'common.copyAll')}
        />
      </div>
      <List
        locale={locale}
        label={t(locale, 'uuid.generated')}
        rows={ids.map((text) => ({ text }))}
      />
      <Pane title={t(locale, 'uuid.inspect')}>
        <div>
          <input
            type="text"
            class="code"
            style="width:100%"
            spellcheck={false}
            placeholder={t(locale, 'uuid.inspectPlaceholder')}
            aria-label={t(locale, 'uuid.inspect')}
            value={probe}
            onInput={(e) => setProbe(e.currentTarget.value)}
          />
          {info === null && (
            <p class="err" role="alert">
              {t(locale, 'uuid.invalid')}
            </p>
          )}
          {info && (
            <div style="margin-top:8px">
              <KeyValue locale={locale} rows={rows} />
            </div>
          )}
        </div>
      </Pane>
    </>
  );
}
