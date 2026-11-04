import { useEffect, useState } from 'preact/hooks';

/**
 * false en el HTML prerenderizado y true tras hidratar. Úsalo para lo que depende del
 * navegador (localStorage, hora actual) y así evitar diferencias de hidratación.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
