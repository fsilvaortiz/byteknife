import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, tn, type Locale, type MessageKey } from '../../i18n';
import KeyValue from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import { useDebounced } from '../../ui/useDebounced';
import { useReady } from '../../ui/useReady';
import { validateOpenApi, type OpenApiResult, type Problem } from './logic';

const SPEC = `openapi: 3.1.0
info:
  title: Pedidos API
  version: 2.14.0
servers:
  - url: https://api.ejemplo.dev/v2
paths:
  /pedidos:
    get:
      operationId: listarPedidos
      summary: Lista los pedidos del cliente
      parameters:
        - name: estado
          in: query
          schema:
            enum: [pendiente, pagado, enviado]
      responses:
        '200':
          description: Pedidos encontrados
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pedido'
    post:
      operationId: crearPedido
      summary: Crea un pedido
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pedido'
      responses:
        '201':
          descripton: Pedido creado
  /pedidos/{pedidoId}:
    get:
      operationId: obtenerPedido
      summary: Obtiene un pedido
      responses:
        '200':
          description: El pedido
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pedido'
components:
  schemas:
    Pedido:
      type: object
      required: [id, total]
      properties:
        id: { type: string, format: uuid }
        total: { type: number, minimum: 0 }
        cliente:
          $ref: '#/components/schemas/Cliente'
`;

const where = (locale: Locale, p: Problem) =>
  p.path.length ? p.path.join(' › ') : t(locale, 'oapi.root');

const message = (locale: Locale, p: Problem) =>
  p.raw ?? t(locale, `oapi.${p.code}` as MessageKey, p.params);

// El primer resultado es asíncrono: ToolHost reserva la altura hasta useReady.
export const waitsForResult = true;

export default function OpenApiTool({ locale, initialInput, onReady }: ToolProps) {
  const [src, setSrc] = useState(initialInput ?? SPEC);
  const [result, setResult] = useState<OpenApiResult | null>(null);
  const text = useDebounced(src, 250);

  useEffect(() => {
    let live = true;
    validateOpenApi(text).then((r) => live && setResult(r));
    return () => {
      live = false;
    };
  }, [text]);

  useReady(result !== null, onReady);

  const ok = result?.ok ? result : null;
  const errors = ok ? ok.problems.filter((p) => p.level === 'error').length : 0;
  const warns = ok ? ok.problems.length - errors : 0;

  return (
    <>
      <Pane
        title={t(locale, 'oapi.input')}
        actions={
          ok && (
            <Pill tone={errors ? 'bad' : warns ? 'warn' : 'ok'}>
              {errors || warns
                ? [
                    errors && tn(locale, 'oapi.errors', errors),
                    warns && tn(locale, 'oapi.warnings', warns),
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : t(locale, 'oapi.valid')}
            </Pill>
          )
        }
      >
        <textarea
          class="code"
          spellcheck={false}
          style="min-height:320px"
          aria-label={t(locale, 'oapi.input')}
          value={src}
          onInput={(e) => setSrc(e.currentTarget.value)}
        />
        {result && !result.ok && (
          <p class="err" role="alert">
            {result.kind === 'version'
              ? t(locale, 'oapi.unknownVersion')
              : t(locale, result.source === 'yaml' ? 'yaml.error' : 'json.error', {
                  ...result.error,
                })}
          </p>
        )}
      </Pane>
      {ok && (
        <KeyValue
          locale={locale}
          rows={[
            {
              key: t(locale, 'oapi.spec'),
              value: `${ok.version === '2.0' ? 'Swagger' : 'OpenAPI'} ${ok.declared}`,
            },
            {
              key: t(locale, 'oapi.api'),
              value: [ok.title, ok.apiVersion].filter(Boolean).join(' · ') || '—',
            },
            {
              key: t(locale, 'oapi.size'),
              value: `${tn(locale, 'oapi.pathCount', ok.pathCount)} · ${tn(locale, 'oapi.opCount', ok.operations.length)}`,
            },
          ]}
        />
      )}
      {ok && ok.problems.length > 0 && (
        <Table
          label={t(locale, 'oapi.problems')}
          header={[t(locale, 'oapi.line'), t(locale, 'oapi.level'), t(locale, 'oapi.detail')]}
          rows={ok.problems.map((p) => ({
            numbers: [p.line ?? null],
            cells: [
              <Pill key="l" tone={p.level === 'error' ? 'bad' : 'warn'}>
                {t(locale, p.level === 'error' ? 'oapi.error' : 'oapi.warn')}
              </Pill>,
              // Mensaje y, debajo, dónde está: la tabla no parte líneas y así queda más angosta.
              <Fragment key="d">
                {message(locale, p)}
                <br />
                <span style="color:var(--muted)">{where(locale, p)}</span>
              </Fragment>,
            ],
          }))}
        />
      )}
      {ok && ok.operations.length > 0 && (
        <Table
          label={t(locale, 'oapi.operations')}
          header={[
            t(locale, 'oapi.method'),
            t(locale, 'oapi.path'),
            'operationId',
            t(locale, 'oapi.summary'),
          ]}
          rows={ok.operations.map((o) => ({
            numbers: [o.method],
            cells: [
              o.path,
              o.operationId ?? '—',
              o.deprecated
                ? `${o.summary ?? ''} (${t(locale, 'oapi.deprecated')})`.trim()
                : (o.summary ?? ''),
            ],
          }))}
        />
      )}
    </>
  );
}
