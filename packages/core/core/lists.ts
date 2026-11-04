export const MAX_RECENTS = 10;

export function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function pushRecent(list: string[], id: string, max = MAX_RECENTS): string[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, max);
}
