import { useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, tn } from '../../i18n';
import Pill, { type Tone } from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import {
  isStatusCode,
  searchHeaders,
  searchStatuses,
  statusClass,
  type StatusClass,
} from './logic';

const TONE: Record<StatusClass, Tone> = {
  info: 'neu',
  success: 'ok',
  redirect: 'neu',
  client: 'warn',
  server: 'bad',
};

type Tab = 'status' | 'headers';

export default function HttpTool({ locale, initialInput }: ToolProps) {
  const [query, setQuery] = useState(initialInput?.trim() ?? '');
  const [tab, setTab] = useState<Tab>(
    initialInput && !isStatusCode(initialInput.trim()) ? 'headers' : 'status',
  );
  const q = useDebounced(query, 80);
  const statuses = tab === 'status' ? searchStatuses(q, locale) : [];
  const headers = tab === 'headers' ? searchHeaders(q, locale) : [];

  return (
    <>
      <div class="bar">
        <Segmented
          label={t(locale, 'http.tab')}
          value={tab}
          onChange={setTab}
          options={[
            ['status', t(locale, 'http.statuses')],
            ['headers', t(locale, 'http.headers')],
          ]}
        />
        <input
          type="search"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:200px"
          placeholder={t(locale, tab === 'status' ? 'http.searchStatus' : 'http.searchHeader')}
          aria-label={t(locale, 'http.search')}
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
        <Pill tone="neu">
          {tn(locale, 'http.results', tab === 'status' ? statuses.length : headers.length)}
        </Pill>
      </div>
      {tab === 'status' ? (
        <Table
          label={t(locale, 'http.statuses')}
          header={[t(locale, 'http.code'), t(locale, 'http.name'), t(locale, 'http.meaning')]}
          rows={statuses.map((st) => ({
            cells: [
              <Pill key="c" tone={TONE[statusClass(st.code)]}>
                {st.code}
              </Pill>,
              <span key="n">
                {st.name} <span class="note">· {st.spec}</span>
              </span>,
              st.text[locale],
            ],
          }))}
        />
      ) : (
        <Table
          label={t(locale, 'http.headers')}
          header={[
            t(locale, 'http.header'),
            t(locale, 'http.direction'),
            t(locale, 'http.meaning'),
          ]}
          rows={headers.map((x) => ({
            cells: [x.name, t(locale, `http.kind.${x.kind}`), x.text[locale]],
          }))}
        />
      )}
      {tab === 'status' && !q && <p class="note">{t(locale, 'http.classes')}</p>}
    </>
  );
}
