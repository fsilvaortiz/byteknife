# Analítica

ByteKnife cuenta visitas por página, sin cookies ni scripts de terceros. Es lo único que el navegador envía al servidor.

## Qué se guarda

Cada página, al cargarse, envía con `navigator.sendBeacon` a `/api/visit` (mismo origen, permitido por `connect-src 'self'`):

- `p`: la ruta de la página, por ejemplo `/es/json/`.
- `r`: el dominio desde el que se llegó, por ejemplo `news.ycombinator.com`, o vacío si fue directo o desde el mismo sitio. Nunca la URL completa.

El Worker (`worker/index.ts`) valida ambos campos con `parseVisit` (`src/core/visit.ts`) y descarta todo lo que no sea una ruta del sitio o un dominio. Guarda el resultado en Workers Analytics Engine (dataset `byteknife_visits`, retención de 3 meses). No se guardan IP, user agent, cookies ni identificadores, y nada de lo que se escribe en las herramientas. El e2e `privacy.spec.ts` comprueba el cuerpo exacto que se envía.

Las vistas previas de cada PR no tienen el binding `VISITS`, así que no cuentan.

## Consultar los datos

Con la [API SQL de Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/) y un token con permiso _Account Analytics: Read_:

```sh
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/analytics_engine/sql" \
  -H "Authorization: Bearer $API_TOKEN" \
  --data "SELECT blob1 AS page, SUM(_sample_interval) AS visits
          FROM byteknife_visits
          WHERE timestamp > NOW() - INTERVAL '7' DAY
          GROUP BY page ORDER BY visits DESC"
```

Para ver de dónde llegan las visitas, agrupa por `blob2` en vez de `blob1`.
