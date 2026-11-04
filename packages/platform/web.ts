// Plataforma web: el navegador impone CORS y las cabeceras prohibidas, no expone Set-Cookie
// ni permite certificados propios. Las carpetas dependen de la File System Access API.
import { NotImplementedError, type Capabilities, type Platform } from './index';

export function webCapabilities(scope: object = globalThis): Capabilities {
  return {
    cors: true,
    freeHeaders: false,
    cookies: false,
    customTls: false,
    folders: 'showDirectoryPicker' in scope,
  };
}

export const web: Platform = {
  capabilities: () => webCapabilities(),
  http: () => Promise.reject(new NotImplementedError('http')),
  fs: () => {
    throw new NotImplementedError('fs');
  },
};
