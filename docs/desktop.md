# ByteKnife para Mac

`apps/desktop` es una app [Tauri 2](https://tauri.app) con las mismas herramientas que la web. El shell es una SPA de Vite + Preact que monta `packages/core` (herramientas, `shell/` y estilos). Las rutas usan hash (`#/es/json/`): `core/paths.ts` les agrega el prefijo cuando `VITE_BK_ROUTE_PREFIX` vale `#`.

La app no tiene telemetría. Lo único que consulta por su cuenta es si hay una versión nueva en GitHub Releases. Las llamadas HTTP del cliente (F7) salen directo de tu Mac al destino que escribas.

## Requisitos

- Node 24 y pnpm 10, como la web.
- Rust estable (`rustup`) con los targets `aarch64-apple-darwin` y `x86_64-apple-darwin` para el binario universal.
- Command Line Tools de Xcode (`xcode-select --install`). No hace falta Xcode completo.

## Comandos (desde la raíz)

```sh
pnpm desktop:dev     # abre la app con recarga en vivo (Vite en el puerto 1420)
pnpm desktop:build   # ByteKnife.app y .dmg universales en apps/desktop/src-tauri/target/
pnpm desktop:e2e     # Playwright en WebKit contra el SPA (sin Tauri)
```

`desktop:build` corre con `CI=true`: así el `.dmg` se arma sin pedirle al Finder que acomode la ventana con AppleScript, que se queda sin tiempo si la terminal no tiene permiso de Automatización. También firma los artefactos del updater: necesita `TAURI_SIGNING_PRIVATE_KEY` y `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` en el entorno. Sin ellos, usa `pnpm --filter @byteknife/desktop tauri build --target universal-apple-darwin --no-bundle` o desactiva `createUpdaterArtifacts` en local.

## Permisos

`src-tauri/capabilities/default.json` lista todo lo que la ventana puede pedir a Rust: HTTP a `http://*` y `https://*` (las llamadas las arma el usuario), leer y escribir texto y listar carpetas que el usuario eligió con el diálogo, el updater y reiniciar. No hay `shell` ni acceso libre al disco. La CSP de la app está en `tauri.conf.json`.

Los links que no son rutas internas (por ejemplo, los de una vista previa de Markdown) no navegan: sacarían a la ventana de la app sin forma de volver (`src/links.ts`).

## Publicar una versión

1. Sube la versión en `apps/desktop/package.json` y en `src-tauri/Cargo.toml`.
2. Crea y sube el tag `desktop-v<versión>`. El workflow `desktop-release.yml` compila en macOS y deja un borrador de Release con el `.dmg`, el `.app.tar.gz` firmado y `latest.json`.
3. Revisa el borrador y publícalo. Recién entonces el updater de las versiones instaladas lo ve.

### Secrets del repositorio

| Secret                                                                      | Para qué                                                                                                                                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`           | Obligatorios. Firman las actualizaciones; la clave pública está en `tauri.conf.json`. Si se pierde la privada, las versiones instaladas no podrán actualizarse. |
| `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY` | Opcionales. Certificado «Developer ID Application» (`.p12` en base64) para firmar.                                                                              |
| `APPLE_API_ISSUER`, `APPLE_API_KEY`, `APPLE_API_KEY_P8`                     | Opcionales. API key de App Store Connect (contenido del `.p8`) para notarizar.                                                                                  |

## Sin firma de Apple (por ahora)

Hasta tener el certificado Developer ID (Apple Developer Program, USD 99 al año), la app sale sin firmar ni notarizar. macOS la bloquea al abrirla con doble clic. Para abrirla: clic derecho sobre ByteKnife.app → Abrir → Abrir. Es una sola vez por versión.

El updater funciona igual: verifica su propia firma (minisign), no la de Apple.
