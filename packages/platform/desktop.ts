// Plataforma de escritorio (Tauri): las llamadas HTTP salen de Rust (reqwest, vía
// tauri-plugin-http), sin CORS ni cabeceras prohibidas, y los archivos se leen con
// tauri-plugin-fs dentro de las carpetas que el usuario eligió. Los plugins se cargan con
// import() para que este módulo también cargue fuera de Tauri (Node, navegador).
import type { Capabilities, FileSystem, HttpRequest, HttpResponse, Platform } from './index';

export const desktopCapabilities: Capabilities = {
  cors: false,
  freeHeaders: true,
  cookies: true,
  customTls: true,
  folders: true,
};

const now = () => performance.now();

export async function desktopHttp(request: HttpRequest): Promise<HttpResponse> {
  const { fetch } = await import('@tauri-apps/plugin-http');
  const start = now();
  const res = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    ...(request.body === undefined ? {} : { body: request.body }),
  });
  const body = new Uint8Array(await res.arrayBuffer());
  return {
    status: res.status,
    statusText: res.statusText,
    headers: [...res.headers.entries()],
    body,
    durationMs: Math.round(now() - start),
  };
}

export const desktopFs: FileSystem = {
  async readText(path) {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    return readTextFile(path);
  },
  async writeText(path, text) {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    await writeTextFile(path, text);
  },
  async list(path) {
    const { readDir } = await import('@tauri-apps/plugin-fs');
    return (await readDir(path)).map((entry) => entry.name).sort();
  },
};

export const desktop: Platform = {
  capabilities: () => desktopCapabilities,
  http: desktopHttp,
  fs: () => desktopFs,
};
