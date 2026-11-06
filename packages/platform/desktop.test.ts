import { beforeEach, describe, expect, it, vi } from 'vitest';
import { desktop, desktopCapabilities } from './desktop';

const fetchMock = vi.fn();
const fsMock = { readTextFile: vi.fn(), writeTextFile: vi.fn(), readDir: vi.fn() };

vi.mock('@tauri-apps/plugin-http', () => ({ fetch: (...args: unknown[]) => fetchMock(...args) }));
vi.mock('@tauri-apps/plugin-fs', () => fsMock);

beforeEach(() => {
  fetchMock.mockReset();
  Object.values(fsMock).forEach((m) => m.mockReset());
});

describe('plataforma de escritorio', () => {
  it('no tiene los límites del navegador', () => {
    expect(desktop.capabilities()).toBe(desktopCapabilities);
    expect(desktopCapabilities).toEqual({
      cors: false,
      freeHeaders: true,
      cookies: true,
      customTls: true,
      folders: true,
    });
  });

  it('http() pasa la llamada tal cual y convierte la respuesta', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"ok":true}', {
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json', 'set-cookie': 'sid=1' },
      }),
    );
    const res = await desktop.http({
      method: 'POST',
      url: 'https://api.example.com/items',
      headers: [
        ['Cookie', 'a=b'],
        ['Origin', 'https://x.test'],
      ],
      body: '{"name":"x"}',
    });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/items', {
      method: 'POST',
      headers: [
        ['Cookie', 'a=b'],
        ['Origin', 'https://x.test'],
      ],
      body: '{"name":"x"}',
    });
    expect(res.status).toBe(201);
    expect(res.statusText).toBe('Created');
    expect(res.headers).toContainEqual(['content-type', 'application/json']);
    expect(new TextDecoder().decode(res.body)).toBe('{"ok":true}');
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('http() sin cuerpo no envía body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await desktop.http({ method: 'GET', url: 'http://localhost:8080/', headers: [] });
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ method: 'GET', headers: [] });
  });

  it('fs() lee, escribe y lista con tauri-plugin-fs', async () => {
    fsMock.readTextFile.mockResolvedValue('hola');
    fsMock.readDir.mockResolvedValue([{ name: 'b.yml' }, { name: 'a.yml' }]);
    const fs = desktop.fs();
    expect(await fs.readText('/c/a.yml')).toBe('hola');
    await fs.writeText('/c/b.yml', 'x: 1');
    expect(fsMock.writeTextFile).toHaveBeenCalledWith('/c/b.yml', 'x: 1');
    expect(await fs.list('/c')).toEqual(['a.yml', 'b.yml']);
  });
});
