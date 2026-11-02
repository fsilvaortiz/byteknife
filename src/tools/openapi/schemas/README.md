# Esquemas de OpenAPI

Esquemas JSON oficiales de la OpenAPI Initiative, sin cambios salvo el formato:

| Archivo         | Origen                                              |
| --------------- | --------------------------------------------------- |
| `oas-2.0.json`  | https://spec.openapis.org/oas/2.0/schema/2017-08-27 |
| `oas-3.0.json`  | https://spec.openapis.org/oas/3.0/schema/2024-10-18 |
| `oas-3.1.json`  | https://spec.openapis.org/oas/3.1/schema/2026-08-03 |
| `oas-3.2.json`  | https://spec.openapis.org/oas/3.2/schema/2026-08-30 |
| `draft-04.json` | http://json-schema.org/draft-04/schema (lo usa 2.0) |

Los esquemas de OpenAPI se publican bajo la licencia Apache 2.0
(https://github.com/OAI/OpenAPI-Specification/blob/main/LICENSE).

Para actualizar uno, descarga la versión nueva con `Accept: application/json`, reemplaza el
archivo y corre `pnpm test src/tools/openapi`.
