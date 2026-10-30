import { signal } from '@preact/signals';
import { pushRecent, toggleIn } from './lists';

// Todo se guarda solo en este navegador. Cada acceso va en try/catch: el almacenamiento
// puede no existir (modo privado, datos bloqueados) y la página debe seguir funcionando.
const PREFIX = 'byteknife:';

function read<T>(storage: () => Storage, key: string, fallback: T): T {
  try {
    const v = storage().getItem(PREFIX + key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

function write(storage: () => Storage, key: string, value: unknown): void {
  try {
    if (value === undefined) storage().removeItem(PREFIX + key);
    else storage().setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento disponible: se pierde la preferencia, nada más.
  }
}

const local = () => localStorage;
const session = () => sessionStorage;
const isBrowser = typeof window !== 'undefined';

export const favorites = signal<string[]>(isBrowser ? read(local, 'favs', []) : []);
export const recents = signal<string[]>(isBrowser ? read(local, 'recent', []) : []);

export function toggleFavorite(id: string): boolean {
  favorites.value = toggleIn(favorites.value, id);
  write(local, 'favs', favorites.value);
  return favorites.value.includes(id);
}

export function recordVisit(id: string): void {
  recents.value = pushRecent(recents.value, id);
  write(local, 'recent', recents.value);
}

/** Entrada pegada que viaja del home o la búsqueda a la herramienta, sin pasar por la URL. */
export function setPendingInput(id: string, input: string): void {
  write(session, 'pending', { id, input });
}

export function takePendingInput(id: string): string | null {
  const p = read<{ id: string; input: string } | null>(session, 'pending', null);
  if (!p || p.id !== id) return null;
  write(session, 'pending', undefined);
  return p.input;
}
