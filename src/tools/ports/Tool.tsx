import { useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { isRisky, rangeOf, searchPorts } from './logic';

export default function PortsTool({ locale, initialInput }: ToolProps) {
  const [query, setQuery] = useState(initialInput?.trim() ?? '');
  const q = useDebounced(query, 80);
  const list = searchPorts(q, (p) => t(locale, `ports.cat.${p.category}`));
  const num = q.replace(/^(?:puerto|port|porta)\s+|^:/i, '').trim();
  const range = /^\d+$/.test(num) ? rangeOf(Number(num)) : null;

  return (
    <>
      <div class="bar">
        <input
          type="search"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:200px"
          placeholder={t(locale, 'ports.placeholder')}
          aria-label={t(locale, 'ports.search')}
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
        {range && (
          <Pill tone={range === 'invalid' ? 'bad' : 'neu'}>
            {t(locale, `ports.range.${range}`)}
          </Pill>
        )}
      </div>
      {list.length ? (
        <Table
          label={t(locale, 'ports.table')}
          header={[
            t(locale, 'ports.port'),
            t(locale, 'ports.proto'),
            t(locale, 'ports.service'),
            t(locale, 'ports.category'),
          ]}
          rows={list.map((p) => ({
            cells: [
              String(p.port),
              p.proto.toUpperCase(),
              <span key="s">
                {p.service}
                {p.note && <span class="note"> · {t(locale, `ports.note.${p.note}`)}</span>}
                {isRisky(p) && (
                  <>
                    {' '}
                    <Pill tone="warn">{t(locale, 'ports.risky')}</Pill>
                  </>
                )}
              </span>,
              t(locale, `ports.cat.${p.category}`),
            ],
          }))}
        />
      ) : (
        <p class="note">{t(locale, 'ports.none')}</p>
      )}
      <p class="note">{t(locale, 'ports.ranges')}</p>
    </>
  );
}
