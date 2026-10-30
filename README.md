# ByteKnife

Utilidades para desarrolladores que corren 100 % en el navegador: [byteknife.dev](https://byteknife.dev).

Nada de lo que pegas sale de tu pestaña. No hay backend, cookies ni scripts de terceros.

## Desarrollo

Requiere Node 24 y pnpm 10.

```sh
pnpm install
pnpm dev       # servidor local
pnpm test      # pruebas unitarias (Vitest)
pnpm e2e       # pruebas end-to-end (Playwright)
pnpm build     # build estático en dist/
pnpm size      # presupuesto de JS
```

El contrato para agregar herramientas está en [`docs/tool-contract.md`](docs/tool-contract.md).

## Contribuir

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md). Las vulnerabilidades se reportan en privado según [`SECURITY.md`](SECURITY.md).

## Licencia

[MIT](LICENSE)
