import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, tn } from '../../i18n';
import CodeOutput from '../../ui/CodeOutput';
import CopyButton from '../../ui/CopyButton';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Segmented from '../../ui/Segmented';
import { useDebounced } from '../../ui/useDebounced';
import { useReady } from '../../ui/useReady';
import { DIALECTS, formatSql, type Dialect, type KeywordCase, type SqlResult } from './logic';

const SAMPLE = `select p.id, p.creado_en, c.nombre as cliente, sum(i.cantidad * i.precio) as total
from pedidos p join clientes c on c.id = p.cliente_id
left join items i on i.pedido_id = p.id
where p.estado in ('pagado', 'enviado') and p.creado_en >= now() - interval '30 days'
group by p.id, p.creado_en, c.nombre having sum(i.cantidad * i.precio) > 100
order by total desc limit 20;`;

// Nombres de producto: no se traducen. «sql» usa el texto i18n sql.standard.
const DIALECT_NAMES: Record<Exclude<Dialect, 'sql'>, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mariadb: 'MariaDB',
  sqlite: 'SQLite',
  transactsql: 'SQL Server (T-SQL)',
  plsql: 'Oracle PL/SQL',
  bigquery: 'BigQuery',
  snowflake: 'Snowflake',
  redshift: 'Redshift',
  spark: 'Spark SQL',
  trino: 'Trino / Presto',
  duckdb: 'DuckDB',
  clickhouse: 'ClickHouse',
};

// El primer resultado es asíncrono: ToolHost reserva la altura hasta useReady.
export const waitsForResult = true;

export default function SqlTool({ locale, initialInput, onReady }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const [dialect, setDialect] = useState<Dialect>('postgresql');
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [result, setResult] = useState<SqlResult | null>(null);
  const src = useDebounced(input, 150);

  useEffect(() => {
    let live = true;
    formatSql(src, { dialect, keywordCase, indent }).then((r) => live && setResult(r));
    return () => {
      live = false;
    };
  }, [src, dialect, keywordCase, indent]);

  const output = result?.ok ? result.output : '';

  useReady(result !== null, onReady);

  return (
    <>
      <div class="bar">
        <label class="fld">
          {t(locale, 'sql.dialect')}
          <select value={dialect} onChange={(e) => setDialect(e.currentTarget.value as Dialect)}>
            {DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d === 'sql' ? t(locale, 'sql.standard') : DIALECT_NAMES[d]}
              </option>
            ))}
          </select>
        </label>
        <Segmented
          label={t(locale, 'sql.keywords')}
          value={keywordCase}
          onChange={setKeywordCase}
          options={[
            ['upper', t(locale, 'sql.upper')],
            ['lower', t(locale, 'sql.lower')],
            ['preserve', t(locale, 'sql.preserve')],
          ]}
        />
        <label class="fld">
          {t(locale, 'json.indent')}
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.currentTarget.value) as 2 | 4)}
          >
            <option value={2}>{t(locale, 'json.indent2')}</option>
            <option value={4}>{t(locale, 'json.indent4')}</option>
          </select>
        </label>
      </div>
      <div class="split">
        <Pane title={t(locale, 'common.input')}>
          <textarea
            class="code"
            spellcheck={false}
            aria-label={t(locale, 'sql.input')}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </Pane>
        <Pane
          title={t(locale, 'common.result')}
          actions={
            <span>
              {result && src.trim() && (
                <Pill tone={result.ok ? 'neu' : 'bad'}>
                  {result.ok
                    ? tn(locale, 'sql.statements', result.statements)
                    : result.line
                      ? t(locale, 'yaml.error', {
                          detail: result.detail,
                          line: result.line,
                          column: result.column ?? 1,
                        })
                      : result.detail}
                </Pill>
              )}{' '}
              <CopyButton locale={locale} text={output} />
            </span>
          }
        >
          <CodeOutput text={output} label={t(locale, 'sql.output')} />
        </Pane>
      </div>
      {result && !result.ok && <p class="note">{t(locale, 'sql.dialectHint')}</p>}
    </>
  );
}
