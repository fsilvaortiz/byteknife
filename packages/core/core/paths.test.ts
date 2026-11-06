import { afterEach, describe, expect, it, vi } from 'vitest';

// El prefijo se lee al cargar el módulo: cada caso lo importa de nuevo con su entorno.
async function load(prefix: string | undefined) {
  vi.resetModules();
  vi.stubEnv('VITE_BK_ROUTE_PREFIX', prefix);
  return import('./paths');
}

afterEach(() => vi.unstubAllEnvs());

describe('rutas', () => {
  it('sin prefijo (web) son rutas reales del sitio', async () => {
    const { homePath, toolPath } = await load(undefined);
    expect(homePath('es')).toBe('/es/');
    expect(toolPath('pt', 'json')).toBe('/pt/json/');
  });

  it('con prefijo # (app de escritorio) son rutas con hash', async () => {
    const { homePath, toolPath } = await load('#');
    expect(homePath('en')).toBe('#/en/');
    expect(toolPath('es', 'jwt')).toBe('#/es/jwt/');
  });
});
