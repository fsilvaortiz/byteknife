# ByteKnife

Utilidades para desarrolladores que corren 100 % en el navegador: [byteknife.dev](https://byteknife.dev).

Nada de lo que pegas sale de tu pestaña. No hay cookies ni scripts de terceros. Lo único que llega al servidor es un contador anónimo de visitas: la ruta de la página y el dominio desde el que llegaste (ver [`docs/analytics.md`](docs/analytics.md)).

## Desarrollo

Requiere Node 24 y pnpm 10.

```sh
pnpm install
pnpm dev       # servidor local
pnpm test      # pruebas unitarias (Vitest)
pnpm e2e       # pruebas end-to-end (Playwright)
pnpm build     # build estático en apps/web/dist/
pnpm size      # presupuesto de JS
pnpm lighthouse # Lighthouse CI con los umbrales del plan
```

### Estructura

Es un workspace de pnpm. Los comandos de arriba se corren desde la raíz.

| Carpeta             | Contenido                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `packages/core`     | Herramientas (`tools/<id>/`), componentes de UI, i18n y estilos. Se usa como fuente TypeScript, sin build propio. |
| `packages/platform` | Interfaz común entre la web y la futura app de escritorio: `http()`, `fs()` y `capabilities()`.                   |
| `apps/web`          | El sitio: Astro, páginas, shell, service worker, e2e y el Worker del contador de visitas.                         |

El contrato para agregar herramientas está en [`docs/tool-contract.md`](docs/tool-contract.md).

## Contribuir

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md). Las vulnerabilidades se reportan en privado según [`SECURITY.md`](SECURITY.md).

## Licencia

[MIT](LICENSE)
