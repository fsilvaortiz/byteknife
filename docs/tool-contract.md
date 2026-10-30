# Contrato de herramienta

Cada herramienta vive en `src/tools/<id>/` y el núcleo la descubre automáticamente con `import.meta.glob`. La lógica pura se separa de la interfaz, de modo que se puede probar sin navegador y reutilizar desde la detección.

```
src/tools/jwt/
  meta.ts        id, categoría, nombre y descripción por idioma, keywords, detect()
  logic.ts       funciones puras: decode(), verifyHmac(), claimsTimeline()
  logic.test.ts  pruebas Vitest con casos borde
  Tool.tsx       island de Preact; recibe initialInput y usa los componentes compartidos
  content/       es.md, en.md, pt.md: explicación corta, ejemplos y FAQ para SEO
```

```ts
export interface ToolMeta {
  id: string; // slug estable: forma parte de la URL
  category: 'data' | 'encoding' | 'generators' | 'time' | 'text' | 'web';
  i18n: Record<Locale, { name: string; description: string; keywords: string[] }>;
  detect?: (input: string) => { label: string; confidence: number } | null;
  heavy?: boolean; // true = la lógica se ejecuta en un Web Worker
}
```

## Reglas

- `detect()` es pura y barata, con un límite de 5 ms. Corre sobre cada pegado en el home y en la búsqueda rápida. La herramienta con mayor `confidence` se abre al presionar Enter.
- `Tool.tsx` abre siempre con un ejemplo realista y procesa la entrada en vivo con debounce.
- La UI usa solo los componentes compartidos de `src/ui/` (`Pane`, `KeyValue`, `Segmented`, `CopyButton`, `Pill`, `CodeOutput`), para que el estilo sea consistente.
- Las librerías externas se cargan solo dentro de la herramienta que las necesita, con `import()` dinámico.
- `logic.ts` debe tener cobertura de pruebas de al menos 90 % antes de publicarse.
- Ninguna herramienta hace `fetch` con datos del usuario.

## Referencia

Las pruebas de `logic.ts` y el e2e de cada herramienta fijan su comportamiento esperado: ejemplos iniciales, mensajes de error y casos de detección.
