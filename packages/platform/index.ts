// Interfaz común entre la web (apps/web) y la app de escritorio (apps/desktop, F6b). Las
// herramientas preguntan qué permite la plataforma con capabilities() en vez de suponerlo.
// http() y fs() se implementan en F7 (cliente HTTP y colecciones en una carpeta).

export interface Capabilities {
  /** Las llamadas HTTP están sujetas a CORS (navegador) o salen sin él (app). */
  cors: boolean;
  /** Se pueden fijar cabeceras prohibidas en el navegador, como Cookie, Host u Origin. */
  freeHeaders: boolean;
  /** Se pueden leer las cookies de sesión (Set-Cookie) de una respuesta. */
  cookies: boolean;
  /** Se aceptan certificados autofirmados y mTLS. */
  customTls: boolean;
  /** Se puede elegir una carpeta del disco para guardar colecciones. */
  folders: boolean;
}

export interface HttpRequest {
  method: string;
  url: string;
  headers: [name: string, value: string][];
  body?: string | Uint8Array<ArrayBuffer>;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: [name: string, value: string][];
  body: Uint8Array;
  /** Milisegundos desde que salió la llamada hasta que llegó el último byte. */
  durationMs: number;
}

export interface FileSystem {
  readText(path: string): Promise<string>;
  writeText(path: string, text: string): Promise<void>;
  list(path: string): Promise<string[]>;
}

export interface Platform {
  capabilities(): Capabilities;
  http(request: HttpRequest): Promise<HttpResponse>;
  fs(): FileSystem;
}

/** La plataforma todavía no implementa esta función (llega en F7). */
export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature}: not implemented`);
    this.name = 'NotImplementedError';
  }
}
