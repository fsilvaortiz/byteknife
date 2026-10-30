// Todo se guarda solo en este navegador. Cada acceso va en try/catch: el almacenamiento
// puede no existir (modo privado, datos bloqueados) y la página debe seguir funcionando.
const PREFIX = 'byteknife:';

export const local = () => localStorage;
export const session = () => sessionStorage;

export function read<T>(storage: () => Storage, key: string, fallback: T): T {
  try {
    const v = storage().getItem(PREFIX + key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

export function write(storage: () => Storage, key: string, value: unknown): void {
  try {
    if (value === undefined) storage().removeItem(PREFIX + key);
    else storage().setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento disponible: se pierde la preferencia, nada más.
  }
}
