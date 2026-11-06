/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Prefijo de las rutas internas: '' en la web, '#' en la app de escritorio (core/paths.ts). */
  readonly VITE_BK_ROUTE_PREFIX?: string;
}
