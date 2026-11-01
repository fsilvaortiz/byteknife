import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, tn } from '../../i18n';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { useReady } from '../../ui/useReady';
import { parseErrorPosition, stripBom } from '../json/logic';
import { draftOf, DRAFTS, validate, type Draft, type SchemaError } from './logic';

const SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "email", "plan"],
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "email": { "type": "string", "format": "email" },
    "plan": { "enum": ["free", "pro", "team"] },
    "tags": { "type": "array", "items": { "type": "string" }, "uniqueItems": true }
  },
  "additionalProperties": false
}`;

const DOC = `{
  "id": 0,
  "email": "ana.ejemplo.dev",
  "plan": "enterprise",
  "tags": ["beta", "beta"],
  "activo": true
}`;

type Parsed = { ok: true; value: unknown } | { ok: false; message: string };

function parse(src: string, locale: Parameters<typeof t>[0]): Parsed {
  const text = stripBom(src);
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, message: t(locale, 'json.error', { ...parseErrorPosition(e, text) }) };
  }
}

// El primer resultado es asíncrono: ToolHost reserva la altura hasta useReady.
export const waitsForResult = true;

export default function JsonSchemaTool({ locale, initialInput, onReady }: ToolProps) {
  const [schemaText, setSchemaText] = useState(SCHEMA);
  const [docText, setDocText] = useState(initialInput ?? DOC);
  const [draft, setDraft] = useState<Draft | 'auto'>('auto');
  const [errors, setErrors] = useState<SchemaError[] | null>(null);
  const s = useDebounced(schemaText, 200);
  const d = useDebounced(docText, 200);

  const schema = useMemo(() => parse(s, locale), [s, locale]);
  const doc = useMemo(() => parse(d, locale), [d, locale]);
  const effective = schema.ok ? (draft === 'auto' ? draftOf(schema.value) : draft) : null;

  useEffect(() => {
    setErrors(null);
    if (!schema.ok || !doc.ok || !effective) return;
    let live = true;
    validate(schema.value, doc.value, effective).then(
      (r) => live && setErrors(r),
      () =>
        live &&
        setErrors([
          { path: '', keyword: 'schema', schemaPath: '', message: t(locale, 'jschema.badSchema') },
        ]),
    );
    return () => {
      live = false;
    };
  }, [schema, doc, effective, locale]);

  useReady(errors !== null || !schema.ok || !doc.ok, onReady);

  return (
    <>
      <div class="bar">
        <label class="fld">
          Draft
          <select value={draft} onChange={(e) => setDraft(e.currentTarget.value as Draft | 'auto')}>
            <option value="auto">
              {t(locale, 'jschema.auto', { draft: effective ?? '2020-12' })}
            </option>
            {DRAFTS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div class="split">
        <Pane title={t(locale, 'jschema.schema')}>
          <textarea
            class="code"
            spellcheck={false}
            style="min-height:260px"
            aria-label={t(locale, 'jschema.schema')}
            value={schemaText}
            onInput={(e) => setSchemaText(e.currentTarget.value)}
          />
          {!schema.ok && (
            <p class="err" role="alert">
              {schema.message}
            </p>
          )}
        </Pane>
        <Pane
          title={t(locale, 'jschema.document')}
          actions={
            errors && (
              <Pill tone={errors.length ? 'bad' : 'ok'}>
                {errors.length
                  ? tn(locale, 'jschema.invalid', errors.length)
                  : t(locale, 'jschema.valid')}
              </Pill>
            )
          }
        >
          <textarea
            class="code"
            spellcheck={false}
            style="min-height:260px"
            aria-label={t(locale, 'jschema.document')}
            value={docText}
            onInput={(e) => setDocText(e.currentTarget.value)}
          />
          {!doc.ok && (
            <p class="err" role="alert">
              {doc.message}
            </p>
          )}
        </Pane>
      </div>
      {errors && errors.length > 0 && (
        <Table
          label={t(locale, 'jschema.errors')}
          header={[
            t(locale, 'jdiff.path'),
            t(locale, 'jschema.rule'),
            t(locale, 'jschema.message'),
          ]}
          rows={errors.map((e) => ({
            cells: [e.path || t(locale, 'jschema.root'), e.keyword, e.message],
          }))}
        />
      )}
    </>
  );
}
