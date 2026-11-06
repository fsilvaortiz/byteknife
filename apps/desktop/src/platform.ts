import { isTauri } from '@tauri-apps/api/core';
import type { Platform } from '@byteknife/platform';
import { desktop } from '@byteknife/platform/desktop';
import { web } from '@byteknife/platform/web';

/** Dentro de Tauri, la plataforma de escritorio; en un navegador (e2e), la web. */
export const platform: Platform = isTauri() ? desktop : web;
