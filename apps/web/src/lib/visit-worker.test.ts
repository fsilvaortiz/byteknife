import { describe, expect, it, vi } from 'vitest';
import worker from '../../worker/index';

function env(withVisits = true) {
  const assets = { fetch: vi.fn(async () => new Response('asset')) };
  const visits = { writeDataPoint: vi.fn() };
  return { assets, visits, env: { ASSETS: assets, ...(withVisits ? { VISITS: visits } : {}) } };
}

const post = (body: string) =>
  new Request('https://byteknife.dev/api/visit', { method: 'POST', body });

describe('worker /api/visit', () => {
  it('guarda la ruta y el dominio de origen', async () => {
    const e = env();
    const res = await worker.fetch(post('{"p":"/en/jwt/","r":"news.ycombinator.com"}'), e.env);
    expect(res.status).toBe(204);
    expect(e.visits.writeDataPoint).toHaveBeenCalledWith({
      blobs: ['/en/jwt/', 'news.ycombinator.com'],
      indexes: ['/en/jwt/'],
    });
  });

  it('descarta cuerpos inválidos, demasiado grandes o con otro método', async () => {
    const e = env();
    expect((await worker.fetch(post('no json'), e.env)).status).toBe(204);
    expect((await worker.fetch(post('{"p":"/es/json/?token=x"}'), e.env)).status).toBe(204);
    expect((await worker.fetch(post('x'.repeat(2000)), e.env)).status).toBe(413);
    const get = new Request('https://byteknife.dev/api/visit');
    expect((await worker.fetch(get, e.env)).status).toBe(405);
    expect(e.visits.writeDataPoint).not.toHaveBeenCalled();
  });

  it('en una vista previa (sin VISITS) responde sin guardar', async () => {
    const e = env(false);
    expect((await worker.fetch(post('{"p":"/"}'), e.env)).status).toBe(204);
  });

  it('cualquier otra ruta la sirven los assets', async () => {
    const e = env();
    const res = await worker.fetch(new Request('https://byteknife.dev/api/otra'), e.env);
    expect(await res.text()).toBe('asset');
    expect(e.assets.fetch).toHaveBeenCalledOnce();
  });
});
