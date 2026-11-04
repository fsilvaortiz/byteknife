import { signal } from '@preact/signals';
import { pushRecent, toggleIn } from './lists';
import { local, read, session, write } from './storage';

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
