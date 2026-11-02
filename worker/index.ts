// Worker de byteknife.dev. Sirve dist/ tal cual; solo /api/* pasa por aquí
// (run_worker_first en wrangler.jsonc). /api/visit guarda en Workers Analytics Engine la
// ruta y el dominio de origen de una visita (src/core/visit.ts): nada más.
import { parseVisit } from '../src/core/visit';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Ausente en las vistas previas de cada PR: así no ensucian los datos. */
  VISITS?: { writeDataPoint(point: { blobs?: string[]; indexes?: string[] }): void };
}

const MAX_BODY = 1024;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/visit') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response(null, { status: 405 });

    const text = await request.text();
    if (text.length > MAX_BODY) return new Response(null, { status: 413 });
    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch {
      // cuerpo inválido: se descarta
    }
    const visit = parseVisit(body);
    if (visit)
      env.VISITS?.writeDataPoint({ blobs: [visit.path, visit.ref], indexes: [visit.path] });
    return new Response(null, { status: 204 });
  },
};
