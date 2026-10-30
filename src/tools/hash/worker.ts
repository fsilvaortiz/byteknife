import { hashAll } from './logic';

// Los archivos grandes se procesan aquí para no congelar la pestaña.
// Recibe el ArrayBuffer transferido y responde con los resúmenes.
self.onmessage = async (e: MessageEvent<ArrayBuffer>) => {
  try {
    self.postMessage({ ok: true, digests: await hashAll(new Uint8Array(e.data)) });
  } catch {
    self.postMessage({ ok: false });
  }
};
