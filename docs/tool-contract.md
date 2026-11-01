# Contrato de herramienta

Cada herramienta vive en `src/tools/<id>/` y el núcleo la descubre automáticamente con `import.meta.glob`. La lógica pura se separa de la interfaz, de modo que se puede probar sin navegador y reutilizar desde la detección.

```
src/tools/jwt/
  meta.ts        id, categoría, nombre y descripción por idioma, keywords, detect()
  logic.ts       funciones puras: decode(), verifyHmac(), claimsTimeline()
  detect.ts      (opcional) lo mínimo que necesita detect(); logic.ts lo re-exporta
  logic.test.ts  pruebas Vitest con casos borde
  Tool.tsx       island de Preact; recibe initialInput y usa los componentes compartidos
  content/       es.md, en.md, pt.md: explicación corta, ejemplos y FAQ para SEO
```

El tipo vive en `src/core/types.ts`:

```ts
export interface ToolMeta {
  id: string; // slug estable: forma parte de la URL (/es/<id>/)
  category: 'data' | 'encoding' | 'generators' | 'time' | 'text' | 'web' | 'net';
  order: number; // posición dentro de su categoría en el catálogo y el rail
  i18n: Record<Locale, ToolText>;
  detect?: (input: string) => { label: string; confidence: number } | null;
  heavy?: boolean; // true = la lógica se ejecuta en un Web Worker
}

export interface ToolText {
  name: string;
  description: string;
  keywords: string[];
  labels?: Record<string, string>; // textos de las etiquetas que devuelve detect()
}
```

## Contenido SEO

Cada idioma tiene su `content/<idioma>.md`, que la página de la herramienta muestra bajo la herramienta. El esquema está en `src/content.config.ts` y `src/core/content.test.ts` revisa que existan los tres idiomas:

```md
---
title: 'Decodificar JWT y verificar la firma HS256' # <title>, hasta 60 caracteres
description: 'Decodifica un JWT y lee…' # meta description, 70–160 caracteres
examples: # exactamente 2; las salidas, copiadas de lo que muestra la herramienta
  - title: 'Leer un token'
    input: |
      eyJhbGciOi…
    output: |
      …
faq: # al menos 3; también se publican como JSON-LD FAQPage
  - q: '¿Es seguro pegar un JWT de producción aquí?'
    a: 'El token se procesa solo en esta pestaña…'
---

Explicación de 150–300 palabras: qué resuelve, opciones y casos de uso.
```

## Reglas

- `detect()` es pura y barata, con un límite de 5 ms. Corre sobre cada pegado en el home y en la búsqueda rápida. La herramienta con mayor `confidence` se abre al presionar Enter.
- `detect()` devuelve una clave en `label`, no un texto: el texto visible va en `i18n[locale].labels[clave]`, en los tres idiomas.
- Si `detect()` necesita lógica no trivial (por ejemplo, decodificar o parsear), esa lógica va en `detect.ts`, que `logic.ts` re-exporta y prueba. `meta.ts` importa de `detect.ts`, nunca de `logic.ts`: el registro carga todos los `meta.ts` en cada página y, si importa `logic.ts`, cada página arrastra la lógica completa de todas las herramientas.
- La entrada que el usuario pegó en el home o en la búsqueda llega con `takePendingInput(id)` de `src/core/store.ts`; nunca viaja en la URL.
- `Tool.tsx` abre siempre con un ejemplo realista y procesa la entrada en vivo con debounce.
- Si el primer resultado es asíncrono (una librería con `import()`, Web Crypto), `Tool.tsx` exporta `waitsForResult = true` y llama a `useReady(hayResultado, onReady)` de `src/ui/useReady.ts`. Así ToolHost mantiene la altura reservada hasta que el resultado aparece y el contenido de abajo no salta (CLS). Los elementos que aparecen después, como una píldora de estado, van donde no cambien el alto de la barra (por ejemplo, en la cabecera del panel).
- La UI usa solo los componentes compartidos de `src/ui/` (`Pane`, `KeyValue`, `Segmented`, `CopyButton`, `Pill`, `CodeOutput`), para que el estilo sea consistente.
- Las librerías externas se cargan solo dentro de la herramienta que las necesita, con `import()` dinámico, desde `logic.ts` (por ejemplo, `await import('yaml')` dentro de la función). Si `logic.ts` las importa de forma estática, pesan en el JS inicial de la página.
- Nada que genere código en tiempo de ejecución (`eval`, `new Function`): la CSP lo bloquea. Por eso JSON Schema usa `@cfworker/json-schema` y no ajv.
- Las herramientas de referencia (códigos HTTP, puertos, directivas CSP) guardan sus datos en `data.ts`, con los textos de cada idioma en un `Record<Locale, string>`. Los nombres propios (protocolos, productos, cabeceras) no se traducen.
- Datos grandes que no son código, como la base OUI de la herramienta MAC, se sirven como módulo virtual de Vite (`integrations/oui-data.mjs`) y se importan con `import()` solo donde se usan.
- `logic.ts` y `detect.ts` deben tener cobertura de pruebas de al menos 90 % antes de publicarse.
- Ninguna herramienta hace `fetch` con datos del usuario. El e2e `privacy.spec.ts` escribe un centinela en cada campo de cada herramienta y falla si aparece en la red o si sale una request a otro origen.
- Nada de atributos `style="…"` en el HTML prerenderizado: la CSP los bloquea. Los estilos van en CSS; los que Preact aplica desde el cliente sí funcionan.
- Al agregar una herramienta o cambiar su alto inicial, corre `pnpm build && pnpm preview` y luego `pnpm tool-heights`: regenera `src/styles/tool-heights.css`, la altura que se reserva mientras la herramienta carga para que el texto de abajo no salte. El e2e `layout.spec.ts` avisa si quedó desactualizada.

## Referencia

Las pruebas de `logic.ts` y el e2e de cada herramienta fijan su comportamiento esperado: ejemplos iniciales, mensajes de error y casos de detección.
