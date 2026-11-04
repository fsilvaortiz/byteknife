import { describe, expect, it } from 'vitest';
import { NotImplementedError } from './index';
import { web, webCapabilities } from './web';

describe('plataforma web', () => {
  it('declara los límites del navegador', () => {
    expect(webCapabilities({})).toEqual({
      cors: true,
      freeHeaders: false,
      cookies: false,
      customTls: false,
      folders: false,
    });
  });

  it('detecta la File System Access API', () => {
    expect(webCapabilities({ showDirectoryPicker: () => {} }).folders).toBe(true);
  });

  it('http y fs quedan para F7', async () => {
    await expect(
      web.http({ method: 'GET', url: 'https://example.com', headers: [] }),
    ).rejects.toBeInstanceOf(NotImplementedError);
    expect(() => web.fs()).toThrow(NotImplementedError);
  });
});
