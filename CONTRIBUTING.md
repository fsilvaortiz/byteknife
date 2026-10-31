# Cómo contribuir

Gracias por querer mejorar ByteKnife. Las issues y los PR pueden escribirse en español, inglés o portugués.

## La promesa de privacidad

ByteKnife existe porque todo corre en el navegador. Un PR que la rompa no se acepta, aunque la función sea útil:

- Ningún dato del usuario sale de la pestaña: nada de `fetch`, `XMLHttpRequest`, `sendBeacon` ni WebSockets con lo que el usuario pega o escribe.
- Sin scripts, fuentes ni estilos de terceros. Todo se sirve desde el propio sitio.
- Sin cookies ni rastreo.

Si encuentras una forma en que un dato se filtra, no abras una issue pública: sigue [`SECURITY.md`](SECURITY.md).

## Preparar el entorno

Requiere Node 24 (ver `.nvmrc`) y pnpm 10.

```sh
pnpm install
pnpm exec playwright install chromium   # solo la primera vez, para los e2e
pnpm dev
```

## Antes de abrir un PR

El CI ejecuta lo mismo; córrelo en local para no esperar:

```sh
pnpm lint
pnpm format:check   # pnpm format lo arregla
pnpm test           # Vitest con cobertura
pnpm build          # incluye astro check
pnpm size           # presupuesto de JS
pnpm lighthouse     # Lighthouse CI sobre dist/ (≥ 95; SEO = 100)
pnpm e2e            # Playwright + axe, offline, privacidad y CSP
```

`pnpm lighthouse` necesita Chrome; si no lo encuentra, apunta `CHROME_PATH` a un Chromium (por ejemplo, el que instala Playwright).

## Agregar o cambiar una herramienta

Cada herramienta es una carpeta en `src/tools/<id>/` y el núcleo la descubre sola. El contrato completo está en [`docs/tool-contract.md`](docs/tool-contract.md). En resumen:

- `meta.ts`: id, categoría, textos en los tres idiomas y, si aplica, `detect()`.
- `logic.ts`: funciones puras, sin DOM. Su cobertura debe ser de al menos 90 %; el CI falla si baja.
- `logic.test.ts`: casos normales y casos borde.
- `Tool.tsx`: island de Preact que usa solo los componentes de `src/ui/`.
- Un e2e en `tests/e2e/` que cubra el flujo principal.

Antes de empezar una herramienta nueva, abre una issue con la plantilla «Herramienta nueva» para acordar el alcance.

## Reglas del código

- **Textos:** toda cadena visible va en `src/i18n/es.json`, `en.json` y `pt.json`. Nunca texto escrito directo en un componente. Si no hablas uno de los idiomas, deja la traducción lo mejor posible y avísalo en el PR.
- **Peso:** el JS inicial no puede pasar de 50 KB gzip. Una librería pesada se carga con `import()` dinámico dentro de la herramienta que la usa.
- **Accesibilidad:** todo debe poder usarse solo con teclado y pasar axe sin violaciones.
- **Dependencias:** agrega una solo si ahorra trabajo real; explica en el PR por qué hace falta.

## Commits y PR

- Un PR por cambio coherente; mejor varios PR chicos que uno grande.
- Describe qué cambia y cómo lo probaste. La plantilla del PR trae una lista de verificación.
- Al contribuir aceptas que tu código se publique bajo la [licencia MIT](LICENSE).

## Conducta

Este proyecto sigue un [código de conducta](CODE_OF_CONDUCT.md).
